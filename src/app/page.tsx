import Link from "next/link";
import { Illustration } from "@/components/illustration";
import { ArticleCard, CategoryCard } from "@/components/cards";
import { Icon } from "@/components/icon";
import { getArticles } from "@/lib/content";
import { categories, site, absolute } from "@/lib/site";
import { pageMetadata, jsonLd } from "@/lib/seo";
export const metadata = pageMetadata(
  "讓健康成為日常",
  site.description,
  "/",
);
export default function Home() {
  const articles = getArticles();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: site.name,
            url: absolute("/"),
            inLanguage: "zh-Hant-TW",
          }),
        }}
      />
      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow">
            <span />
            從家庭醫學出發，陪伴每一個你
          </span>
          <h1>
            把健康知識，
            <br />
            放回<span className="highlight">日常生活。</span>
          </h1>
          <p>
            健康，不只是診間裡的事。
            <br />
            用好懂的文字，陪你認識身體的訊號，
            <br />
            為自己與家人，做出更安心的選擇。
          </p>
          <div className="hero-actions">
            <Link href="/articles/" className="button">
              探索健康衛教
            </Link>
            <Link href="/about/" className="text-link">
              認識這個網站
            </Link>
          </div>
          <div className="hero-footnote">
            <Icon name="book" />
            有依據的知識・有溫度的陪伴
          </div>
        </div>
        <div className="hero-visual">
          <span className="visual-label">每一天，留一點照顧給自己</span>
          <Illustration />
          <div className="visual-note">
            <Icon name="leaf" />
            <span>好好生活，就是健康的開始。</span>
          </div>
        </div>
      </section>
      <div className="values-strip">
        <div className="container values-inner">
          <span>
            <Icon name="book" />
            把專業說明白
          </span>
          <span>
            <Icon name="shield" />
            讓知識有依據
          </span>
          <span>
            <Icon name="heart" />
            陪伴每個生活階段
          </span>
        </div>
      </div>
      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">從你關心的事開始</span>
            <h2>今天，想了解什麼？</h2>
          </div>
          <Link href="/categories/" className="text-link">
            查看全部分類
          </Link>
        </div>
        <div className="category-grid">
          {categories.map((c) => (
            <CategoryCard key={c.slug} category={c} />
          ))}
        </div>
      </section>
      <section className="soft-section">
        <div className="container section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">健康閱讀，慢慢累積</span>
              <h2>給生活的健康筆記</h2>
              <p>從常見的問題開始，多了解自己一點。</p>
            </div>
            <Link href="/articles/" className="text-link">
              瀏覽所有文章
            </Link>
          </div>
          <div className="article-grid">
            {articles.slice(0, 3).map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
          <p className="sample-note">
            目前收錄三篇示範文章，皆待醫師審閱，僅供網站功能展示。
          </p>
        </div>
      </section>
      <section className="container section">
        <div className="tool-banner">
          <div className="tool-emblem">
            <Icon name="scale" />
          </div>
          <div>
            <span className="eyebrow">多認識身體一點</span>
            <h2>從認識工具，開始關心自己。</h2>
            <p>探索睡眠、心理、代謝與肝腎健康工具，了解適用範圍與準備狀態。</p>
            <span className="privacy-note">無須註冊・資料不會上傳或儲存</span>
          </div>
          <Link href="/tools/" className="button">
            探索自我評估中心
          </Link>
        </div>
      </section>
      <section className="container closing-note">
        <Icon name="leaf" />
        <h2>每一份理解，都是照顧的開始。</h2>
        <p>不急著找到所有答案，先從今天的一個小問題開始。</p>
      </section>
    </>
  );
}
