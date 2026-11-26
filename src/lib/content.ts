import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { headingsFor, readingTime } from "./article-reading";
export { headingsFor, headingSlug } from "./article-reading";
import { categoryBySlug, site } from "./site";
import type { SearchArticle } from "./search";
import { validateFigure, type ArticleFigure } from "./article-figures";

export type Reference = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  accessed: string;
  vancouver?: string;
  doi?: string;
  pubmed?: string;
};
export type Article = {
  slug: string;
  title: string;
  description: string;
  category: string;
  published: string;
  updated: string;
  status: "pending-review" | "reviewed";
  author: string;
  summary: string[];
  warnings: string[];
  faq: { question: string; answer: string }[];
  references: Reference[];
  keywords: string[];
  body: string;
  minutes: number;
  reading: ReturnType<typeof readingTime>;
  kind?: "education" | "demo";
  numberedSections?: boolean;
  figures: ArticleFigure[];
};
const contentPath = path.join(process.cwd(), "content/articles");
function strings(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((x) => typeof x === "string" && x.trim())
  );
}
function validDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function parseArticle(source: string, slug: string): Article {
  const { data, content } = matter(source);
  const fail = (field: string): never => {
    throw new Error(`文章 ${slug}：${field} 格式錯誤或缺漏`);
  };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail("檔名");
  for (const field of ["title", "description", "category", "author"])
    if (typeof data[field] !== "string" || !data[field].trim()) fail(field);
  if (!categoryBySlug(data.category)) fail("category");
  if (
    !validDate(data.published) ||
    !validDate(data.updated) ||
    data.updated < data.published
  )
    fail("日期");
  if (!["pending-review", "reviewed"].includes(data.status)) fail("status");
  if (data.kind !== undefined && !["education", "demo"].includes(data.kind)) fail("kind");
  if (data.numberedSections !== undefined && typeof data.numberedSections !== "boolean") fail("numberedSections");
  if (
    data.status === "reviewed" &&
    (!site.physician.name || data.author !== site.physician.name)
  )
    fail("已審閱文章須填寫真實醫師作者");
  if (!strings(data.keywords) || !data.keywords.length) fail("keywords");
  for (const field of ["summary", "warnings"]) {
    data[field] ??= [];
    if (!strings(data[field])) fail(field);
  }
  data.faq ??= [];
  if (
    !Array.isArray(data.faq) ||
    !data.faq.every(
      (q) =>
        typeof q.question === "string" &&
        typeof q.answer === "string" &&
        q.question &&
        q.answer,
    )
  )
    fail("faq");
  if (!Array.isArray(data.references) || !data.references.length)
    fail("references");
  const ids = new Set<string>();
  for (const ref of data.references) {
    if (
      ![ref.id, ref.title, ref.publisher].every(
        (x) => typeof x === "string" && x.trim(),
      ) ||
      !validDate(ref.accessed) ||
      !/^https:\/\//.test(ref.url) ||
      ids.has(ref.id)
    )
      fail("references");
    ids.add(ref.id);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(ref.id)) fail("文獻 ID");
    if (ref.vancouver !== undefined && (typeof ref.vancouver !== "string" || !ref.vancouver.trim())) fail("Vancouver 文獻");
    if (data.kind === "education" && !ref.vancouver) fail("衛教文章須提供 Vancouver 文獻");
    if (ref.doi !== undefined && (typeof ref.doi !== "string" || !/^10\.\d{4,9}\/\S+$/.test(ref.doi))) fail("DOI");
    if (ref.pubmed !== undefined && (typeof ref.pubmed !== "string" || !/^\d+$/.test(ref.pubmed))) fail("PubMed ID");
  }
  const citedText = [content, ...data.summary, ...data.warnings, ...data.faq.map((q: { answer: string }) => q.answer)].join("\n");
  for (const match of citedText.matchAll(/\[來源:([a-z0-9-]+)\]/g))
    if (!ids.has(match[1])) fail(`文獻 ${match[1]}`);
  const figureIds: string[] = data.figures ?? [];
  if (!Array.isArray(figureIds) || figureIds.some(id => typeof id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) || new Set(figureIds).size !== figureIds.length) fail("figures");
  const figures = figureIds.map(id => validateFigure(JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/figures", `${id}.json`), "utf8")), id, [...ids]));
  for (const match of content.matchAll(/!\[[^\]]*\]\(\/article-figures\/([^\s)]+)\)/g)) if (!figureIds.includes(match[1])) fail(`未登錄圖表 ${match[1]}`);
  if (data.kind === "education") {
    for (const match of content.matchAll(/!\[([^\]]*)\]\(([^\s)]+)\)/g)) {
      if (!match[1].trim() || !figureIds.some(id => match[2] === `/article-figures/${id}`)) fail("衛教圖像須有替代文字、來源及已登錄圖表");
    }
  }
  if (!content.trim() || !headingsFor(content).length) fail("正文與標題");
  const reading = readingTime(content, [...data.summary, ...data.warnings], data.faq.map((q: {question: string; answer: string}) => q.question + q.answer));
  return {
    ...data,
    slug,
    body: content,
    figures,
    minutes: reading.full,
    reading,
  } as Article;
}
export function getArticles(): Article[] {
  return fs
    .readdirSync(contentPath)
    .filter((f) => f.endsWith(".md"))
    .map((file) =>
      parseArticle(
        fs.readFileSync(path.join(contentPath, file), "utf8"),
        file.replace(/\.md$/, ""),
      ),
    )
    .sort(
      (a, b) =>
        b.published.localeCompare(a.published) || a.slug.localeCompare(b.slug),
    );
}
export function getArticle(slug: string) {
  return getArticles().find((a) => a.slug === slug);
}
export function toSearchArticle(a: Article): SearchArticle {
  return {
    slug: a.slug,
    title: a.title,
    description: a.description,
    categoryName: categoryBySlug(a.category)!.name,
    status: a.status,
    keywords: a.keywords,
    text: a.body,
    published: a.published,
    minutes: a.minutes,
  };
}
export function referencedMarkdown(body: string, references?: Reference[]) {
  return body.replace(/\[來源:([a-z0-9-]+)\]/g, (_, id: string) => {
    const index = references?.findIndex(ref => ref.id === id);
    return `[${index !== undefined && index >= 0 ? `[${index + 1}]` : "〔來源〕"}](#ref-${id})`;
  });
}
