"use client";
import { useId, useState } from "react";
import type { DiagramFigure, DiagramNode } from "@/lib/article-figures";

export function EvidenceDiagram({ figure }: { figure: DiagramFigure }) {
  const id = useId().replaceAll(":", "");
  const [zoom, setZoom] = useState(100);
  const anchor = (node: DiagramNode, side = "bottom") => side === "top" ? {x:node.x+node.width/2,y:node.y} : side === "left" ? {x:node.x,y:node.y+node.height/2} : side === "right" ? {x:node.x+node.width,y:node.y+node.height/2} : {x:node.x+node.width/2,y:node.y+node.height};
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
        <defs><marker id={`${id}-arrow`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 8 4 0 8Z" fill="#587b68" /></marker><marker id={`${id}-inhibit`} markerWidth="8" markerHeight="10" refX="6" refY="5" orient="auto"><path d="M6 0V10" stroke="#8b6951" strokeWidth="2" /></marker></defs>
        {figure.edges.map((edge, index) => {
          const from = figure.nodes.find(node => node.id === edge.from)!;
          const to = figure.nodes.find(node => node.id === edge.to)!;
          const {x:x1,y:y1} = anchor(from,edge.fromSide);
          const {x:x2,y:y2} = anchor(to,edge.toSide??"top");
          const middle = (y1 + y2) / 2;
          const path = edge.via ? `M${x1} ${y1} ${[...edge.via,{x:x2,y:y2}].map(p=>`L${p.x} ${p.y}`).join(" ")}` : `M${x1} ${y1} V${middle} H${x2} V${y2 - 5}`;
          return <g key={index}><path d={path} fill="none" stroke={edge.effect?"#8b6951":"#587b68"} strokeWidth="2" markerEnd={`url(#${id}-${edge.effect?"inhibit":"arrow"})`} />{edge.label && <text x={edge.labelPosition?.x??x2+10} y={edge.labelPosition?.y??middle-8} fontSize="16" fill="#385b47">{edge.label}</text>}</g>;
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
      <ul>{figure.edges.map((edge, index) => <li key={index}>{figure.nodes.find(node => node.id === edge.from)!.title} {edge.effect?"抑制":"→"} {edge.label ? `${edge.label}：` : ""}{figure.nodes.find(node => node.id === edge.to)!.title}</li>)}</ul>
    </details>
  </>;
}
