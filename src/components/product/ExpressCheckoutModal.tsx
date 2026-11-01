"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  buildOrderWhatsAppMessage,
  getShippingError,
  initialShipping,
  openWhatsApp,
  PK_CITIES,
  validateEmail,
  type CheckoutMethod,
  type ShippingInfo,
} from "@/lib/checkout";

interface ExpressCheckoutModalProps {
  productId: Id<"products">;
  name: string;
  price: string;
  size: string;
  onClose: () => void;
}

const inputClass =
  "w-full bg-transparent border border-black/15 px-4 py-3 font-body-md text-primary placeholder:text-black/20 focus:border-primary-fixed focus:outline-none transition-colors";

const requiredLabelClass =
  "font-label-bold text-[10px] uppercase tracking-[0.2em] text-secondary";

export default function ExpressCheckoutModal({
  productId,
  name,
  price,
  size,
  onClose,
}: ExpressCheckoutModalProps) {
  const router = useRouter();
  const checkout = useMutation(api.orders.checkout);

  const [shipping, setShipping] = useState<ShippingInfo>(initialShipping);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [emailBlurred, setEmailBlurred] = useState(false);

  const emailError = emailBlurred ? validateEmail(shipping.email) : null;

  const update = useCallback(
    (field: keyof ShippingInfo, value: string) => {
      setShipping((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const processOrder = useCallback(
    async (method: CheckoutMethod) => {
      setError(null);

      const shippingError = getShippingError(shipping);
      if (shippingError) {
        setError(shippingError);
        return;
      }

      setSubmitting(true);
      try {
        const result = await checkout({
          items: [{ productId, quantity: 1, size }],
          customerName: shipping.name,
          email: shipping.email,
          phone: shipping.phone,
          address: shipping.address,
          city: shipping.city,
          postalCode: shipping.postalCode,
          paymentMethod: method,
        });

        if (!result.ok) {
          setError(result.message);
          return;
        }

        if (method === "whatsapp") {
          const text = buildOrderWhatsAppMessage({
            orderId: result.orderId!,
            total: result.total!,
            shipping,
            items: [{ name, size, quantity: 1, price }],
            intro: `Hi! I would like to order the ${name} (Size: ${size}) for ${price}.`,
          });
          openWhatsApp(text);
        }

        router.push(`/checkout/success?orderId=${encodeURIComponent(result.orderId!)}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Checkout failed.");
      } finally {
        setSubmitting(false);
      }
    },
    [checkout, shipping, productId, size, name, price, router],
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-lg border border-black/15 bg-surface-container-low max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto overscroll-contain">
        <div className="sticky top-0 z-10 px-4 sm:px-6 py-4 border-b border-black/15 bg-surface-container-low flex justify-between items-center">
          <h2 className="font-label-bold text-[12px] md:text-[14px] uppercase tracking-widest text-primary">
            Express Checkout
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border border-black/15 font-label-bold text-[10px] uppercase tracking-widest text-secondary hover:border-error hover:text-error transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="border border-black/15 bg-surface-container p-4 flex justify-between items-center">
            <div className="min-w-0">
              <h3 className="font-label-bold text-sm text-primary uppercase tracking-wide truncate">
                {name}
              </h3>
              <p className="font-label-sm text-[11px] text-secondary tracking-wider">
                Size: {size} • Qty: 1
              </p>
            </div>
            <span className="font-label-bold text-sm text-primary-fixed shrink-0 ml-4">
              {price}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <label
                htmlFor="express-name"
                className={`${requiredLabelClass} after:content-['*'] after:ml-1 after:text-red-600`}
              >
                Full Name
              </label>
              <input
                id="express-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                value={shipping.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="John Doe"
                autoFocus
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label
                htmlFor="express-email"
                className={`${requiredLabelClass} after:content-['*'] after:ml-1 after:text-red-600`}
              >
                Email
              </label>
              <input
                id="express-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={shipping.email}
                onChange={(e) => update("email", e.target.value)}
                onBlur={() => setEmailBlurred(true)}
                placeholder="john@gmail.com"
                aria-invalid={emailError ? true : undefined}
                className={`${inputClass} ${emailError ? "border-red-600" : ""}`}
              />
              {emailError && (
                <p role="alert" className="text-red-600 font-label-bold text-[11px] tracking-wider">
                  {emailError}
                </p>
              )}
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label
                htmlFor="express-phone"
                className={`${requiredLabelClass} after:content-['*'] after:ml-1 after:text-red-600`}
              >
                Phone
              </label>
              <input
                id="express-phone"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                value={shipping.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+92 300 0000000"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label
                htmlFor="express-address"
                className={`${requiredLabelClass} after:content-['*'] after:ml-1 after:text-red-600`}
              >
                Complete Address
              </label>
              <input
                id="express-address"
                name="address"
                type="text"
                required
                autoComplete="street-address"
                value={shipping.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="123 Street Name, Area"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="express-city"
                className={`${requiredLabelClass} after:content-['*'] after:ml-1 after:text-red-600`}
              >
                City
              </label>
              <select
                id="express-city"
                name="city"
                required
                value={shipping.city}
                onChange={(e) => update("city", e.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="">Select City</option>
                {PK_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="express-postal" className={requiredLabelClass}>
                Postal Code{" "}
                <span className="normal-case tracking-normal text-secondary/60">
                  (optional)
                </span>
              </label>
              <input
                id="express-postal"
                name="postalCode"
                type="text"
                required={false}
                autoComplete="postal-code"
                value={shipping.postalCode}
                onChange={(e) => update("postalCode", e.target.value)}
                placeholder="75000"
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <div role="alert" className="p-4 border border-error/30 bg-error/10 text-red-600 font-label-bold text-[13px] md:text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => processOrder("cod")}
              disabled={submitting}
              className="w-full h-14 bg-primary-fixed text-on-primary-fixed font-label-bold text-[14px] md:text-[17px] tracking-widest uppercase hover:bg-black hover:text-white border border-transparent hover:border-black transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Placing Order..." : "Cash on Delivery Checkout"}
            </button>
            <button
              type="button"
              onClick={() => processOrder("whatsapp")}
              disabled={submitting}
              className="w-full h-14 border border-black text-black font-label-bold text-[13px] md:text-[16px] tracking-widest uppercase hover:bg-black hover:text-white transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Pay via Online & Continue on WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
