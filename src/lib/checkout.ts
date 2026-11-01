export const WHATSAPP_PHONE = "923186590081";

export interface ShippingInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export const initialShipping: ShippingInfo = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
};

/** Accepted email provider domains for checkout. */
export const ACCEPTED_EMAIL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.pk",
  "ymail.com",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "zoho.com",
  "gmx.com",
  "mail.com",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Returns an error message when the email is empty, malformed, or uses an
 * unrecognized domain — `null` when the email is valid.
 */
export function validateEmail(email: string): string | null {
  const value = email.trim().toLowerCase();
  if (!value) {
    return "Email is required.";
  }
  if (!EMAIL_REGEX.test(value)) {
    return "Please enter a valid email address (e.g. you@gmail.com).";
  }
  const domain = value.split("@")[1];
  if (!ACCEPTED_EMAIL_DOMAINS.includes(domain)) {
    return "Unrecognized email domain. Please use an accepted provider such as @gmail.com, @yahoo.com, @hotmail.com or @outlook.com.";
  }
  return null;
}

/** Major cities across Pakistan for the checkout city dropdown. */
export const PK_CITIES: string[] = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Abbottabad",
  "Attock",
  "Bahawalnagar",
  "Bahawalpur",
  "Bannu",
  "Batkhela",
  "Bhakkar",
  "Burewala",
  "Charsadda",
  "Chiniot",
  "Chitral",
  "Dadu",
  "Daska",
  "Dera Ghazi Khan",
  "Dera Ismail Khan",
  "Gilgit",
  "Ghotki",
  "Gojra",
  "Gujrat",
  "Gwadar",
  "Hafizabad",
  "Haripur",
  "Hasan Abdal",
  "Jacobabad",
  "Jhang",
  "Jhelum",
  "Kamalia",
  "Kasur",
  "Khanewal",
  "Khanpur",
  "Khuzdar",
  "Kohat",
  "Larkana",
  "Layyah",
  "Loralai",
  "Malakand",
  "Mandi Bahauddin",
  "Mardan",
  "Mingora",
  "Mirpur (AJK)",
  "Mirpurkhas",
  "Murree",
  "Muzaffarabad",
  "Muzaffargarh",
  "Nankana Sahib",
  "Narowal",
  "Nowshera",
  "Okara",
  "Panjgur",
  "Rahim Yar Khan",
  "Sahiwal",
  "Sargodha",
  "Sheikhupura",
  "Shikarpur",
  "Sibi",
  "Sukkur",
  "Swat",
  "Tank",
  "Taxila",
  "Tando Adam",
  "Tando Allahyar",
  "Thatta",
  "Turbat",
  "Umarkot",
  "Vehari",
  "Wah Cantonment",
];

/**
 * Every required shipping field except Postal Code (which is optional),
 * plus email domain validation. Returns `null` when checkout may proceed.
 */
export function getShippingError(s: ShippingInfo): string | null {
  const missing: string[] = [];
  if (!s.name.trim()) missing.push("Full Name");
  if (!s.email.trim()) missing.push("Email");
  if (!s.phone.trim()) missing.push("Phone");
  if (!s.address.trim()) missing.push("Complete Address");
  if (!s.city.trim()) missing.push("City");

  if (missing.length > 0) {
    return `Please fill in the following required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`;
  }
  return validateEmail(s.email);
}

export function isShippingComplete(s: ShippingInfo): boolean {
  return getShippingError(s) === null;
}

export function openWhatsApp(text: string): void {
  window.open(
    `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`,
    "_blank"
  );
}

export type CheckoutMethod = "cod" | "whatsapp";

export interface WhatsOrderItem {
  name: string;
  size: string;
  quantity: number;
  price: string;
}

export function buildOrderWhatsAppMessage(params: {
  orderId: string;
  total: number;
  shipping: ShippingInfo;
  items: WhatsOrderItem[];
  intro?: string;
}): string {
  const { orderId, total, shipping, items, intro } = params;
  const sections: string[] = [];

  if (intro) sections.push(intro, "");

  sections.push(
    `Order ID: ${orderId}`,
    "",
    ...items.map(
      (item) => `• ${item.name} (Size: ${item.size}) x${item.quantity} — ${item.price}`
    ),
    "",
    `Total: Rs. ${total.toLocaleString()}`,
    "",
    `Name: ${shipping.name}`,
    `Email: ${shipping.email}`,
    `Phone: ${shipping.phone}`,
    `Address: ${shipping.address}, ${shipping.city} ${shipping.postalCode}`
  );

  return sections.join("\n");
}
