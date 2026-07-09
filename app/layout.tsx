import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rutalineaseo.com"),
  title: "Rutalinea SEO — Copiloto SEO en español",
  description:
    "Keywords, redacción, optimización, enlazado interno y publicación en WordPress, todo en un solo sitio.",
  openGraph: {
    title: "Rutalinea SEO — Copiloto SEO en español",
    description:
      "Keywords, redacción, optimización, enlazado interno y publicación en WordPress, todo en un solo sitio.",
    url: "https://rutalineaseo.com",
    siteName: "Rutalinea SEO",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rutalinea SEO — Copiloto SEO en español",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rutalinea SEO — Copiloto SEO en español",
    description:
      "Keywords, redacción, optimización, enlazado interno y publicación en WordPress, todo en un solo sitio.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
