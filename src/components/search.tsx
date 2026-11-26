"use client";
import { useId, useState } from "react";
import Link from "next/link";
import { searchArticles, type SearchArticle } from "@/lib/search";
import { Icon } from "./icon";
export function Search({ articles }: { articles: SearchArticle[] }) {
  const [query, setQuery] = useState("");
  const id = useId();
  const results = searchArticles(articles, query);
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
          placeholder="試試「睡眠」、「血壓」或「健檢」"
        />
        <button onClick={() => setQuery("")} disabled={!query} type="button">
          清除
        </button>
      </div>
      <div className="suggested-search">
        <span>常見主題</span>
        {["睡眠", "血壓", "健檢"].map((q) => (
          <button type="button" key={q} onClick={() => setQuery(q)}>
            {q}
          </button>
        ))}
      </div>
      <p className="search-count" role="status" aria-live="polite">
        {query
          ? `「${query}」找到 ${results.length} 篇文章`
          : `目前共 ${results.length} 篇文章`}
      </p>
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
      {!results.length && (
        <div className="empty-state">
          <Icon name="search" />
          <h2>還沒找到符合的文章</h2>
          <p>試著縮短關鍵字，或改用「睡眠」、「血壓」、「健檢」。</p>
          <button className="button" onClick={() => setQuery("")}>
            顯示所有文章
          </button>
        </div>
      )}
    </div>
  );
}
