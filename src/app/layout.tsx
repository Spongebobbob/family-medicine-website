import type { Metadata } from "next";
import { Header, Footer } from "@/components/layout";
import { site, indexEnabled } from "@/lib/site";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}｜讓健康成為日常`,
    template: `%s｜${site.name}`,
  },
  description: site.description,
  robots: { index: indexEnabled, follow: true },
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant-TW">
      <body>
        <Header />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
