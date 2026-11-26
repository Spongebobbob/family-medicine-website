"use client";
import { useId, useState } from "react";
import Link from "next/link";
import { searchArticles, searchTools, type SearchArticle, type SearchTool } from "@/lib/search";
import { Icon } from "./icon";
export function Search({ articles, tools = [], initialQuery = "" }: { articles: SearchArticle[]; tools?: SearchTool[]; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const id = useId();
  const results = searchArticles(articles, query);
  const toolResults = searchTools(tools, query);
  return (
    <div className="search-area">
      <label className="field-label" htmlFor={id}>
        想找什麼健康知識？
      </label>
      <div className="search-field">
        <Icon name="search" />
        <input
          id={id}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
          placeholder="搜尋失眠、LDL、脂肪肝…"
        />
        <button onClick={() => setQuery("")} disabled={!query} type="button">
          清除
        </button>
      </div>
      <div className="suggested-search">
        <span>常見主題</span>
        {["睡眠", "LDL", "健檢"].map((q) => (
          <button type="button" key={q} onClick={() => setQuery(q)}>
            {q}
          </button>
        ))}
      </div>
      <p className="search-count" role="status" aria-live="polite">
        {query
          ? `「${query}」找到 ${results.length} 篇文章、${toolResults.length} 項工具`
          : `目前共 ${results.length} 篇文章`}
      </p>
      {toolResults.length > 0 && <section className="search-results search-tool-results" aria-label="符合的健康工具">
        <h2>健康工具</h2>
        {toolResults.map(tool => <article key={tool.slug}><span className="category-label">健康自我評估</span><h3><Link href={`/tools/${tool.slug}/`}>{tool.name}</Link></h3><p>{tool.description}</p></article>)}
      </section>}
      <div className="search-results">
        {results.map((a) => (
          <article key={a.slug}>
            <div className="card-labels">
              <span className="category-label">{a.categoryName}</span>
            </div>
            <h2>
              <Link href={`/articles/${a.slug}/`}>{a.title}</Link>
            </h2>
            <p>{a.description}</p>
            <small>
              {a.published}・約 {a.minutes} 分鐘閱讀
            </small>
          </article>
        ))}
      </div>
      {!results.length && !toolResults.length && (
        <div className="empty-state">
          <Icon name="search" />
          <h2>還沒找到符合的內容</h2>
          <p>本站目前尚無符合此關鍵字的文章或工具。可以試著縮短關鍵字，或改用「睡眠」、「LDL」、「健檢」。</p>
          <button className="button" onClick={() => setQuery("")}>
            顯示所有文章
          </button>
        </div>
      )}
    </div>
  );
}
