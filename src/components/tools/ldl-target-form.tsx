"use client";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { evaluateLdlTarget, ldlLevels, type LdlInput, type LdlAnswer } from "@/lib/ldl-target";
import { FormField, ResultPanel, type AssessmentResult, type Field } from "./assessment-form";
import { useClientReady } from "./use-client-ready";
const yesNo = [{ value: "no", label: "無此已知情況" }, { value: "yes", label: "有" }, { value: "unknown", label: "不清楚" }];
export function LdlTargetForm() {
  const ready = useClientReady(), prefix = useId(), form = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ReturnType<typeof evaluateLdlTarget>>(null);
  const fields: Field[] = [
    { key: "age", label: "年齡", unit: "歲", min: 18, max: 120, integer: true },
    { key: "sex", label: "生理性別（表一參數）", choices: [{ value: "male", label: "男性" }, { value: "female", label: "女性" }] },
    { key: "ldl", label: "本次壞膽固醇（LDL-C，選填）", unit: "mg/dL", min: 1, max: 1000, optional: true },
    { key: "ascvd", label: "有以下任一動脈粥狀硬化疾病或檢查結果嗎？", choices: yesNo, hint: "急性冠心症病史；曾接受心導管介入或繞道；缺血性中風／短暫性腦缺血且合併動脈硬化疾病；有症狀、曾治療或截肢的周邊動脈疾病；或影像證實冠狀、頸動脈、周邊動脈狹窄 ≥50%。" },
    ...(values.ascvd && values.ascvd !== "no" ? [{ key: "extremeCombination", label: "還符合以下任一疾病組合嗎？", choices: yesNo, hint: "①冠狀動脈疾病合併：一年內心肌梗塞、至少兩次梗塞、多支冠狀動脈阻塞、急性冠心症合併糖尿病、或周邊動脈病／頸動脈狹窄。②周邊動脈疾病合併冠狀動脈疾病或頸動脈狹窄。一般冠心病加糖尿病本身不直接等同此條件。" }] : []),
    { key: "diabetes", label: "醫師是否診斷你有糖尿病？", choices: yesNo },
    { key: "kidney", label: "慢性腎臟病狀況", choices: [{ value: "none", label: "無已知慢性腎臟病" }, { value: "predialysis", label: "已確診慢性腎臟病，尚未透析" }, { value: "dialysis", label: "正在透析，需個別評估" }, { value: "unknown", label: "不清楚" }], hint: "表一透析前條件包括 UACR ≥30 mg/g 或 eGFR <60 持續至少 3 個月；不要只用一次紅字自行診斷。" },
    { key: "severeLdl", label: "過去 LDL 曾達到 190 mg/dL 以上嗎？", choices: yesNo, hint: "若正在服藥，請核對用藥前報告，不要因現在降低就否認原有高血脂。" },
    { key: "cac400", label: "已知冠狀動脈鈣化分數 CAC 達 400 以上嗎？", choices: yesNo, hint: "未檢查且無已知結果可選「無此已知情況」；已做過但不清楚結果請選「不清楚」。這不是建議你自行安排檢查。" },
    { key: "hypertension", label: "有高血壓嗎？", choices: yesNo },
    { key: "familyHistory", label: "有早發性冠心病家族史嗎？", choices: yesNo, hint: "男性家屬在 55 歲（含）以前、女性家屬在 65 歲（含）以前發生冠心病；這裡看的是家屬的性別與發病年齡。" },
    { key: "hdl", label: "好的膽固醇（HDL-C，選填）", unit: "mg/dL", min: 1, max: 200, optional: true, hint: "未填會保留為未知，不會當成正常。男性 <40、女性 <50 計一項風險。" },
    { key: "smoking", label: "目前有吸菸嗎？", choices: yesNo },
    { key: "metabolicSyndrome", label: "已知符合代謝症候群嗎？", choices: yesNo },
    { key: "onTreatment", label: "目前正在服用降膽固醇藥嗎？", choices: [{ value: "no", label: "沒有" }, { value: "yes", label: "有" }, { value: "unknown", label: "不清楚" }] },
    { key: "lifestyle", label: "已持續調整飲食、活動及生活型態多久？", choices: [{ value: "not-yet", label: "尚未開始" }, { value: "under3", label: "未滿 3 個月" }, { value: "3to6", label: "3–6 個月" }, { value: "over6", label: "超過 6 個月" }, { value: "unknown", label: "不清楚" }] },
    { key: "total", label: "總膽固醇（選填）", unit: "mg/dL", min: 20, max: 1500, optional: true, hint: "與 HDL 一起填，可另外查看 non-HDL 次要目標。" },
  ];
  const knownHigh = values.ascvd === "yes" || values.extremeCombination === "yes" || values.diabetes === "yes" || ["predialysis", "dialysis"].includes(values.kidney) || values.severeLdl === "yes" || values.cac400 === "yes" || (values.ldl?.trim() && Number(values.ldl) >= 190);
  const primaryKeys = ["hypertension", "familyHistory", "smoking", "metabolicSyndrome", "lifestyle"];
  const activeFields = fields.filter(f => !(knownHigh && primaryKeys.includes(f.key)));
  function submit(e: React.FormEvent) {
    e.preventDefault(); const issues: Record<string, string> = {};
    for (const f of activeFields) {
      const raw = values[f.key]?.trim() ?? "", n = Number(raw);
      if (!raw) { if (!f.optional) issues[f.key] = "請填寫或選擇此欄位。"; continue; }
      if (f.choices ? !f.choices.some(c => c.value === raw) : !Number.isFinite(n) || (f.integer && !Number.isInteger(n)) || n < f.min! || n > f.max!) issues[f.key] = f.choices ? "請選擇有效選項。" : `請輸入 ${f.min}–${f.max} 的${f.integer ? "整數" : "數字"}。`;
    }
    if (values.total?.trim() && ((values.hdl?.trim() && Number(values.total) <= Number(values.hdl)) || (values.ldl?.trim() && Number(values.ldl) > Number(values.total)))) issues.total = "請核對報告：總膽固醇應高於 HDL，且不低於 LDL。";
    setErrors(issues); setResult(null);
    if (Object.keys(issues).length) { requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()); return; }
    const optional = (key: string) => values[key]?.trim() ? Number(values[key]) : null;
    setResult(evaluateLdlTarget({ ...Object.fromEntries(primaryKeys.map(key => [key, "unknown"])), ...values, age: Number(values.age), sex: values.sex as LdlInput["sex"], ldl: optional("ldl"), hdl: optional("hdl"), total: optional("total"), extremeCombination: values.ascvd === "no" ? "no" : values.extremeCombination as LdlAnswer } as LdlInput));
  }
  let panel: AssessmentResult | null = null;
  if (result) {
    const level = ldlLevels[result.knownLevelIndex];
    panel = {
      value: result.dialysis ? "個別評估" : result.certain ? `< ${result.target}` : "待確認", unit: result.dialysis ? "透析病人不直接指定個人目標" : result.certain ? "LDL-C 目標・mg/dL" : "部分資料不清楚，不能指定單一目標",
      label: result.dialysis ? "請由醫師訂定透析期間的治療目標" : result.certain ? `${level.name}・${result.atGoal === null ? "參考目標" : result.atGoal ? "本次 LDL 已達目標" : "本次 LDL 尚未達目標"}` : `已知條件至少為${level.name}`,
      message: result.reimbursement,
      visual: { tone: result.atGoal === true ? "positive" : result.atGoal === false ? "caution" : "neutral" },
      rows: [
        { label: "本次 LDL-C", value: result.ldl === null ? "未填寫" : `${result.ldl} mg/dL` },
        { label: "表一起始用藥血脂門檻", value: result.certain && !result.dialysis ? `LDL-C ≥${result.target} mg/dL` : "需先確認個人分類" },
        ...(result.knownLevelIndex >= 3 ? [{ label: "六項心血管風險因子", value: result.riskMin === result.riskMax ? `${result.riskMin} 項` : `${result.riskMin} 項已確認，另有 ${result.riskMax - result.riskMin} 項未知` }] : []),
        ...(!result.certain && !result.dialysis ? [{ label: "需確認的目標範圍", value: `可能為 <${ldlLevels[result.possibleHigherIndex].target} 至 <${level.target} mg/dL；以確認後分類為準` }] : []),
        ...(result.nonHdl !== null ? [{ label: "本次 non-HDL-C", value: `${Number(result.nonHdl.toFixed(2))} mg/dL` }] : []),
        ...(result.secondaryTarget !== null && !result.dialysis ? [{ label: "non-HDL-C 次要目標", value: `<${result.secondaryTarget} mg/dL${result.secondaryAtGoal === null ? "" : result.secondaryAtGoal ? "・已達" : "・尚未達"}` }] : []),
      ],
    };
  }
  return <div className="assessment-workspace"><form ref={form} autoComplete="off" noValidate onSubmit={submit}><fieldset className="ready-fieldset" disabled={!ready} aria-label="健保 LDL 目標輸入">
    {!ready && <p role="status">工具載入中，請稍候再填寫。</p>}
    <div className="assessment-fields">{activeFields.map(f => <FormField key={f.key} prefix={prefix} field={f} value={values[f.key] ?? ""} error={errors[f.key]} onChange={value => { setValues(old => ({ ...old, [f.key]: value, ...(f.key === "ascvd" ? { extremeCombination: "" } : {}) })); setErrors({}); setResult(null); }} />)}</div>
    <Link className="text-link" href="/tools/metabolic-syndrome/" target="_blank">不確定代謝症候群？開啟五項自評</Link>
    {Object.keys(errors).length > 0 && <p className="form-error" role="alert">請依欄位提示核對資料。</p>}
    <div className="calculator-actions"><button type="submit" className="button">查看 LDL 目標</button><button type="button" className="text-link" onClick={() => { setValues({}); setErrors({}); setResult(null); }}>清除所有輸入</button></div>
  </fieldset></form>
  <ResultPanel result={panel} />
  {result && <section className="ldl-reasons"><h3>這次分類的依據</h3><ul>{result.reasons.map(r => <li key={r}>{r}</li>)}</ul><p className="field-hint">依健保表一比對；部分藥品適用表二，各藥品另有條件，並非給付核准。</p><details><summary>查看六項風險因子</summary><dl className="result-rows">{result.factors.map(f => <div key={f.label}><dt>{f.label}</dt><dd>{f.value === null ? "未知" : f.value ? "符合" : "未符合"}</dd></div>)}</dl></details></section>}
  </div>;
}
