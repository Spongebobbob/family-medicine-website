import { unified } from "unified";
import remarkParse from "remark-parse";

// A deliberately small Markdown extension: quoted blocks, never executable MDX/HTML.
export type ReadingKind = "DEEPDIVE" | "EVIDENCE" | "ACTION" | "RED-FLAGS" | "TAKEAWAYS";
export type ReadingNode = {
  type: string; depth?: number; value?: string; alt?: string;
  children?: ReadingNode[];
  data?: { hProperties?: Record<string, string> };
};
export type ArticleHeading = { id: string; text: string; depth: number; advanced?: true };
export function textOf(node: ReadingNode): string {
  return node.value || node.alt || node.children?.map(textOf).join("") || "";
}
export function readingBlock(node: ReadingNode) {
  if (node.type !== "blockquote" || node.children?.[0]?.type !== "paragraph") return;
  const marker = textOf(node.children[0]).match(/^\[!(DEEPDIVE|EVIDENCE|ACTION|RED-FLAGS|TAKEAWAYS)\] ([^\n]+)$/);
  if (marker) return { kind: marker[1] as ReadingKind, title: marker[2].trim() };
}
export function headingSlug(text: string) {
  return text.trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-") || "section";
}
function prepare(tree: ReadingNode, markdown: string, transform = false) {
  const seen = new Set([
    "main", "summary", "warnings", "faq", "references",
    ...[...markdown.matchAll(/\[來源:([a-z0-9-]+)\]/g)].map(m => `ref-${m[1]}`),
    ...[...markdown.matchAll(/\/article-figures\/([a-z0-9-]+)/g)].map(m => `figure-${m[1]}`),
  ]);
  const headings: ArticleHeading[] = [];
  function walk(node: ReadingNode, advanced = false) {
    const block = readingBlock(node);
    advanced ||= block?.kind === "DEEPDIVE";
    if (block && transform) {
      node.data = { hProperties: { "data-reading-kind": block.kind, "data-reading-title": block.title } };
      node.children = node.children!.slice(1);
    }
    if (node.type === "heading") {
      const text = textOf(node), base = headingSlug(text);
      let id = base, count = 1;
      while (seen.has(id)) id = `${base}-${count++}`;
      seen.add(id);
      headings.push({ id, text, depth: node.depth || 2, ...(advanced ? { advanced: true as const } : {}) });
      if (transform) node.data = { hProperties: { id } };
    }
    node.children?.forEach(child => walk(child, advanced));
  }
  walk(tree);
  return headings;
}
export function headingsFor(markdown: string) {
  return prepare(unified().use(remarkParse).parse(markdown) as ReadingNode, markdown);
}
export function coreHeadingsFor(markdown: string) {
  return headingsFor(markdown).filter(h => !h.advanced && h.depth <= 2);
}
export function remarkArticleReading(options: { markdown: string }) {
  return (tree: ReadingNode) => {
    // Reserve anchors from original citation/image nodes before removing markers.
    prepare(tree, options.markdown, true);
  };
}
export function readingTime(body: string, coreExtra: string[] = [], fullExtra: string[] = []) {
  const tree = unified().use(remarkParse).parse(body) as ReadingNode;
  let core = "", full = "", hasDeepDive = false;
  function walk(node: ReadingNode, advanced = false) {
    const block = readingBlock(node);
    if (block?.kind === "DEEPDIVE") { advanced = true; hasDeepDive = true; }
    if (node.value && node.type !== "code") { full += node.value; if (!advanced) core += node.value; }
    node.children?.slice(block ? 1 : 0).forEach(child => walk(child, advanced));
  }
  walk(tree);
  const minutes = (text: string) => Math.max(1, Math.ceil(text.replace(/\[來源:[^\]]+\]|\s+/g, "").length / 450));
  return { core: minutes(core + coreExtra.join("")), full: minutes(full + coreExtra.join("") + fullExtra.join("")), hasDeepDive };
}
