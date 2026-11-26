import { Breadcrumbs, PageIntro } from "@/components/layout";
import { Search } from "@/components/search";
import { getArticles, toSearchArticle } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "站內搜尋",
  "依關鍵字搜尋標題、分類與衛教文章全文。",
  "/search/",
);
export default function SearchPage() {
  return (
    <div className="container page-space">
      <Breadcrumbs items={[{ label: "站內搜尋" }]} />
      <PageIntro
        eyebrow="找到你關心的健康問題"
        title="想了解什麼？從這裡開始。"
      >
        <p>搜尋文章標題、主題及內文，尋找適合你的閱讀起點。</p>
      </PageIntro>
      <Search articles={getArticles().map(toSearchArticle)} />
    </div>
  );
}
