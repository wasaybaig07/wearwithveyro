import { action } from "./_generated/server";
import { v } from "convex/values";

const ADMIN_PHONE = "923186590081";

export const sendNewOrderAlert = action({
  args: {
    orderId: v.string(),
    customerName: v.string(),
    total: v.number(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.WHATSAPP_API_KEY;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!apiKey || !phoneNumberId) {
      console.error("WHATSAPP_API_KEY or WHATSAPP_PHONE_NUMBER_ID not set — skipping WhatsApp alert.");
      return { sent: false };
    }

    const messageBody = `New Order — ${args.orderId}\nCustomer: ${args.customerName}\nTotal: Rs. ${args.total.toLocaleString("en-PK")}`;

    try {
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: ADMIN_PHONE,
            type: "text",
            text: { body: messageBody },
          }),
        }
      );

      if (!res.ok) {
        const body = await res.text();
        console.error("WhatsApp API error:", res.status, body);
        return { sent: false, error: body };
      }

      return { sent: true };
    } catch (err) {
      console.error("WhatsApp request failed:", err);
      return { sent: false, error: String(err) };
    }
  },
});
