import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, categoryBySlug } from "@/lib/site";
import { getArticles } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, PageIntro } from "@/components/layout";
import { ArticleCard } from "@/components/cards";
import { Icon } from "@/components/icon";
export const dynamicParams = false;
export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = categoryBySlug(slug);
  if (!c) return {};
  return pageMetadata(c.name, c.description, `/categories/${slug}/`);
}
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = categoryBySlug(slug);
  if (!c) notFound();
  const articles = getArticles().filter((a) => a.category === slug);
  return (
    <div className="container page-space">
      <Breadcrumbs
        items={[{ label: "健康分類", href: "/categories/" }, { label: c.name }]}
      />
      <PageIntro eyebrow="健康衛教主題" title={c.name}>
        <p>{c.description}</p>
      </PageIntro>
      {articles.length ? (
        <div className="article-grid">
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Icon name={c.icon} />
          <h2>這個主題，正在準備中。</h2>
          <p>目前尚無文章。你可以先閱讀其他主題的健康筆記。</p>
          <Link className="button" href="/articles/">
            探索衛教百科
          </Link>
        </div>
      )}
    </div>
  );
}
