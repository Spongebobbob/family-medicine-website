"use client";
import { useId, useRef, useState } from "react";
import { evaluateMuscle } from "@/lib/aging-sleep-assessments";
import { FormField, ResultPanel, type AssessmentResult, type Field } from "./assessment-form";
import { useClientReady } from "./use-client-ready";
export function AgingSleepAssessment({ kind }: { kind: "sarcopenia" }) {
  const ready = useClientReady(), prefix = useId(), form = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const muscle = kind === "sarcopenia";
  const fields: Field[] = [
    { key: "age", label: "年齡", unit: "歲", min: 65, max: 120, integer: true },
      { key: "sex", label: "生理性別（量測參考值）", choices: [{ value: "male", label: "男性" }, { value: "female", label: "女性" }] },
      { key: "calf", label: "小腿最粗處的圍度（選填）", unit: "公分", min: 10, max: 100, optional: true, hint: "用皮尺水平繞過小腿最粗處，不勒緊；水腫時不適用。" },
      { key: "grip", label: "握力測量值（選填）", unit: "公斤", min: 0, max: 150, optional: true, hint: "使用握力計依標準流程測量；手部疼痛或受傷時請由醫療人員評估。至少填小腿圍或握力其中一項。" },
  ];
  function submit(e: React.FormEvent) {
    e.preventDefault(); const issues: Record<string, string> = {};
    for (const f of fields) {
      const raw = values[f.key]?.trim() ?? "", n = Number(raw);
      if (!raw) { if (!f.optional) issues[f.key] = "請填寫或選擇此欄位。"; continue; }
      if (f.choices ? !f.choices.some(c => c.value === raw) : !Number.isFinite(n) || (f.integer && !Number.isInteger(n)) || n < f.min! || n > f.max!) issues[f.key] = f.choices ? "請選擇有效選項。" : `請輸入 ${f.min}–${f.max} 的${f.integer ? "整數" : "數字"}。`;
    }
    if (muscle && !values.calf?.trim() && !values.grip?.trim()) issues.calf = "請至少填寫小腿圍或握力。";
    setErrors(issues); setResult(null);
    if (Object.keys(issues).length) { requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()); return; }
    setResult(evaluateMuscle({ age: Number(values.age), sex: values.sex, calf: values.calf?.trim() ? Number(values.calf) : null, grip: values.grip?.trim() ? Number(values.grip) : null }));
  }
  return <div className="assessment-workspace">
    <form ref={form} autoComplete="off" noValidate onSubmit={submit}><fieldset className="ready-fieldset" disabled={!ready} aria-label={muscle ? "肌少症量測輸入" : "已有量表總分輸入"}>
      {!ready && <p role="status">工具載入中，請稍候再填寫。</p>}
      <div className="assessment-fields">{fields.map(f => <FormField key={f.key} prefix={prefix} field={f} value={values[f.key] ?? ""} error={errors[f.key]} onChange={v => { setValues(old => ({ ...old, [f.key]: v })); setErrors({}); setResult(null); }} />)}</div>
      {Object.keys(errors).length > 0 && <p role="alert" className="form-error">請依欄位提示核對資料。</p>}
      <div className="calculator-actions"><button className="button" type="submit">{muscle ? "查看量測結果" : "查看分數解讀"}</button><button className="text-link" type="button" onClick={() => { setValues({}); setErrors({}); setResult(null); }}>清除所有輸入</button></div>
    </fieldset></form>
    <ResultPanel result={result} />
  </div>;
}
