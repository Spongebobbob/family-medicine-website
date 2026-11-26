export function SafetyNotice() {
  return (
    <aside data-medical-notice className="safety-notice" role="alert" aria-labelledby="phq9-safety">
      <h3 id="phq9-safety">先照顧此刻的安全，分數可以稍後再看</h3>
      <p>
        你填入的第九題分數不為零。這需要進一步關心與專業評估，不能只用總分判斷；也不代表僅憑這一題就能診斷或判定危險程度。
      </p>
      <p>
        如果你現在有傷害自己的念頭、計畫，或無法確保自己的安全，請立即撥打{" "}
        <a href="tel:119">119</a>{" "}
        或前往急診。盡可能請信任的人陪伴，暫時遠離可能傷害自己的物品。
      </p>
      <p>
        即使沒有立即危險，也請儘快聯絡醫師或心理專業人員。台灣{" "}
        <a href="tel:+8861925?oai_link_source=model_response_hotline">1925</a>{" "}
        安心專線提供全天候、免費的支持。
      </p>
      <p>第九題為零，也不能保證沒有自傷風險；若你感到不安全，仍請立即求助。</p>
      <a
        href="https://www.mohw.gov.tw/cp-16-19209-1.html?oai_link_source=model_response_hotline"
        target="_blank"
        rel="noopener noreferrer"
      >
        1925 安心專線資訊
      </a>
    </aside>
  );
}
