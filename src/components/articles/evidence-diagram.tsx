"use client";
import { useId, useState } from "react";
import type { DiagramFigure } from "@/lib/article-figures";

export function EvidenceDiagram({ figure }: { figure: DiagramFigure }) {
  const id = useId().replaceAll(":", "");
  const [zoom, setZoom] = useState(100);
  return <>
    <div className="diagram-controls" aria-label={`${figure.title}縮放控制`}>
      <button type="button" onClick={() => setZoom(value => Math.max(100, value - 25))} disabled={zoom === 100}>縮小</button>
      <output aria-live="polite">{zoom}%</output>
      <button type="button" onClick={() => setZoom(value => Math.min(200, value + 25))} disabled={zoom === 200}>放大</button>
      <button type="button" onClick={() => setZoom(100)} disabled={zoom === 100}>重設</button>
    </div>
    <p className="figure-note">可左右滑動查看圖示，或展開下方文字版。</p>
    <div className="diagram-scroll" tabIndex={0} role="region" aria-label={`${figure.title}；可左右捲動`}>
      <svg viewBox={`0 0 ${figure.width} ${figure.height}`} style={{ width: `${zoom}%`, minWidth: 660 * zoom / 100 }} role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>{figure.title}</title><desc id={`${id}-desc`}>{figure.alt}</desc>
        <defs><marker id={`${id}-arrow`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 8 4 0 8Z" fill="#587b68" /></marker></defs>
        {figure.edges.map((edge, index) => {
          const from = figure.nodes.find(node => node.id === edge.from)!;
          const to = figure.nodes.find(node => node.id === edge.to)!;
          const x1 = from.x + from.width / 2, y1 = from.y + from.height;
          const x2 = to.x + to.width / 2, y2 = to.y;
          const middle = (y1 + y2) / 2;
          return <g key={index}><path d={`M${x1} ${y1} V${middle} H${x2} V${y2 - 5}`} fill="none" stroke="#587b68" strokeWidth="2" markerEnd={`url(#${id}-arrow)`} />{edge.label && <text x={x2 + 10} y={middle - 8} fontSize="16" fill="#385b47">{edge.label}</text>}</g>;
        })}
        {figure.nodes.map(node => <g key={node.id}>
          <rect x={node.x} y={node.y} width={node.width} height={node.height} rx="12" fill="#f2f7f2" stroke="#a5baaa" />
          <text x={node.x + node.width / 2} y={node.y + 32} textAnchor="middle" fill="#243f34" fontSize="20" fontWeight="600">{node.title}</text>
          {node.lines.map((line, index) => <text key={index} x={node.x + node.width / 2} y={node.y + 62 + index * 24} textAnchor="middle" fill="#4d5c53" fontSize="17">{line}</text>)}
        </g>)}
      </svg>
    </div>
    <details className="figure-text"><summary>查看圖示文字與分支</summary>
      <ul>{figure.nodes.map(node => <li key={node.id}><strong>{node.title}</strong>：{node.lines.join("；")}</li>)}</ul>
      <ul>{figure.edges.map((edge, index) => <li key={index}>{figure.nodes.find(node => node.id === edge.from)!.title} → {edge.label ? `${edge.label}：` : ""}{figure.nodes.find(node => node.id === edge.to)!.title}</li>)}</ul>
    </details>
  </>;
}
