import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, PageIntro } from "@/components/layout";
import { Icon } from "@/components/icon";
import { ToolCards } from "@/components/tools/tool-directory";
import { getToolGroup, healthTools, toolGroups } from "@/lib/tool-catalog";
import { pageMetadata } from "@/lib/seo";
export const dynamicParams = false;
export function generateStaticParams() {
  return toolGroups.map((g) => ({ slug: g.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const group = getToolGroup(slug);
  return group
    ? pageMetadata(
        `${group.name}評估工具`,
        group.description,
        `/tools/categories/${slug}/`,
        true,
      )
    : {};
}
export default async function ToolCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const group = getToolGroup(slug);
  if (!group) notFound();
  const tools = healthTools.filter((t) => t.group === slug);
  return (
    <div className="container page-space">
      <Breadcrumbs
        items={[
          { label: "健康自我評估", href: "/tools/" },
          { label: group.name },
        ]}
      />
      <PageIntro eyebrow="" title={group.name}>{null}</PageIntro>
      {tools.length ? (
        <>
          <ToolCards
            tools={tools.map((t) => ({
              slug: t.slug,
              name: t.name,
              shortName: t.shortName,
              group: t.group,
              description: t.description,
              icon: t.icon,
              status: "衛教參考",
            }))}
          />
        </>
      ) : (
        <div className="empty-state">
          <Icon name={group.icon} />
          <h2>這個主題，正在準備中。</h2>
          <p>
            第一階段尚未提供此類評估工具，後續將依臨床需求與資料確認結果規劃。
          </p>
          <Link className="button" href="/tools/">
            查看第一階段工具
          </Link>
        </div>
      )}
    </div>
  );
}
