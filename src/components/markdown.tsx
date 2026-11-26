import Markdown from "react-markdown";
import { headingsFor, referencedMarkdown } from "@/lib/content";
export function ArticleMarkdown({ body }: { body: string }) {
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
      components={{
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
      {referencedMarkdown(body)}
    </Markdown>
  );
}
