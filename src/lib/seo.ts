import type { Metadata } from "next";
import { absolute, indexEnabled, site } from "./site";
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  pending = false,
): Metadata {
  return {
    title: path === "/" ? { absolute: `${site.name}｜${title}` } : title,
    description,
    alternates: { canonical: absolute(path) },
    robots: { index: indexEnabled && !pending, follow: true },
    openGraph: {
      title: `${title}｜${site.name}`,
      description,
      url: absolute(path),
      siteName: site.name,
      locale: "zh_TW",
      type: "website",
      images: [
        {
          url: absolute("/og-card.png"),
          width: 1200,
          height: 630,
          alt: "日常・家醫｜讓健康成為日常",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absolute("/og-card.png")],
    },
  };
}
export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
