import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rutalinea SEO — Copiloto SEO en español",
  description:
    "Keywords, redacción, optimización, enlazado interno y publicación en WordPress, todo en un solo sitio.",
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
