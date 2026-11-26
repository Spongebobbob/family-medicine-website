import Link from "next/link";
import { Breadcrumbs, PageIntro } from "@/components/layout";
import { getArticles } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "參考文獻",
  "查看示範衛教文章的資料來源與查閱日期。",
  "/references/",
);
export default function References() {
  return (
    <div className="container page-space">
      <Breadcrumbs items={[{ label: "參考文獻" }]} />
      <PageIntro eyebrow="每一份知識，都有出處" title="參考文獻與資料來源">
        <p>
          優先採用政府、醫學組織與可信賴醫療機構的公開資料。示範內容仍待醫師審閱。
        </p>
      </PageIntro>
      <div className="reading-width">
        {getArticles().map((a) => (
          <section className="reference-section" key={a.slug}>
            <h2>
              <Link href={`/articles/${a.slug}/`}>{a.title}</Link>
            </h2>
            <ol>
              {a.references.map((r) => (
                <li key={r.id}>
                  <a href={r.url} rel="noopener noreferrer" target="_blank">
                    {r.title}
                  </a>
                  <span>
                    {r.publisher}・查閱日期 {r.accessed}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ))}
        <section className="reference-section">
          <h2>健康工具</h2>
          <p>
            <a
              href="https://www.hpa.gov.tw/Pages/List.aspx?nodeid=1757"
              rel="noopener noreferrer"
              target="_blank"
            >
              健康體位
            </a>
            ｜衛生福利部國民健康署・查閱日期 2026-11-25
          </p>
        </section>
      </div>
    </div>
  );
}
