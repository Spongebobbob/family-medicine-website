import Link from "next/link";
import { Icon } from "@/components/icon";
import type { ToolGroup } from "@/lib/tool-catalog";
export type ToolSummary = {
  slug: string;
  name: string;
  shortName: string;
  group: string;
  description: string;
  icon: string;
  status: string;
};
export function ToolCards({ tools }: { tools: ToolSummary[] }) {
  return (
    <div className="assessment-grid">
      {tools.map((tool) => (
        <article className="assessment-card" key={tool.slug}>
          <span className="assessment-card-icon">
            <Icon name={tool.icon} />
          </span>
          <h3>
            <Link href={`/tools/${tool.slug}/`}>{tool.name}</Link>
          </h3>
          <p>{tool.description}</p>
          <Link href={`/tools/${tool.slug}/`} className="text-link">
            開始使用工具
          </Link>
        </article>
      ))}
    </div>
  );
}
export function ToolDirectory({
  groups,
  tools,
}: {
  groups: readonly ToolGroup[];
  tools: ToolSummary[];
}) {
  return (
        <section aria-label="健康工具分類">
          <div className="tool-group-grid">
            {groups.map((g) => {
              const count = tools.filter((t) => t.group === g.slug).length;
              return (
                <Link
                  className="tool-group-card"
                  key={g.slug}
                  href={`/tools/categories/${g.slug}/`}
                >
                  <span className={`tool-group-icon tone-${g.tone}`}>
                    <Icon name={g.icon} />
                  </span>
                  <h3>{g.name}</h3>
                  <p>{g.description}</p>
                  <span className="tool-group-count">
                    {count ? `${count} 項工具` : "工具規劃中"}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
  );
}
