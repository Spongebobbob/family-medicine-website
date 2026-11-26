import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { headingsFor, referencedMarkdown, type Reference } from "@/lib/content";
import type { ArticleFigure as Figure } from "@/lib/article-figures";
import { ArticleFigure } from "./articles/article-figure";
export function ArticleMarkdown({ body, figures = [], references = [] }: { body: string; figures?: Figure[]; references?: Reference[] }) {
  const headings = headingsFor(body);
  let cursor = 0;
  const heading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    const Heading = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    return function RenderHeading({
      children,
    }: {
      children?: React.ReactNode;
    }) {
      const id = headings[cursor++]?.id;
      return <Heading id={id}>{children}</Heading>;
    };
  };
  return (
    <Markdown
      skipHtml
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ node, children }) => node?.children.some(child => child.type === "element" && child.tagName === "img" && String(child.properties.src).startsWith("/article-figures/")) ? <div>{children}</div> : <p>{children}</p>,
        img: ({ src, alt }) => {
          const figure = typeof src === "string" ? figures.find(item => src === `/article-figures/${item.id}`) : undefined;
          if (figure) return <ArticleFigure figure={figure} references={references} />;
          // Existing Markdown images remain plain, accessible content, never executable HTML.
          // eslint-disable-next-line @next/next/no-img-element
          return <img src={src} alt={alt ?? ""} loading="lazy" />;
        },
        table: ({ children }) => <div className="article-table-scroll" tabIndex={0} role="region" aria-label="文章資料表；可左右捲動"><table>{children}</table></div>,
        blockquote: ({ children }) => <aside className="article-callout" role="note"><span className="callout-label">重點提示</span>{children}</aside>,
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
