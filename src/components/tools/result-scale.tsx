import type { ResultVisual } from "@/lib/result-visuals";

export function ResultScale({ scale }: { scale: NonNullable<ResultVisual["scale"]> }) {
  const { bands, active } = scale;
  const selected = bands[active];
  return (
    <figure className="result-scale" aria-label={`分級落點：${selected.label}，${selected.range}。${bands.map(b => `${b.label}：${b.range}`).join("；")}`}>
      <div className="result-scale-chart" aria-hidden="true">
        <span className="result-scale-marker" style={{ left: `${((active + 0.5) / bands.length) * 100}%` }} />
        <div className="result-scale-track">
          {bands.map((band, i) => <span key={band.label} className={`result-band band-${band.tone}${i === active ? " is-active" : ""}`} />)}
        </div>
        <div className="result-scale-labels">
          {bands.map((band, i) => <span key={band.label} className={i === active ? "is-active" : undefined}>{band.label}</span>)}
        </div>
      </div>
      <figcaption>{selected.range}</figcaption>
    </figure>
  );
}
