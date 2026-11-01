import os
import hashlib
import hmac
import json
import logging

from fastapi import FastAPI, HTTPException, Request, Response
import httpx
import requests

app = FastAPI()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("webhook")

META_VERIFY_TOKEN = os.environ.get("META_VERIFY_TOKEN", "")
META_APP_SECRET = os.environ.get("META_APP_SECRET", "")
WHATSAPP_API_KEY = os.environ.get("WHATSAPP_API_KEY", "")
WHATSAPP_PHONE_NUMBER_ID = os.environ.get("WHATSAPP_PHONE_NUMBER_ID", "")
ADMIN_PHONE = os.environ.get("ADMIN_PHONE", "923186590081")

TEMPLATE_NAME = os.environ.get("WHATSAPP_TEMPLATE_NAME", "order_confirmation")


def verify_signature(payload: bytes, signature_header: str | None) -> bool:
    if not META_APP_SECRET or not signature_header:
        return False
    expected = "sha256=" + hmac.new(
        META_APP_SECRET.encode(), payload, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature_header)


async def send_whatsapp_template(
    to: str,
    template_name: str,
    parameters: dict[str, str],
) -> bool:
    if not WHATSAPP_API_KEY or not WHATSAPP_PHONE_NUMBER_ID:
        logger.warning("WHATSAPP_API_KEY or WHATSAPP_PHONE_NUMBER_ID not set")
        return False

    components: list[dict] = [
        {
            "type": "body",
            "parameters": [
                {"type": "text", "text": parameters.get(k, "")}
                for k in ("customer_name", "order_id", "total")
            ],
        }
    ]

    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {"code": "en"},
            "components": components,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"https://graph.facebook.com/v18.0/{WHATSAPP_PHONE_NUMBER_ID}/messages",
                headers={
                    "Authorization": f"Bearer {WHATSAPP_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            if resp.is_error:
                logger.error("WhatsApp API error %s: %s", resp.status_code, resp.text)
                return False
            logger.info("WhatsApp template sent to %s", to)
            return True
    except Exception as exc:
        logger.error("WhatsApp request failed: %s", exc)
        return False


@app.get("/webhook/meta")
async def meta_verify(request: Request):
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    if mode == "subscribe" and token == "Rafay3290":
        logger.info("Meta webhook verified")
        return Response(content=str(int(challenge)), media_type="text/plain")

    logger.warning("Meta verification failed — mode=%s token=%s", mode, token)
    return Response(status_code=403)


@app.post("/webhook/meta")
async def meta_webhook(request: Request):
    raw_body = await request.body()
    sig = request.headers.get("x-hub-signature-256")

    if not verify_signature(raw_body, sig):
        raise HTTPException(status_code=401, detail="Invalid signature")

    payload = json.loads(raw_body)
    logger.info("WhatsApp webhook event received: %s", json.dumps(payload, indent=2))
    return Response(status_code=200)


@app.post("/webhook/payment-success")
async def payment_success(request: Request):
    raw_body = await request.body()
    sig = request.headers.get("x-hub-signature-256")

    if META_APP_SECRET:
        if not sig or not verify_signature(raw_body, sig):
            logger.warning("Signature verification failed")
            return Response(status_code=401)

    try:
        data = json.loads(raw_body)
    except json.JSONDecodeError:
        logger.warning("Invalid JSON payload")
        return Response(status_code=400)

    order_id = data.get("orderId") or data.get("order_id")
    customer_name = data.get("customerName") or data.get("customer_name", "Customer")
    total = data.get("total", "0")

    if not order_id:
        logger.warning("Missing orderId in payment webhook")
        return Response(status_code=400)

    logger.info("Payment confirmed for order %s", order_id)

    await send_whatsapp_template(
        to=ADMIN_PHONE,
        template_name=TEMPLATE_NAME,
        parameters={
            "customer_name": customer_name,
            "order_id": order_id,
            "total": str(total),
        },
    )

    return {"status": "ok", "order_id": order_id}


def send_whatsapp_message(to: str, order_id: str, total_amount: str) -> bool:
    message = (
        f"Thank you for your order #{order_id}!\n"
        f"Total Amount Due: {total_amount}\n\n"
        f"Bank Transfer Details:\n"
        f"Bank Name: XYZ\n"
        f"Account Number: 123456789"
    )
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": message},
    }
    try:
        resp = requests.post(
            f"https://graph.facebook.com/v18.0/{WHATSAPP_PHONE_NUMBER_ID}/messages",
            headers={
                "Authorization": f"Bearer {WHATSAPP_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=15,
        )
        if resp.status_code != 200:
            logger.error("WhatsApp send failed: %s %s", resp.status_code, resp.text)
            return False
        logger.info("WhatsApp message sent to %s for order %s", to, order_id)
        return True
    except requests.RequestException as exc:
        logger.error("WhatsApp request exception: %s", exc)
        return False


@app.post("/checkout")
async def checkout(request: Request):
    data = await request.json()
    customer_phone = data.get("customer_phone")
    order_id = data.get("order_id")
    total_amount = data.get("total_amount")

    if not all([customer_phone, order_id, total_amount]):
        raise HTTPException(status_code=400, detail="Missing required fields")

    send_whatsapp_message(customer_phone, order_id, str(total_amount))
    return {"status": "ok", "order_id": order_id}
