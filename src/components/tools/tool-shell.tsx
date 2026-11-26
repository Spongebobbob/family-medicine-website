import Link from "next/link";
import { Breadcrumbs, PageIntro } from "@/components/layout";

import { getToolGroup, type HealthTool } from "@/lib/tool-catalog";
export function ToolShell({
  tool,
  children,
}: {
  tool: HealthTool;
  children: React.ReactNode;
}) {
  const group = getToolGroup(tool.group)!;
  return (
    <div
      className="container page-space"
      data-health-tool={tool.slug}
      data-tool-available="true"
    >
      <Breadcrumbs
        items={[
          { label: "健康自我評估", href: "/tools/" },
          { label: group.name, href: `/tools/categories/${group.slug}/` },
          { label: tool.shortName },
        ]}
      />
      <PageIntro eyebrow="" title={tool.name}>{null}</PageIntro>
      <>
          <section className="tool-panel">
            {children}
          </section>
          <details className="reading-width prose tool-explanation" open={tool.kind === "calculator" && !["cardiovascular-risk", "metabolic-syndrome", "tdee", "waist-height-ratio", "sarcopenia", "ldl-target", "egfr", "altitude-illness"].includes(tool.slug)}>
            <summary>結果解讀與適用限制</summary>
            {tool.formula && (
              <>
                <h2>使用的公式</h2>
                <p className="formula-text">{tool.formula}</p>
                {tool.slug === "egfr" && (
                  <p>
                    µmol/L ÷ 88.4 轉為
                    mg/dL。分類依原始計算值，不先四捨五入；單位為 mL/min/1.73
                    m²。
                  </p>
                )}
              </>
            )}
            <h2>如何理解結果與限制</h2>
            <ul>
              {tool.limitations.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            {tool.slug === "egfr" && (
              <div className="table-scroll">
                <table>
                  <caption>
                    G 分類僅描述本次 eGFR 區間，不能單獨診斷 CKD
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">G 分類</th>
                      <th scope="col">eGFR（mL/min/1.73 m²）</th>
                      <th scope="col">描述</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["G1", "≥90", "正常或偏高區間"],
                      ["G2", "60–<90", "輕度降低"],
                      ["G3a", "45–<60", "輕至中度降低"],
                      ["G3b", "30–<45", "中至重度降低"],
                      ["G4", "15–<30", "重度降低"],
                      ["G5", "<15", "極低腎功能，需及時評估"],
                    ].map((row) => (
                      <tr key={row[0]}>
                        {row.map((cell) => (
                          <td key={cell}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <h2>何時尋求醫療協助</h2>
            <p>{tool.advice}</p>
          </details>
      </>
      <details
        className="reading-width reference-section"
        aria-labelledby="tool-sources"
      >
        <summary id="tool-sources">研究與指引來源</summary>
        <ol>
          {tool.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title}
              </a>
              <span>{s.detail}</span>
            </li>
          ))}
        </ol>
      </details>
      <section className="reading-width related-tool-reading">
        <h2>延伸閱讀</h2>
        <ul>
          {tool.related.map((a) => (
            <li key={a.href}>
              <Link href={a.href}>{a.label}</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
