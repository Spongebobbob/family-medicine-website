import { albuminCategories, kidneyGCategories, kidneyRiskGrid, kidneyRiskLevels, type KidneyRisk } from "@/lib/kidney-risk";

export function KidneyRiskMatrix({ result }: { result: KidneyRisk }) {
  return <figure className="kidney-matrix">
    <figcaption>KDIGO G／A 風險矩陣</figcaption>
    <p className="field-hint">橫軸：UACR（mg/g）・縱軸：eGFR（mL/min/1.73 m²）</p>
    <table aria-label={`KDIGO 腎臟風險分層；本次 ${result.g}，${result.a ?? "UACR 未填，無法定位"}`}>
      <thead><tr><th scope="col">G／A</th>{albuminCategories.map(a => <th scope="col" key={a.category}>{a.category}<span>{a.range}</span></th>)}</tr></thead>
      <tbody>{kidneyGCategories.map((g, row) => <tr key={g.category}>
        <th scope="row">{g.category}<span>{g.range}</span></th>
        {albuminCategories.map((a, column) => {
          const level = kidneyRiskGrid[row][column];
          const active = row === result.row && column === result.column;
          return <td key={a.category} data-risk={level} className={active ? "is-current" : undefined} aria-current={active ? "true" : undefined}>
            <span className="sr-only">{g.category}／{a.category}：{kidneyRiskLevels[level].label}{active ? "，你的位置" : ""}</span>
            {active && <span className="kidney-current" aria-hidden="true">●<span>目前</span></span>}
          </td>;
        })}
      </tr>)}</tbody>
    </table>
    <ul className="kidney-legend" aria-label="風險色階">{kidneyRiskLevels.map((risk, i) => <li key={risk.label}><i data-risk={i} aria-hidden="true" />{risk.label}</li>)}</ul>
    {result.a === null && <p className="field-hint">未填 UACR，尚無法判定 A 分類及矩陣位置。</p>}
  </figure>;
}
