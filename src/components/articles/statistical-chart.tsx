"use client";
import { BarChart, Bar, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { StatisticalFigure } from "@/lib/article-figures";

export function StatisticalChart({ figure }: { figure: StatisticalFigure }) {
  const rows = figure.data.map(row => ({ label: row.label, ...row.values }));
  const colors = ["#315e49", "#a66c43", "#6577a1"];
  return <div className="evidence-chart" role="img" aria-label={figure.alt}>
    <ResponsiveContainer width="100%" height={290} minWidth={0}>
      <BarChart data={rows} margin={{ top: 18, right: 12, left: 0, bottom: 12 }} accessibilityLayer>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 14 }} interval={0} />
        <YAxis unit={figure.unit} tick={{ fontSize: 14 }} width={56} domain={[0, "auto"]} />
        <Tooltip formatter={(value, name) => [`${value}${figure.unit}`, name]} />
        <Legend />
        {figure.series.map((series, index) => <Bar key={series.key} dataKey={series.key} name={series.label} fill={colors[index % colors.length]} radius={[4, 4, 0, 0]} isAnimationActive={false} />)}
      </BarChart>
    </ResponsiveContainer>
  </div>;
}
