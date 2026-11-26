import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { categoryBySlug, site } from "./site";
import type { SearchArticle } from "./search";

export type Reference = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  accessed: string;
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
};
type Ast = { type: string; depth?: number; value?: string; children?: Ast[] };
function textOf(node: Ast): string {
  return node.value || node.children?.map(textOf).join("") || "";
}
export function headingSlug(text: string) {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-") || "section"
  );
}
export function headingsFor(markdown: string) {
  const tree = unified().use(remarkParse).parse(markdown) as Ast;
  const seen = new Set<string>(
    [
      "main",
      "summary",
      "warnings",
      "faq",
      "references",
      ...[...markdown.matchAll(/\[來源:([a-z0-9-]+)\]/g)].map(
        (m) => `ref-${m[1]}`,
      ),
    ],
  );
  const headings: { id: string; text: string; depth: number }[] = [];
  function walk(node: Ast) {
    if (node.type === "heading") {
      const text = textOf(node);
      const base = headingSlug(text);
      let id = base;
      let count = 1;
      while (seen.has(id)) id = `${base}-${count++}`;
      seen.add(id);
      headings.push({
        text,
        id,
        depth: node.depth || 2,
      });
    }
    node.children?.forEach(walk);
  }
  walk(tree);
  return headings;
}
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
  if (
    data.status === "reviewed" &&
    (!site.physician.name || data.author !== site.physician.name)
  )
    fail("已審閱文章須填寫真實醫師作者");
  for (const field of ["summary", "warnings", "keywords"])
    if (!strings(data[field]) || !data[field].length) fail(field);
  if (
    !Array.isArray(data.faq) ||
    !data.faq.length ||
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
  }
  for (const match of content.matchAll(/\[來源:([a-z0-9-]+)\]/g))
    if (!ids.has(match[1])) fail(`文獻 ${match[1]}`);
  if (!content.trim() || !headingsFor(content).length) fail("正文與標題");
  return {
    ...data,
    slug,
    body: content,
    minutes: Math.max(1, Math.ceil(content.length / 450)),
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
export function referencedMarkdown(body: string) {
  return body.replace(/\[來源:([a-z0-9-]+)\]/g, "[〔來源〕](#ref-$1)");
}
