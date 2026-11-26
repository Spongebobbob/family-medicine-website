import type { ArticleFigure as Figure } from "@/lib/article-figures";
import type { Reference } from "@/lib/content";
import { StatisticalChart } from "./statistical-chart";
import { EvidenceDiagram } from "./evidence-diagram";
import { ForestChart } from "./forest-chart";

export function ArticleFigure({ figure, references }: { figure: Figure; references: Reference[] }) {
  return <figure className="evidence-figure" id={`figure-${figure.id}`}>
    <figcaption className="figure-title">{figure.title}</figcaption>
    {figure.type === "bar" ? <>
      <p className="figure-population">{figure.population}；單位：{figure.unit}</p>
      <StatisticalChart figure={figure} />
      <details className="figure-text"><summary>查看圖表數據</summary>
        <div className="article-table-scroll" tabIndex={0} role="region" aria-label={`${figure.title}資料表`}><table>
          <caption>{figure.title}（{figure.unit}）</caption>
          <thead><tr><th scope="col">年代／分組</th>{figure.series.map(series => <th key={series.key} scope="col">{series.label}</th>)}</tr></thead>
          <tbody>{figure.data.map(row => <tr key={row.label}><th scope="row">{row.label}</th>{figure.series.map(series => <td key={series.key}>{row.values[series.key]}{figure.unit}</td>)}</tr>)}</tbody>
        </table></div>
      </details>
    </> : figure.type === "forest" ? <>
      <p className="figure-population">{figure.population}</p>
      <ForestChart figure={figure} />
      <details className="figure-text"><summary>查看圖表數據與信賴區間</summary>
        <div className="article-table-scroll" tabIndex={0} role="region" aria-label={`${figure.title}資料表`}><table>
          <caption>{figure.title}（{figure.measure}；95% CI）</caption>
          <thead><tr><th scope="col">分組／結果</th><th scope="col">{figure.measure}</th><th scope="col">95% CI</th>{figure.rows.some(row=>row.n!==undefined)&&<th scope="col">分析人數</th>}</tr></thead>
          <tbody>{figure.rows.map(row=><tr key={row.label}><th scope="row">{row.label}</th><td>{row.estimate}</td><td>{row.lower}–{row.upper}</td>{figure.rows.some(item=>item.n!==undefined)&&<td>{row.n??"未提供"}</td>}</tr>)}</tbody>
        </table></div>
      </details>
    </> : <EvidenceDiagram figure={figure} />}
    <details className="figure-text figure-alternative"><summary>圖表文字說明</summary><p className="figure-description">{figure.alt}</p></details>
    <p className="figure-note">{figure.note}</p>
    <p className="figure-sources">資料來源：{figure.sources.map((id, index) => { const reference = references.find(ref => ref.id === id)!; return <span key={id}>{index > 0 && "；"}<a href={`#ref-${id}`}>[{references.indexOf(reference) + 1}] {reference.publisher}</a></span>; })}</p>
  </figure>;
}
