"use client";
import { useId, useRef, useState } from "react";
import type { EquationSex } from "@/lib/assessments";
import { calculateCardiovascularRisk, calculateTdee, calculateWaistHeight, evaluateMetabolicSyndrome, type KnownBoolean } from "@/lib/metabolic-assessments";
import { FormField, ResultPanel, type Field, type AssessmentResult } from "./assessment-form";
import { waistHeightVisual } from "@/lib/result-visuals";
import { useClientReady } from "./use-client-ready";

export type MetabolicToolKind = "cardiovascular-risk" | "metabolic-syndrome" | "tdee" | "waist-height-ratio";
const sex: Field = { key: "sex", label: "生理性別（公式參數）", choices: [{ value: "male", label: "男性" }, { value: "female", label: "女性" }] };
const yesNo = [{ value: "no", label: "否" }, { value: "yes", label: "是" }];
const medication = [...yesNo, { value: "unknown", label: "不清楚" }];
const height: Field = { key: "height", label: "身高", unit: "公分", min: 100, max: 250 };
const weight: Field = { key: "weight", label: "體重", unit: "公斤", min: 20, max: 350 };
const fields: Record<MetabolicToolKind, Field[]> = {
  "cardiovascular-risk": [
    { key: "age", label: "年齡", unit: "歲", min: 30, max: 74, integer: true }, sex,
    { key: "existing", label: "曾被診斷心血管疾病嗎？", choices: yesNo, hint: "如心肌梗塞、心絞痛、腦中風、心衰竭或周邊動脈疾病。" },
    { key: "total", label: "總膽固醇", unit: "mg/dL", min: 100, max: 405 },
    { key: "hdl", label: "好的膽固醇（HDL）", unit: "mg/dL", min: 10, max: 100 },
    { key: "systolic", label: "收縮壓（血壓較高的數字）", unit: "mmHg", min: 90, max: 200 },
    { key: "treated", label: "目前因高血壓使用降血壓藥嗎？", choices: yesNo },
    { key: "smoker", label: "目前有吸菸嗎？", choices: yesNo },
    { key: "diabetes", label: "醫師曾診斷你有糖尿病嗎？", choices: yesNo },
  ],
  "metabolic-syndrome": [
    { key: "age", label: "年齡", unit: "歲", min: 20, max: 120, integer: true }, sex,
    { key: "waist", label: "腰圍", unit: "公分", min: 30, max: 250, optional: true },
    { key: "systolic", label: "收縮壓（血壓較高的數字）", unit: "mmHg", min: 50, max: 300, optional: true },
    { key: "diastolic", label: "舒張壓（血壓較低的數字）", unit: "mmHg", min: 30, max: 200, optional: true },
    { key: "glucose", label: "空腹血糖", unit: "mg/dL", min: 20, max: 1000, optional: true, hint: "使用至少空腹 8 小時的檢驗值。" },
    { key: "triglycerides", label: "空腹三酸甘油酯（TG）", unit: "mg/dL", min: 10, max: 5000, optional: true },
    { key: "hdl", label: "好的膽固醇（HDL）", unit: "mg/dL", min: 5, max: 200, optional: true },
    { key: "bpMedication", label: "正在因高血壓使用處方藥嗎？", choices: medication },
    { key: "glucoseMedication", label: "正在因高血糖使用處方藥嗎？", choices: medication },
    { key: "triglycerideMedication", label: "正在因三酸甘油酯偏高使用處方藥嗎？", choices: medication, hint: "不是所有降膽固醇藥都算；不確定可選「不清楚」。" },
  ],
  tdee: [
    { key: "age", label: "年齡", unit: "歲", min: 19, max: 78, integer: true }, sex, height, weight,
    { key: "activity", label: "平常的活動程度", choices: [
      { value: "1.2", label: "久坐，幾乎不運動" },
      { value: "1.375", label: "輕度活動，每週運動 1–2 次" },
      { value: "1.55", label: "中度活動，每週運動 3–5 次" },
      { value: "1.725", label: "高度活動，每週運動 6–7 次" },
      { value: "1.9", label: "非常活躍，每天高強度運動或重體力工作" },
    ] },
  ],
  "waist-height-ratio": [height,
    { key: "waist", label: "腰圍", unit: "公分", min: 30, max: 250, hint: "皮尺水平繞過肋骨下緣與骨盆上緣的中間，正常吐氣後讀值，不勒緊。" },
    { ...weight, label: "體重（選填）", optional: true, hint: "填寫後可確認 BMI 是否適合套用分類。" },
  ],
};
const actions: Record<MetabolicToolKind, string> = { "cardiovascular-risk": "估算十年風險", "metabolic-syndrome": "查看五項指標", tdee: "計算每日熱量", "waist-height-ratio": "計算腰圍身高比" };

