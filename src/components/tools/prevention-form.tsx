"use client";
import { useId, useRef, useState } from "react";
import { adultHealthCheck, adultVaccines, cancerScreening, preventionOverview, POLICY_YEAR, type PreventionKind, type PreventionResult, type PreventionValues } from "@/lib/prevention-assessments";
import { FormField, type Field } from "./assessment-form";
import { useClientReady } from "./use-client-ready";

const yesNo = [{ value: "no", label: "否" }, { value: "yes", label: "是" }];
const known = [...yesNo, { value: "unknown", label: "不清楚" }];
const birth: Field = { key: "birthYear", label: "出生西元年", min: POLICY_YEAR - 120, max: POLICY_YEAR - 18, integer: true, hint: "例如民國 75 年填 1986；公費篩檢以就醫年減出生年計算年齡。" };
const indigenous: Field = { key: "indigenous", label: "是否具有原住民身分？", choices: yesNo };
const histories = [
  ["breast", "乳房 X 光攝影"], ["pap", "子宮頸抹片"], ["hpv", "35／45／65 歲本階段 HPV 檢測"],
  ["colon", "糞便潛血檢查"], ["oral", "口腔黏膜檢查"], ["lung", "肺部低劑量電腦斷層"], ["stomach", "幽門螺旋桿菌公費檢測（含試辦、原鄉吹氣）"],
] as const;
const initial: Record<PreventionKind, PreventionValues> = {
  "taiwan-cancer-screening": Object.fromEntries(histories.map(([key]) => [key, "unknown"])),
  "adult-health-check": { check: "unknown" },
  "adult-vaccines": {},
};
function getFields(kind: PreventionKind, v: PreventionValues): Field[] {
  if (kind === "adult-health-check") return [birth, indigenous,
    { key: "polio", label: "是否曾罹患小兒麻痺？", choices: yesNo },
    { key: "hepatitis", label: "曾做過公費 B、C 型肝炎篩檢嗎？", choices: known },
  ];
  if (kind === "taiwan-cancer-screening") return [birth,
    { key: "sex", label: "生理性別（公費條件）", choices: [{ value: "female", label: "女性" }, { value: "male", label: "男性" }] },
    { ...indigenous, choices: known },
    { key: "colonFamily", label: "父母、兄弟姊妹或子女曾罹患大腸癌嗎？", choices: known },
    { key: "lungFamily", label: "父母、兄弟姊妹或子女曾罹患肺癌嗎？", choices: known },
    { key: "betel", label: "曾嚼檳榔嗎？（已戒也算）", choices: known },
    { key: "smoking", label: "吸菸狀況", choices: [{ value: "never", label: "從未吸菸" }, { value: "current", label: "目前仍吸菸" }, { value: "quit", label: "已戒菸" }] },
    ...(v.smoking === "current" || v.smoking === "quit" ? [
      { key: "cigarettes", label: "過去平均每天吸幾支菸？", unit: "支", min: 0.1, max: 200 },
      { key: "smokingYears", label: "累積吸菸幾年？", unit: "年", min: 0.1, max: 120 },
      ...(v.smoking === "quit" ? [{ key: "quitYears", label: "戒菸至今幾年？", unit: "年", min: 0, max: 120 }] : []),
    ] : []),
  ];
  return [
    { key: "age", label: "目前年齡（足歲）", unit: "歲", min: 18, max: 120, integer: true }, { ...indigenous, choices: known },
    { key: "pregnant", label: "目前是否懷孕？", choices: known },
    { key: "immune", label: "有免疫不全，或正在接受免疫抑制治療嗎？", choices: known },
    { key: "ipd", label: "有肺炎鏈球菌感染高風險狀況嗎？", choices: known, hint: "如無脾臟、免疫不全、人工電子耳、腦脊髓液滲漏、器官移植，或近一年因癌症接受免疫抑制治療／放療。" },
    { key: "seasonRisk", label: "符合本季其他公費流感及新冠身分嗎？", choices: known, hint: "醫事／防疫人員、照護機構住民或工作人員、托育人員、未滿 6 個月嬰兒的雙親或扶養者、高風險慢性病、BMI ≥30、罕見疾病或重大傷病。" },
    { key: "fluOnly", label: "是高中職／五專前三年級學生，或禽畜防疫相關人員嗎？", choices: known, hint: "這些身分另屬公費流感對象，不直接等同公費新冠資格。" },
    { key: "flu", label: "已接種本季流感疫苗嗎？", choices: known, hint: "本季從 2026 年 10 月起算。" },
    { key: "covid", label: "已接種本季新冠疫苗嗎？", choices: known },
    { key: "pneumo", label: "曾接種哪種肺炎鏈球菌疫苗？", choices: [
      { value: "none", label: "從未接種" }, { value: "ppv", label: "只有 PPV23（23 價）" }, { value: "pcv13", label: "只有 PCV13／15（13／15 價）" },
      { value: "both", label: "PCV13／15 與 PPV23 都打過" }, { value: "pcv20", label: "已打過 PCV20／21（20／21 價）" }, { value: "unknown", label: "不清楚" },
    ] },
    { key: "zoster", label: "重組帶狀疱疹疫苗接種狀況", choices: [{ value: "none", label: "尚未接種" }, { value: "one", label: "已打一劑" }, { value: "two", label: "已完成兩劑" }, { value: "unknown", label: "不清楚（或曾打舊款活性疫苗）" }] },
    { key: "tetanus", label: "破傷風／白喉疫苗接種狀況", choices: [{ value: "recent", label: "基本接種完整，前劑未滿 10 年" }, { value: "over10", label: "基本接種完整，前劑已滿 10 年" }, { value: "incomplete", label: "基本接種不完整或從未接種" }, { value: "unknown", label: "不清楚" }] },
  ];
}
export function PreventionAssessment({ kind }: { kind: PreventionKind }) {
  const ready = useClientReady(), prefix = useId(), form = useRef<HTMLFormElement>(null), results = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<PreventionValues>({ ...initial[kind] });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PreventionResult | null>(null);
  const fields = getFields(kind, values);
  const overview = result ? preventionOverview(kind, result) : null;
  const change = (key: string, value: string) => { setValues(old => ({ ...old, [key]: value })); setResult(null); setErrors({}); };
  const historyFields = kind === "taiwan-cancer-screening" ? histories.filter(([id]) => values.sex !== "male" || !["breast", "pap", "hpv"].includes(id)) : [["check", "成人預防保健"]];
  function history(key: string, label: string) {
    const value = values[key] ?? "unknown";
    return <div key={key}>
      <FormField prefix={prefix} field={{ key: `${key}History`, label, choices: [{ value: "unknown", label: "不清楚／暫不填" }, { value: "never", label: "從未使用此項公費補助" }, { value: "year", label: "記得上次公費檢查年份" }] }} value={/^\d/.test(value) || value === "" ? "year" : value} onChange={s => change(key, s === "year" ? "" : s)} />
      {(/^\d/.test(value) || value === "") && <FormField prefix={prefix} field={{ key, label: "上次檢查西元年", min: Number(values.birthYear) || 1900, max: POLICY_YEAR, integer: true }} value={value} error={errors[key]} onChange={s => change(key, s)} />}
    </div>;
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const issues: Record<string, string> = {};
    for (const f of fields) {
      const raw = values[f.key]?.trim() ?? "", n = Number(raw);
      if (!raw) issues[f.key] = "請填寫或選擇此欄位。";
      else if (f.choices ? !f.choices.some(c => c.value === raw) : !Number.isFinite(n) || (f.integer && !Number.isInteger(n)) || (f.min !== undefined && n < f.min) || (f.max !== undefined && n > f.max)) issues[f.key] = f.choices ? "請選擇有效選項。" : `請輸入 ${f.min}–${f.max} 的${f.integer ? "整數" : "數字"}。`;
    }
    if (kind !== "adult-vaccines") for (const [key] of historyFields) {
      const raw = values[key] ?? "unknown";
      if (raw !== "unknown" && raw !== "never" && (!/^\d{4}$/.test(raw) || Number(raw) > POLICY_YEAR || Number(raw) < Number(values.birthYear) + (key === "check" ? 30 : 0))) issues[key] = "請核對上次檢查的西元年份。";
    }
    if (kind === "taiwan-cancer-screening" && values.smoking !== "never") {
      const age = POLICY_YEAR - Number(values.birthYear);
      if (Number(values.smokingYears) + (values.smoking === "quit" ? Number(values.quitYears) : 0) > age) issues.smokingYears = "吸菸與戒菸年數合計不能超過年齡。";
    }
    const calculated = Object.keys(issues).length ? null : kind === "taiwan-cancer-screening" ? cancerScreening(values) : kind === "adult-health-check" ? adultHealthCheck(values) : adultVaccines(values);
    setErrors(issues); setResult(calculated);
    if (Object.keys(issues).length) requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
    else if (calculated) requestAnimationFrame(() => results.current?.focus());
  }
  return <div className="assessment-workspace">
    <form ref={form} autoComplete="off" noValidate onSubmit={submit}>
      <fieldset className="ready-fieldset" disabled={!ready} aria-label="預防保健資格輸入">
        {!ready && <p role="status">工具載入中，請稍候再填寫。</p>}
        <div className="assessment-fields">{fields.map(f => <FormField key={f.key} field={f} prefix={prefix} value={values[f.key] ?? ""} error={errors[f.key]} onChange={s => change(f.key, s)} />)}</div>
        {kind !== "adult-vaccines" && <details className="prevention-history" open={kind === "adult-health-check" || undefined}><summary>上次公費檢查紀錄{kind === "taiwan-cancer-screening" ? "（選填）" : ""}</summary><div className="assessment-fields">{historyFields.map(([key, label]) => history(key, label))}</div></details>}
        {Object.keys(errors).length > 0 && <p role="alert" className="form-error">請依欄位提示核對資料。</p>}
        <div className="calculator-actions"><button type="submit" className="button">{kind === "adult-vaccines" ? "查看接種建議" : "查看公費資格"}</button><button type="button" className="text-link" onClick={() => { setValues({ ...initial[kind] }); setErrors({}); setResult(null); }}>清除所有輸入</button></div>
      </fieldset>
    </form>
    <div ref={results} tabIndex={-1} aria-label="評估結果" aria-live="polite" className="prevention-results">
      {result ? <>
        <div className="prevention-overview"><span className="prevention-count">{overview!.count}</span><div><h2>{overview!.title}</h2><p>{overview!.detail}</p></div></div>
        <div className="prevention-result-list">{result.items.map(i => <article className={`prevention-result-card${i.action ? " is-actionable" : ""}`} key={i.id}><h3>{i.title}</h3><p className="prevention-status">{i.action && <span aria-hidden="true">✓ </span>}{i.status}</p><p>{i.detail}</p></article>)}</div>
        <p className="field-hint">{result.summary}</p>
      </> : <p className="field-hint">填寫後查看適合你的項目。</p>}
    </div>
  </div>;
}
