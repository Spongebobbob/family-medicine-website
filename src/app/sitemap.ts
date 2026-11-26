import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/content";
import { categories, indexEnabled, absolute } from "@/lib/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!indexEnabled) return [];
  return [
    ...[
      "/",
      "/about/",
      "/articles/",
      "/categories/",
      "/tools/",
      "/references/",
      "/policy/",
    ].map((p) => ({ url: absolute(p) })),
    ...categories.map((c) => ({ url: absolute(`/categories/${c.slug}/`) })),
    ...getArticles()
      .filter((a) => a.status === "reviewed")
      .map((a) => ({
        url: absolute(`/articles/${a.slug}/`),
        lastModified: a.updated,
      })),
  ];
}
