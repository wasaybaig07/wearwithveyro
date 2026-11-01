import Link from "next/link";

const legalLinks = [
  { label: "PRIVACY POLICY", href: "/privacy" },
  { label: "TERMS OF SERVICE", href: "/terms" },
  { label: "SHIPPING POLICY", href: "/shipping" },
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/wearveyro/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/15 bg-surface">
      <div className="max-w-[1600px] mx-auto px-container-margin py-12 md:py-16">
        <div className="flex flex-col items-center gap-12 mb-12 text-center">
          <span className="font-wordmark font-bold text-[clamp(2rem,6.5vw,5rem)] uppercase leading-[1.05] text-primary select-none">
            wearw<span className="text-primary-fixed">/</span>veyro
          </span>

          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-label-bold text-[12px] text-secondary hover:text-primary-fixed hover:line-through transition-all tracking-wider"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex items-center justify-center w-11 h-11 border border-black/15 text-secondary hover:text-primary-fixed hover:border-primary-fixed transition-colors cursor-pointer"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center border-t border-black/10 pt-8 gap-4 text-center md:text-left">
          <p className="font-label-bold text-[10px] text-secondary tracking-widest uppercase select-none">
            ©2024 WEARVEYRO. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-secondary tracking-widest uppercase">
             ELEVATED • EVERYDAY • ESSENTIALS    
            </span>
          </div>
          <p className="font-label-bold text-[10px] text-primary-fixed tracking-widest uppercase select-none">
            CURRENCY: PKR (Rs.)
          </p>
        </div>
      </div>
    </footer>
  );
}
