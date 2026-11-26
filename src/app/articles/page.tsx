import { Breadcrumbs, PageIntro } from "@/components/layout";
import { ArticleCard } from "@/components/cards";
import { getArticles } from "@/lib/content";
import { categories } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
export const metadata = pageMetadata(
  "健康衛教百科",
  "從睡眠到慢性病，探索生活中的健康問題。",
  "/articles/",
);
export default function Articles() {
  return (
    <div className="container page-space">
      <Breadcrumbs items={[{ label: "健康衛教百科" }]} />
      <PageIntro eyebrow="一點一滴，累積健康理解" title="健康衛教百科">
        <p>把複雜的醫學，讀成生活裡用得上的知識。</p>
      </PageIntro>
      <div className="topic-links" aria-label="依分類瀏覽">
        <Link href="/search/" className="topic-active">
          搜尋所有文章
        </Link>
        {categories.map((c) => (
          <Link key={c.slug} href={`/categories/${c.slug}/`}>
            {c.name}
          </Link>
        ))}
      </div>
      <div className="notice" data-medical-notice>
        示範文章皆待醫師審閱，內容不可作為個別醫療決策依據。
      </div>
      <div className="article-grid">
        {getArticles().map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </div>
  );
}
