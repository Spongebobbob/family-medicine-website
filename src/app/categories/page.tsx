import { Breadcrumbs, PageIntro } from "@/components/layout";
import { CategoryCard } from "@/components/cards";
import { getArticles } from "@/lib/content";
import { categories } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "疾病與健康分類",
  "九大衛教主題，找到自己與家人關心的健康知識。",
  "/categories/",
);
export default function Categories() {
  const articles = getArticles();
  return (
    <div className="container page-space">
      <Breadcrumbs items={[{ label: "健康分類" }]} />
      <PageIntro eyebrow="照顧生活的每一個面向" title="疾病與健康分類">
        <p>從在意的健康主題開始，慢慢建立自己的健康筆記。</p>
      </PageIntro>
      <div className="category-grid">
        {categories.map((c) => (
          <CategoryCard
            key={c.slug}
            category={c}
            count={articles.filter((a) => a.category === c.slug).length}
          />
        ))}
      </div>
    </div>
  );
}
