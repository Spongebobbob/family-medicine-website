import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticles, getArticle, headingsFor } from "@/lib/content";
import { categoryBySlug, absolute, site } from "@/lib/site";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout";
import { ArticleCard } from "@/components/cards";
import { ArticleMarkdown } from "@/components/markdown";
import { Icon } from "@/components/icon";
export const dynamicParams = false;
export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  const meta = pageMetadata(
    a.title,
    a.description,
    `/articles/${slug}/`,
    a.status === "pending-review",
  );
  return {
    ...meta,
    authors: [{ name: a.author, url: absolute("/about/") }],
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: a.published,
      modifiedTime: a.updated,
      authors: [a.author],
    },
  };
}
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();
  const c = categoryBySlug(a.category)!;
  const headings = headingsFor(a.body);
  const related = getArticles()
    .filter((x) => x.slug !== slug)
    .sort(
      (x, y) =>
        Number(y.category === a.category) - Number(x.category === a.category),
    )
    .slice(0, 2);
  const url = absolute(`/articles/${slug}/`);
  return (
    <div className="container page-space">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Article",
                "@id": url,
                headline: a.title,
                description: a.description,
                datePublished: a.published,
                dateModified: a.updated,
                inLanguage: "zh-Hant-TW",
                mainEntityOfPage: url,
                author: {
                  "@type": a.status === "reviewed" ? "Person" : "Organization",
                  name: a.author,
                  url: absolute("/about/"),
                },
                publisher: { "@type": "Organization", name: site.name },
                citation: a.references.map((r) => r.url),
                creativeWorkStatus:
                  a.status === "pending-review" ? "待醫師審閱" : "已審閱",
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "首頁",
                    item: absolute("/"),
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: c.name,
                    item: absolute(`/categories/${c.slug}/`),
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: a.title,
                    item: url,
                  },
                ],
              },
            ],
          }),
        }}
      />
      <Breadcrumbs
        items={[
          { label: "衛教百科", href: "/articles/" },
          { label: c.name, href: `/categories/${c.slug}/` },
          { label: a.title },
        ]}
      />
      <div className="article-layout">
        <article className="article-main">
          <header className="article-header">
            <Link className="category-label" href={`/categories/${c.slug}/`}>
              {c.name}
            </Link>
            <h1>{a.title}</h1>
            <p className="article-lead">{a.description}</p>
            <div className="author-line">
              <span className="author-avatar">
                <Icon name="leaf" />
              </span>
              <div>
                <Link href="/about/">{a.author}</Link>
                <small>
                  發布 <time dateTime={a.published}>{a.published}</time>
                  　・　更新 <time dateTime={a.updated}>{a.updated}</time>
                  　・　約 {a.minutes} 分鐘閱讀
                </small>
              </div>
            </div>
          </header>
          <section className="summary-box" aria-labelledby="summary">
            <h2 id="summary">
              <Icon name="book" />
              先看重點
            </h2>
            <ul>
              {a.summary.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
          <details className="mobile-toc">
            <summary>這篇文章會談到什麼？</summary>
            <ul>
              {headings.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`}>{h.text}</a>
                </li>
              ))}
              <li>
                <a href="#warnings">警示症狀與就醫時機</a>
              </li>
              <li>
                <a href="#faq">常見問題</a>
              </li>
              <li>
                <a href="#references">參考文獻</a>
              </li>
            </ul>
          </details>
          <div className="prose">
            <ArticleMarkdown body={a.body} />
          </div>
          <section data-medical-notice className="warning-box" aria-labelledby="warnings">
            <h2 id="warnings">
              <Icon name="shield" />
              警示症狀與就醫時機
            </h2>
            {a.status === "pending-review" && <p>示範文章・待醫師審閱，僅供健康教育參考。</p>}
            <ul>
              {a.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            <p>若有緊急症狀，請立即就醫或撥打 119。</p>
          </section>
          <section className="faq-section" aria-labelledby="faq">
            <h2 id="faq">常見問題</h2>
            {a.faq.map((q) => (
              <details key={q.question}>
                <summary>{q.question}</summary>
                <p>{q.answer}</p>
              </details>
            ))}
          </section>
          <section className="reference-section" aria-labelledby="references">
            <h2 id="references">參考文獻</h2>
            <ol>
              {a.references.map((r) => (
                <li id={`ref-${r.id}`} key={r.id}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    {r.title}
                  </a>
                  <span>
                    {r.publisher}・查閱日期：{r.accessed}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </article>
        <aside className="desktop-toc">
          <div>
            <span className="eyebrow">本文目錄</span>
            <a href="#summary">先看重點</a>
            {headings.map((h) => (
              <a
                className={h.depth > 2 ? "toc-indent" : ""}
                href={`#${h.id}`}
                key={h.id}
              >
                {h.text}
              </a>
            ))}
            <a href="#warnings">警示症狀與就醫時機</a>
            <a href="#faq">常見問題</a>
            <a href="#references">參考文獻</a>
            <hr />
            <p>
              慢慢閱讀，
              <br />
              把健康帶回生活。
            </p>
          </div>
        </aside>
      </div>
      <section className="related-section">
        <div className="section-heading">
          <h2>接著，讀一點健康</h2>
          <Link className="text-link" href="/articles/">
            所有文章
          </Link>
        </div>
        <div className="article-grid">
          {related.map((r) => (
            <ArticleCard article={r} key={r.slug} />
          ))}
        </div>
      </section>
    </div>
  );
}
