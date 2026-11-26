"use client";
import { CartesianGrid, ErrorBar, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { forestAxis, type ForestFigure } from "@/lib/article-figures";

export function ForestChart({ figure }: { figure: ForestFigure }) {
  const rows = figure.rows.map((row, index) => ({ ...row, position: figure.rows.length - 1 - index, error: [row.estimate - row.lower, row.upper - row.estimate] }));
  const {domain, ticks} = forestAxis(figure);
  return <div className="evidence-chart forest-chart" role="img" aria-label={figure.alt}>
    <ResponsiveContainer width="100%" height={Math.max(240, rows.length * 66 + 80)} minWidth={0}>
      <ScatterChart margin={{top:20,right:20,bottom:32,left:0}} accessibilityLayer>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" dataKey="estimate" domain={domain} ticks={ticks} minTickGap={12} tick={{fontSize:14}} label={{value:figure.measure,position:"bottom",offset:12}} />
        <YAxis type="number" dataKey="position" domain={[-.5,rows.length-.5]} ticks={rows.map(row=>row.position)} tickFormatter={value=>rows.find(row=>row.position===value)?.label??""} width={112} tick={{fontSize:14}} axisLine={false} tickLine={false} />
        <ReferenceLine x={figure.nullValue} stroke="#8b6951" strokeDasharray="5 4" />
        <Tooltip content={({active,payload})=>{ const row=payload?.[0]?.payload as ForestFigure["rows"][number]|undefined;return active&&row?<div className="forest-tooltip"><strong>{row.label}</strong><br />{figure.measure} {row.estimate}（95% CI {row.lower}–{row.upper}）</div>:null; }} />
        <Scatter data={rows} fill="#315e49" isAnimationActive={false}>
          <ErrorBar dataKey="error" direction="x" width={8} stroke="#315e49" strokeWidth={2} />
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
    <p className="figure-note">{figure.axisLabel}；虛線為無效值 {figure.nullValue}。點為估計值，橫線為 95% 信賴區間。</p>
  </div>;
}
