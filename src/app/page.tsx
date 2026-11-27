import Link from "next/link";
import { ArticleCard } from "@/components/cards";
import { Icon } from "@/components/icon";
import { getArticles } from "@/lib/content";
import { categories, site, absolute } from "@/lib/site";
import { pageMetadata, jsonLd } from "@/lib/seo";

export const metadata = pageMetadata("實證家庭醫學 ｜ 王柏霖醫師", site.description, "/");

const quickTools = [
  { slug: "ldl-target", name: "LDL 目標", icon: "heart" },
  { slug: "fib-4", name: "FIB-4", icon: "chart" },
  { slug: "egfr", name: "腎功能", icon: "droplet" },
  { slug: "isi", name: "失眠評估", icon: "moon" },
  { slug: "taiwan-cancer-screening", name: "癌症篩檢", icon: "shield" },
  { slug: "adult-health-check", name: "成人健檢", icon: "clipboard" },
];
const categoryNames = ["睡眠身心", "三高慢性病", "健檢解讀", "體重管理", "肌骨疼痛", "旅遊醫學", "預防醫學", "高齡健康", "用藥知識"];
const labLinks = [
  { label: "LDL", href: "/articles/ldl-cholesterol/" },
  { label: "ALT", href: "/tools/fib-4/" },
  { label: "eGFR", href: "/tools/egfr/" },
  { label: "尿酸", href: "/articles/hyperuricemia/" },
  { label: "HbA1c", href: "/search/?q=HbA1c" },
  { label: "TSH", href: "/articles/tsh/" },
];

export default function Home() {
  const articles = getArticles();
  return <div className="home-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ "@context": "https://schema.org", "@type": "WebSite", name: site.name, url: absolute("/"), inLanguage: "zh-Hant-TW" }) }} />
    <section className="home-hero" aria-labelledby="home-title">
      <div className="container home-content">
        <p className="home-eyebrow">EVIDENCE-BASED FAMILY MEDICINE</p>
        <h1 id="home-title">實證家庭醫學 ｜ 王柏霖醫師</h1>
      </div>
    </section>
    <div className="container home-content home-sections">
      <section className="home-section" aria-labelledby="quick-tools-title">
        <h2 id="quick-tools-title">快速健康工具</h2>
        <div className="home-tools-grid">
          {quickTools.map(tool => <Link key={tool.slug} href={`/tools/${tool.slug}/`} className="home-tool"><Icon name={tool.icon} /><span>{tool.name}</span></Link>)}
        </div>
        <Link href="/tools/" className="home-all-tools">查看全部健康工具</Link>
      </section>
      <section className="home-section home-labs" aria-labelledby="lab-links-title">
        <h2 id="lab-links-title">健檢紅字看不懂？</h2>
        <div className="home-lab-links">{labLinks.map(lab => <Link key={lab.label} href={lab.href}>{lab.label}</Link>)}</div>
      </section>
      <section className="home-section" aria-labelledby="home-categories-title">
        <h2 id="home-categories-title">健康衛教專區</h2>
        <div className="home-categories-grid">
          {categories.map((category, index) => <Link key={category.slug} href={`/categories/${category.slug}/`} className="home-category" aria-label={category.name}>
            <Icon name={category.slug === "travel-medicine" ? "plane" : category.slug === "older-adults" ? "people" : category.icon} />
            <span>{categoryNames[index]}</span>
          </Link>)}
        </div>
      </section>
      <section className="home-section home-reading" aria-labelledby="home-reading-title">
        <div className="section-heading"><h2 id="home-reading-title">日常健康筆記</h2><Link href="/articles/" className="text-link">查看全部文章</Link></div>
        <div className="article-grid">{articles.slice(0, 3).map(article => <ArticleCard key={article.slug} article={article} />)}</div>
        <p className="sample-note">標示為示範內容的文章僅供網站功能展示。</p>
      </section>
    </div>
  </div>;
}
