import { Breadcrumbs, PageIntro } from "@/components/layout";
import { Search } from "@/components/search";
import { SearchWithQuery } from "@/components/search-with-query";
import { Suspense } from "react";
import { healthTools } from "@/lib/tool-catalog";
import { getArticles, toSearchArticle } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "站內搜尋",
  "依關鍵字搜尋衛教文章、健康主題與自我評估工具。",
  "/search/",
);
export default function SearchPage() {
  const articles = getArticles().map(toSearchArticle);
  const tools = healthTools.map(({slug, name, shortName, description}) => ({slug, name, shortName, description}));
  return (
    <div className="container page-space">
      <Breadcrumbs items={[{ label: "站內搜尋" }]} />
      <PageIntro
        eyebrow="找到你關心的健康問題"
        title="想了解什麼？從這裡開始。"
      >
        <p>搜尋衛教文章與健康工具，尋找適合你的閱讀起點。</p>
      </PageIntro>
      <Suspense fallback={<Search articles={articles} tools={tools} />}>
        <SearchWithQuery articles={articles} tools={tools} />
      </Suspense>
    </div>
  );
}
