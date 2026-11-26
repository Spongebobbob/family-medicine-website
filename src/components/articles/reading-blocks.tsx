import type { ReactNode } from "react";
import type { Reference } from "@/lib/content";
import { ReferenceList } from "./reference-list";

type BlockProps = { title: string; children: ReactNode; id?: string };
export function KeyTakeaways({ title = "30 秒看懂重點", children, id }: Omit<BlockProps, "title"> & { title?: string }) {
  return <section className="summary-box key-takeaways" aria-label={title}>
    <h2 id={id}>{title}</h2>{children}
  </section>;
}
export function DeepDive({ title, children }: BlockProps) {
  return <details className="deep-dive" data-deep-dive>
    <summary><span className="reading-label">進階閱讀</span><span>{title}</span></summary>
    <div className="deep-dive-content">{children}</div>
  </details>;
}
export function EvidenceCard({ title, children }: BlockProps) {
  return <aside className="evidence-card" aria-label={title}><p className="reading-block-title"><span className="reading-label">證據解讀</span><strong>{title}</strong></p>{children}</aside>;
}
export function ClinicalAction({ title, children }: BlockProps) {
  return <section className="clinical-action" aria-label={title}><p className="reading-block-title"><span className="reading-label">健康行動</span><strong>{title}</strong></p>{children}</section>;
}
export function RedFlags({ title, children, id }: BlockProps) {
  return <section data-medical-notice className="warning-box" aria-label={title}><h2 id={id}>{title}</h2>{children}</section>;
}
export function MedicalNotice({ children }: BlockProps) {
  return <aside data-medical-notice className="article-medical-note" aria-label="醫療免責聲明">{children}</aside>;
}
export function ComparisonTable({ children, label = "比較表格；可左右捲動" }: { children: ReactNode; label?: string }) {
  return <div className="article-table-scroll comparison-table" tabIndex={0} role="region" aria-label={label}><table>{children}</table></div>;
}
export function References({ references, title = "參考文獻" }: { references: Reference[]; title?: string }) {
  if (!references.length) return null;
  return <section className="reference-section" aria-labelledby="references"><h2 id="references">{title}</h2><ReferenceList references={references} anchors /></section>;
}
