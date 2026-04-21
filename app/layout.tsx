import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// next/font automatically self-hosts Inter — no Google Fonts waterfall
const inter = Inter({
  subsets: ["latin"],
  display: "swap",          // font-display: swap — no invisible text during load
  variable: "--font-inter",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2463EB",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ourokrealty.com"),
  title: {
    default: "Oklahoma RPCD Disclosure | OurOK Realty",
    template: "%s | OurOK Realty",
  },
  description:
    "Complete your Oklahoma Residential Property Condition Disclosure (RPCD) form online. Secure, fast, and legally compliant disclosures for sellers and agents.",
  keywords: [
    "Oklahoma",
    "RPCD",
    "property disclosure",
    "real estate disclosure",
    "Oklahoma seller disclosure",
    "residential property condition",
  ],
  authors: [{ name: "OurOK Realty" }],
  creator: "OurOK Realty",
  robots: {
    index: false,   // app is behind auth — no pages should be indexed
    follow: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "OurOK Realty — RPCD Disclosure",
    title: "Oklahoma RPCD Disclosure | OurOK Realty",
    description:
      "Complete your Oklahoma Residential Property Condition Disclosure online. Secure and legally compliant.",
  },
  twitter: {
    card: "summary",
    title: "Oklahoma RPCD Disclosure | OurOK Realty",
    description:
      "Complete your Oklahoma Residential Property Condition Disclosure online.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-gray-900">
        {/* Skip to main content — required for keyboard/screen-reader accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          Skip to main content
        </a>
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  );
}