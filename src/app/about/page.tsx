import Link from "next/link";
import { Breadcrumbs, PageIntro } from "@/components/layout";
import { Icon } from "@/components/icon";
import { site, absolute } from "@/lib/site";
import { pageMetadata, jsonLd } from "@/lib/seo";
export const metadata = pageMetadata(
  "醫師介紹與關於本站",
  "認識本站的衛教理念、作者資訊與內容審閱原則。",
  "/about/",
);
export default function About() {
  const physician = site.physician;
  return (
    <div className="container page-space">
      <Breadcrumbs items={[{ label: "醫師介紹" }]} />
      <PageIntro
        eyebrow="專業之外，更在意理解與陪伴"
        title="從診間的提問，走進日常的照顧。"
      >
        <p>這裡是一個以家庭醫學為起點的個人衛教網站。</p>
      </PageIntro>
      {physician.name ? (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: jsonLd({
                "@context": "https://schema.org",
                "@type": "Person",
                name: physician.name,
                description: physician.biography,
                url: absolute("/about/"),
              }),
            }}
          />
          <section className="profile-panel">
            <Icon name="leaf" />
            <div>
              <h2>{physician.name}</h2>
              <p>{physician.biography}</p>
              <ul>
                {physician.credentials.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </section>
        </>
      ) : (
        <section className="profile-panel">
          <div className="profile-symbol">
            <Icon name="leaf" />
          </div>
          <div>
            <span className="eyebrow">醫師資料待補</span>
            <h2>關於這裡的醫師</h2>
            <p>
              醫師姓名、照片、學經歷、專科資格及服務資訊，將在本人提供並確認後刊載。目前尚未填入任何身分或資格資料。
            </p>
          </div>
        </section>
      )}
      <div className="reading-width prose">
        <h2>把醫學知識，說成聽得懂的日常</h2>
        <p>
          面對一份健檢報告、一個反覆出現的不舒服，或家人的健康變化，很多時候，我們需要的是一個清楚的解釋。
        </p>
        <p>
          本站希望以容易閱讀的文字，整理常見健康問題，說明可以和醫師討論的重點，也提醒哪些情況需要及時就醫。
        </p>
        <h2>我們希望做到的事</h2>
        <ul>
          <li>提供可追溯的資料來源，清楚標示發布與更新時間。</li>
          <li>說明資訊的適用限制，不以單一數字取代個別評估。</li>
          <li>以尊重、容易理解的方式，陪伴不同年齡的讀者。</li>
        </ul>
        <h2>目前的內容狀態</h2>
        <p>
          本站為 MVP
          示範內容會另行標示。本站不提供線上診斷、處方或緊急醫療服務。
        </p>
        <p>
          <Link href="/policy/">了解醫療免責聲明與編輯政策</Link>
        </p>
      </div>
    </div>
  );
}
