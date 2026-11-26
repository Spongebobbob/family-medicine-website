import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticles, getArticle } from "@/lib/content";
import { categoryBySlug, absolute, site } from "@/lib/site";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout";
import { ArticleCard } from "@/components/cards";
import { ArticleMarkdown } from "@/components/markdown";
import { Icon } from "@/components/icon";
import { KeyTakeaways, RedFlags, MedicalNotice, References } from "@/components/articles/reading-blocks";
import { ArticleAnchorNavigation } from "@/components/articles/anchor-navigation";
import { coreHeadingsFor } from "@/lib/article-reading";
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
    authors: [{ name: site.articleEditor, url: absolute("/about/") }],
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: a.published,
      modifiedTime: a.updated,
      authors: [site.articleEditor],
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
  const SafetyNotice = a.warnings.length ? RedFlags : MedicalNotice;
  const headings = coreHeadingsFor(a.body);
  const sectionTitles = { warnings: a.numberedSections ? "15. 就醫時機" : "警示症狀與就醫時機", faq: a.numberedSections ? "16. 常見問題 FAQ" : "常見問題", references: a.numberedSections ? "17. 參考文獻 References" : "參考文獻" };
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
      <ArticleAnchorNavigation />
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
                  "@type": "Organization",
                  name: site.name,
                  url: absolute("/about/"),
                },
                publisher: { "@type": "Organization", name: site.name },
                citation: a.references.map((r) => r.url),
                editor: { "@type": "Person", name: site.articleEditor, url: absolute("/about/") },
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
            <h1>{a.title.split("：")[0]}</h1>
            <div className="author-line">
              <span className="author-avatar">
                <Icon name="leaf" />
              </span>
              <div>
                <span>{site.articleEditor} 編輯</span>
                <small>
                  更新於 <time dateTime={a.updated}>{a.updated}</time>
                  　・　核心閱讀約 {a.reading.core} 分鐘
                  {a.reading.hasDeepDive && `　・　含進階與 FAQ 約 ${a.reading.full} 分鐘（不含文獻）`}
                </small>
              </div>
            </div>
          </header>
          {a.summary.length > 0 && <KeyTakeaways id="summary">
            <ul>{a.summary.map(s => <li key={s}><ArticleMarkdown body={`**${s}**`} references={a.references} /></li>)}</ul>
          </KeyTakeaways>}
          <details className="mobile-toc">
            <summary>這篇文章會談到什麼？</summary>
            <ul>
              {headings.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`}>{h.text}</a>
                </li>
              ))}
              {a.warnings.length > 0 && <li>
                <a href="#warnings">{sectionTitles.warnings}</a>
              </li>}
              {a.faq.length > 0 && <li>
                <a href="#faq">{sectionTitles.faq}</a>
              </li>}
              <li>
                <a href="#references">{sectionTitles.references}</a>
              </li>
            </ul>
          </details>
          <div className="prose">
            <ArticleMarkdown body={a.body} figures={a.figures} references={a.references} />
          </div>
          <SafetyNotice id="warnings" title={sectionTitles.warnings}>
            <ul>
              {a.warnings.map((w) => (
                <li key={w}><ArticleMarkdown body={w} references={a.references} /></li>
              ))}
            </ul>
            {a.warnings.length > 0 && <p>若有緊急症狀，請立即就醫或撥打 119。</p>}
            <p>本文提供一般健康衛教，不能取代個別診斷、治療或處方；請勿自行開始、停用或調整藥物。</p>
          </SafetyNotice>
          {a.faq.length > 0 && <section className="faq-section" aria-labelledby="faq">
            <h2 id="faq">{sectionTitles.faq}</h2>
            {a.faq.map((q) => (
              <details key={q.question}>
                <summary>{q.question}</summary>
                <ArticleMarkdown body={q.answer} references={a.references} />
              </details>
            ))}
          </section>}
          <References references={a.references} title={sectionTitles.references} />
        </article>
        <aside className="desktop-toc">
          <div>
            <span className="eyebrow">本文目錄</span>
            {a.summary.length > 0 && <a href="#summary">30 秒看懂重點</a>}
            {headings.map((h) => (
              <a
                className={h.depth > 2 ? "toc-indent" : ""}
                href={`#${h.id}`}
                key={h.id}
              >
                {h.text}
              </a>
            ))}
            {a.warnings.length > 0 && <a href="#warnings">{sectionTitles.warnings}</a>}
            {a.faq.length > 0 && <a href="#faq">{sectionTitles.faq}</a>}
            <a href="#references">{sectionTitles.references}</a>
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