export function MetabolicAssessment({ kind }: { kind: MetabolicToolKind }) {
  const ready = useClientReady();
  const prefix = useId();
  const form = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const number = (key: string) => Number(values[key]);
  const optionalNumber = (key: string) => values[key]?.trim() ? number(key) : null;
  const bool = (key: string) => values[key] === "yes";
  const known = (key: string): KnownBoolean => values[key] === "unknown" ? null : bool(key);
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (kind === "cardiovascular-risk" && bool("existing")) {
      setErrors({});
      setResult({ value: "不適用", label: "已有心血管疾病，請由醫師個別評估", message: "此公式適用於尚未罹患心血管疾病的人，不適合估算再次發病的風險。" });
      return;
    }
    const issues: Record<string, string> = {};
    for (const field of fields[kind]) {
      const raw = values[field.key]?.trim() ?? "";
      const n = Number(raw);
      if (!raw) { if (!field.optional) issues[field.key] = "請填寫或選擇此欄位。"; continue; }
      if (field.choices) {
        if (!field.choices.some(c => c.value === raw)) issues[field.key] = "請選擇有效選項。";
      } else if (!Number.isFinite(n) || (field.integer && !Number.isInteger(n)) || (field.min !== undefined && n < field.min) || (field.max !== undefined && n > field.max)) {
        issues[field.key] = `請輸入${field.min}–${field.max}之間的${field.integer ? "整數" : "數字"}。`;
      }
    }
    if (kind === "cardiovascular-risk" && values.hdl && values.total && number("hdl") >= number("total")) issues.hdl = "HDL 應小於總膽固醇，請核對報告。";
    if (kind === "metabolic-syndrome" && values.systolic && values.diastolic && number("systolic") <= number("diastolic")) issues.diastolic = "舒張壓應低於收縮壓，請核對數字。";
    setErrors(issues);
    setResult(null);
    if (Object.keys(issues).length) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    const sexValue = values.sex as EquationSex;
    if (kind === "cardiovascular-risk") {
      if (bool("existing")) {
        setResult({ value: "不適用", label: "已有心血管疾病，請由醫師個別評估", message: "此公式適用於尚未罹患心血管疾病的人，不適合估算再次發病的風險。" });
        return;
      }
      const r = calculateCardiovascularRisk({ age: number("age"), sex: sexValue, totalCholesterol: number("total"), hdl: number("hdl"), systolic: number("systolic"), treated: bool("treated"), smoker: bool("smoker"), diabetes: bool("diabetes"), existingCvd: false });
      if (r) setResult({ value: r.percent < 0.1 ? "<0.1%" : `${r.percent.toFixed(1)}%`, label: "十年一般心血管疾病風險", message: "Framingham 2008 美國模型，包含心臟病、腦中風及心衰竭等事件；台灣個人風險需綜合判讀。" });
    } else if (kind === "metabolic-syndrome") {
      const r = evaluateMetabolicSyndrome({ age: number("age"), sex: sexValue, waist: optionalNumber("waist"), systolic: optionalNumber("systolic"), diastolic: optionalNumber("diastolic"), glucose: optionalNumber("glucose"), triglycerides: optionalNumber("triglycerides"), hdl: optionalNumber("hdl"), bpMedication: known("bpMedication"), glucoseMedication: known("glucoseMedication"), triglycerideMedication: known("triglycerideMedication") });
      if (r) setResult({ value: `${r.count} / 5`, unit: "項符合", visual: { tone: r.status === "meets" ? "caution" : r.unknown ? "neutral" : r.count === 0 ? "positive" : "caution" }, label: r.status === "meets" ? "達到代謝症候群篩檢條件" : r.status === "uncertain" ? "資料不足，尚無法判定" : "目前未達三項篩檢條件", message: `${r.unknown ? `另有 ${r.unknown} 項資料不足。` : ""}${r.status === "meets" ? "請帶檢驗報告與用藥資料，和醫師確認及安排追蹤。" : "即使未達三項，已符合的指標仍值得追蹤。"}`, rows: r.criteria.map(c => ({ label: c.label, value: c.met === null ? "資料不足" : c.met ? "符合" : "未符合", tone: c.met === null ? "neutral" : c.met ? "caution" : "positive" })) });
    } else if (kind === "tdee") {
      const r = calculateTdee({ age: number("age"), sex: sexValue, height: number("height"), weight: number("weight"), activity: number("activity") });
      if (r) setResult({ value: String(Math.round(r.total / 10) * 10), unit: "大卡／天", label: "維持目前體重的每日熱量估算", message: "實際需求會隨活動、肌肉量與身體狀況改變，這不是減重處方。", rows: [{ label: "靜息熱量（REE）", value: `${Math.round(r.resting)} 大卡／天` }, { label: "活動係數", value: String(r.activity) }] });
      else setErrors({ age: "此組資料無法合理估算，請核對年齡、身高及體重。" });
    } else {
      const r = calculateWaistHeight({ height: number("height"), waist: number("waist"), weight: optionalNumber("weight") });
      if (r) {
        const labels = { "below-reference": "低於 0.4，先核對量測方式", lower: "腰圍小於身高的一半", increased: "腰圍達身高的一半", higher: "腰圍達身高的六成以上" };
        const clinical = { "below-reference": "低於指引列出的參考區間", lower: "腹部脂肪未增加的參考區間", increased: "腹部脂肪增加區間", higher: "腹部脂肪較高區間" };
        setResult({ value: r.ratio.toFixed(3), visual: waistHeightVisual(r.band, r.classificationApplicable), label: r.classificationApplicable ? clinical[r.band] : labels[r.band], message: r.bmi !== null && r.bmi >= 35 ? "BMI 達 35，這裡僅顯示比值，不套用 NICE 的風險分層。" : `腰圍小於身高一半的參考值：小於 ${r.halfHeight.toFixed(1)} 公分。${r.bmi === null ? "成人且 BMI 小於 35 時，才適合參照指引分層。" : ""}`, rows: r.bmi === null ? undefined : [{ label: "BMI", value: r.bmi.toFixed(2) }] });
      }
    }
  }
  return <div className="assessment-workspace">
    <form ref={form} autoComplete="off" noValidate onSubmit={submit}>
      <fieldset className="ready-fieldset" disabled={!ready} aria-label="評估輸入">
        {!ready && <p role="status">工具載入中，請稍候再填寫。</p>}
        {kind === "metabolic-syndrome" && <p className="field-hint">沒有檢驗值可留白，系統會標示資料不足。</p>}
        <div className="assessment-fields">
          {fields[kind].map(field => <FormField key={field.key} field={field} prefix={prefix} value={values[field.key] ?? ""} error={errors[field.key]} onChange={value => { setValues(old => ({ ...old, [field.key]: value })); setErrors({}); setResult(null); }} />)}
        </div>
        {Object.keys(errors).length > 0 && <p role="alert" className="form-error">請依欄位提示核對資料。</p>}
        <div className="calculator-actions">
          <button type="submit" className="button">{actions[kind]}</button>
          <button type="button" className="text-link" onClick={() => { setValues({}); setErrors({}); setResult(null); }}>清除所有輸入</button>
        </div>
      </fieldset>
    </form>
    <ResultPanel result={result} />
  </div>;
}
