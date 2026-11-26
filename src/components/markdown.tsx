import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { referencedMarkdown, type Reference } from "@/lib/content";
import type { ArticleFigure as Figure } from "@/lib/article-figures";
import { remarkArticleReading } from "@/lib/article-reading";
import { KeyTakeaways, DeepDive, EvidenceCard, ClinicalAction, RedFlags, ComparisonTable } from "./articles/reading-blocks";
import { ArticleFigure } from "./articles/article-figure";
export function ArticleMarkdown({ body, figures = [], references = [] }: { body: string; figures?: Figure[]; references?: Reference[] }) {
  const heading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    const Heading = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    return function RenderHeading({
      children, id,
    }: {
      children?: React.ReactNode; id?: string;
    }) {
      return <Heading id={id}>{children}</Heading>;
    };
  };
  return (
    <Markdown
      skipHtml
      remarkPlugins={[remarkGfm, [remarkArticleReading, { markdown: body }]]}
      components={{
        p: ({ node, children }) => node?.children.some(child => child.type === "element" && child.tagName === "img" && String(child.properties.src).startsWith("/article-figures/")) ? <div>{children}</div> : <p>{children}</p>,
        img: ({ src, alt }) => {
          const figure = typeof src === "string" ? figures.find(item => src === `/article-figures/${item.id}`) : undefined;
          if (figure) return <ArticleFigure figure={figure} references={references} />;
          // Existing Markdown images remain plain, accessible content, never executable HTML.
          // eslint-disable-next-line @next/next/no-img-element
          return <img src={src} alt={alt ?? ""} loading="lazy" />;
        },
        table: ({ children }) => <ComparisonTable>{children}</ComparisonTable>,
        blockquote: ({ node, children }) => {
          const title = String(node?.properties["data-reading-title"] ?? "");
          switch (node?.properties["data-reading-kind"]) {
            case "DEEPDIVE": return <DeepDive title={title}>{children}</DeepDive>;
            case "EVIDENCE": return <EvidenceCard title={title}>{children}</EvidenceCard>;
            case "ACTION": return <ClinicalAction title={title}>{children}</ClinicalAction>;
            case "RED-FLAGS": return <RedFlags title={title}>{children}</RedFlags>;
            case "TAKEAWAYS": return <KeyTakeaways title={title}>{children}</KeyTakeaways>;
            default: return <aside className="article-callout" role="note"><span className="callout-label">重點提示</span>{children}</aside>;
          }
        },
        h1: heading(2),
        h2: heading(2),
        h3: heading(3),
        h4: heading(4),
        h5: heading(5),
        h6: heading(6),
        a: ({ href, children }) => (
          <a
            href={href}
            {...(href?.startsWith("https://")
              ? { rel: "noopener noreferrer", target: "_blank" }
              : {})}
          >
            {children}
          </a>
        ),
      }}
    >
      {referencedMarkdown(body, references)}
    </Markdown>
  );
}
