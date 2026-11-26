"use client";
import { useId, useRef, useState } from "react";
import {
  calculateFib4,
  calculateEgfr,
  scoreIsi,
  scoreGad7,
  scorePhq9,
  scoreStopBang,
  phq9NeedsSafety,
  type EquationSex,
  type CreatinineUnit,
} from "@/lib/assessments";
import Link from "next/link";
import { questionnaires, type QuestionnaireKind } from "@/lib/questionnaires";
import { fib4Visual, egfrVisual, questionnaireVisual, type ResultVisual, type ResultTone } from "@/lib/result-visuals";
import { ResultScale } from "./result-scale";
import { SafetyNotice } from "./safety-notice";
import { useClientReady } from "./use-client-ready";
type Choice = { value: string; label: string };
export type Field = {
  key: string;
  label: string;
  unit?: string;
  min?: number;
  max?: number;
  integer?: boolean;
  choices?: Choice[];
  hint?: string;
  optional?: boolean;
};
const labFields: Record<"fib-4" | "egfr", Field[]> = {
  "fib-4": [
    { key: "age", label: "年齡", unit: "歲", min: 18, max: 120, integer: true },
    { key: "ast", label: "AST（GOT）", unit: "U/L", min: 1, max: 10000 },
    { key: "alt", label: "ALT（GPT）", unit: "U/L", min: 1, max: 10000 },
    {
      key: "platelets",
      label: "血小板",
      unit: "10⁹/L",
      min: 1,
      max: 2000,
      hint: "例如報告為 20 萬/µL，請輸入 200；10³/µL 與 10⁹/L 的數字相同。",
    },
  ],
  egfr: [
    { key: "age", label: "年齡", unit: "歲", min: 18, max: 120, integer: true },
    {
      key: "sex",
      label: "公式使用的生理性別",
      choices: [
        { value: "female", label: "女性參數" },
        { value: "male", label: "男性參數" },
      ],
      hint: "依原始公式的性別參數；不適用此分類者請諮詢醫師。",
    },
    {
      key: "unit",
      label: "肌酸酐單位",
      choices: [
        { value: "mg/dL", label: "mg/dL" },
        { value: "µmol/L", label: "µmol/L" },
      ],
    },
    {
      key: "creatinine",
      label: "血清肌酸酐",
      hint: "請依報告選擇單位；可輸入 0.1–30 mg/dL 或 8.84–2652 µmol/L。",
    },
  ],
};
export type AssessmentResult = { value: string; unit?: string; label: string; message: string; visual?: ResultVisual; rows?: { label: string; value: string; tone?: ResultTone }[] };
export function ResultPanel({ result }: { result: AssessmentResult | null }) {
  return (
    <section
      className="assessment-result"
      data-tone={result?.visual?.tone ?? "neutral"}
      aria-live="polite"
      aria-atomic="true"
    >
      <h3>評估結果</h3>
      {result ? (
        <>
          <strong className="assessment-value"><span>{result.value}</span>{result.unit && <span className="assessment-unit">{result.unit}</span>}</strong>
          {result.visual?.scale && <ResultScale scale={result.visual.scale} />}
          <h4>{result.label}</h4>
          <p>{result.message}</p>
          {result.rows && <dl className="result-rows">{result.rows.map(row => <div key={row.label} data-tone={row.tone}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>}
        </>
      ) : (
        <p>完成欄位並按下計算後，結果會顯示在這裡。</p>
      )}
    </section>
  );
}
export function FormField({
  field,
  value,
  onChange,
  prefix,
  error,
}: {
  field: Field;
  value: string;
  onChange: (v: string) => void;
  prefix: string;
  error?: string;
}) {
  const id = `${prefix}-${field.key}`;
  const described =
    [field.hint ? `${id}-hint` : "", error ? `${id}-error` : ""]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div className="assessment-field">
      <label htmlFor={id}>
        {field.label}
        {field.unit && <span>（{field.unit}）</span>}
      </label>
      {field.choices ? (
        <select
          id={id}
          value={value}
          required={!field.optional}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={described}
        >
          <option value="">請選擇</option>
          {field.choices.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type="number"
          autoComplete="off"
          inputMode={field.integer ? "numeric" : "decimal"}
          min={field.min}
          max={field.max}
          step={field.integer ? "1" : "any"}
          required={!field.optional}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={described}
        />
      )}{" "}
      {field.hint && (
        <p id={`${id}-hint`} className="field-hint">
          {field.hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
export function LabAssessment({ kind }: { kind: "fib-4" | "egfr" }) {
  const ready = useClientReady();
  const prefix = useId();
  const form = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [stable, setStable] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const update = (key: string, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setResult(null);
    setErrors({});
  };
  return (
    <div className="assessment-workspace">
      <form
        ref={form}
        autoComplete="off"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const nextErrors: Record<string, string> = {};
          for (const f of labFields[kind]) {
            const raw = values[f.key] ?? "";
            const n = Number(raw);
            if (!raw.trim()) nextErrors[f.key] = "請填寫此欄位。";
            else if (f.choices && !f.choices.some((c) => c.value === raw))
              nextErrors[f.key] = "請選擇有效選項。";
            else if (
              !f.choices &&
              (!Number.isFinite(n) ||
                (f.integer && !Number.isInteger(n)) ||
                (f.min !== undefined && n < f.min) ||
                (f.max !== undefined && n > f.max))
            )
              nextErrors[f.key] =
                `請輸入${f.integer ? "整數" : "數值"}${f.min !== undefined ? `，範圍 ${f.min}–${f.max}` : ""}。`;
          }
          if (!stable)
            nextErrors.stable =
              "請先確認適用條件；不符合或不確定時請由醫師評估。";
          if (kind === "egfr" && !nextErrors.creatinine && !nextErrors.unit) {
            const scr =
              Number(values.creatinine) / (values.unit === "µmol/L" ? 88.4 : 1);
            if (scr < 0.1 || scr > 30)
              nextErrors.creatinine = "超出輸入範圍，請確認數值與單位。";
          }
          setErrors(nextErrors);
          setResult(null);
          if (Object.keys(nextErrors).length) {
            requestAnimationFrame(() =>
              form.current
                ?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')
                ?.focus(),
            );
            return;
          }
          if (kind === "fib-4") {
            const r = calculateFib4({
              age: Number(values.age),
              ast: Number(values.ast),
              alt: Number(values.alt),
              platelets: Number(values.platelets),
              stable,
            });
            if (r)
              setResult({
                value: r.value.toFixed(2),
                visual: fib4Visual(r.value, Number(values.age)),
                label: r.label,
                message:
                  r.level === "unreliable"
                    ? "此年齡層準確度不足，不套用成人切點；請和醫師討論其他評估方式。"
                    : `本次採較低切點 ${r.lowerCutoff}，較高切點 >2.67；不是肝纖維化診斷。${r.level === "lower" ? "較低值仍無法完全排除疾病。" : "請和醫師討論進一步檢查。"}`,
              });
          } else {
            const r = calculateEgfr({
              age: Number(values.age),
              creatinine: Number(values.creatinine),
              sex: values.sex as EquationSex,
              unit: values.unit as CreatinineUnit,
              stable,
            });
            if (r)
              setResult({
                value: r.value.toFixed(1),
                unit: "mL/min/1.73 m²",
                visual: egfrVisual(r.value),
                label: `估算腎功能分類 ${r.category}`,
                message: `這是一次檢驗的 G 分類，不是 CKD 診斷。${r.value >= 60 ? "G1、G2 沒有其他腎損傷證據時，不能稱為 CKD。" : "請讓醫師確認是否有急性變化、尿白蛋白及至少三個月的持續異常。"}${r.value < 30 ? "結果明顯降低，請儘速由醫師評估；有急性症狀時立即就醫。" : ""}`,
              });
          }
        }}
      >
        <fieldset
          className="ready-fieldset"
          disabled={!ready}
          aria-label="評估輸入"
        >
          {!ready && <p role="status">工具載入中，請稍候再填寫。</p>}
          <div className="assessment-fields">
            {labFields[kind].map((f) => (
              <FormField
                key={f.key}
                field={f}
                prefix={prefix}
                value={values[f.key] ?? ""}
                onChange={(v) => update(f.key, v)}
                error={errors[f.key]}
              />
            ))}
          </div>
          <div className="eligibility-check">
            <input
              id={`${prefix}-stable`}
              type="checkbox"
              checked={stable}
              onChange={(e) => {
                setStable(e.target.checked);
                setErrors({});
                setResult(null);
              }}
              aria-invalid={Boolean(errors.stable)}
              aria-describedby={`${prefix}-eligibility-error`}
            />
            <label htmlFor={`${prefix}-stable`}>
              {kind === "egfr"
                ? "我已確認：為非孕成人、肌酸酐穩定，沒有急性腎損傷、透析或其他不適用情境。"
                : "我已確認：目前非急性疾病或急性肝損傷情境，且沒有已知會干擾判讀的血小板異常。"}
            </label>
          </div>
          <p className="field-error" id={`${prefix}-eligibility-error`}>
            {errors.stable}
          </p>
          {Object.keys(errors).length > 0 && (
            <p role="alert" className="form-error">
              有欄位尚未完成或不適用，請依提示修正。
            </p>
          )}
          <div className="calculator-actions">
            <button className="button" type="submit">
              {kind === "egfr" ? "估算 eGFR" : "計算 FIB-4"}
            </button>
            <button
              className="text-link"
              type="button"
              onClick={() => {
                setValues({});
                setStable(false);
                setErrors({});
                setResult(null);
              }}
            >
              清除所有輸入
            </button>
          </div>
          <p className="field-hint">
            欄位範圍為避免輸入錯誤的工程界限，不是正常值範圍。
          </p>
        </fieldset>
      </form>
      <ResultPanel result={result} />
    </div>
  );
}
export function ScaleQuestionnaire({ kind }: { kind: QuestionnaireKind }) {
  const ready = useClientReady();
  const questionnaire = questionnaires[kind];
  const count = questionnaire.questions.length;
  const prefix = useId();
  const form = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<string[]>(Array(count).fill(""));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const safety =
    kind === "phq-9" && values[8] !== "" && phq9NeedsSafety(Number(values[8]));
  return (
    <>
      {safety && <SafetyNotice />}
      <div className="assessment-workspace">
        <form
          ref={form}
          autoComplete="off"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
            setResult(null);
            if (values.some((v) => v === "")) {
              requestAnimationFrame(() =>
                form.current
                  ?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')
                  ?.focus(),
              );
              return;
            }
            const items = values.map(Number);
            const r =
              kind === "isi"
                ? scoreIsi(items)
                : kind === "gad-7"
                  ? scoreGad7(items)
                  : kind === "phq-9"
                    ? scorePhq9(items)
                    : scoreStopBang(items);
            if (r)
              setResult({
                value: String(r.score),
                unit: "分",
                visual: questionnaireVisual(kind, items),
                label: kind === "phq-9" && safety ? "請先照顧此刻的安全" : r.label,
                message:
                  kind === "phq-9" && safety
                    ? "總分不能抵銷第九題的安全訊號。請先閱讀安全提醒並尋求支持。"
                    : kind === "stop-bang"
                      ? "分級同時考慮症狀、體位及性別的組合。有打呼、呼吸暫停或白天嗜睡，建議安排睡眠門診。"
                      : "症狀持續或影響日常生活時，建議與家庭醫師或身心科醫師討論。",
              });
          }}
        >
          <fieldset
            className="ready-fieldset"
            disabled={!ready}
            aria-label="量表計分輸入"
          >
            {!ready && <p role="status">工具載入中，請稍候再填寫。</p>}
            <fieldset className="score-fieldset">
              <legend className="sr-only">健康自我評估問卷</legend>
              <p>{questionnaire.intro}</p>
              <p className="score-progress" role="status" aria-live="polite">已完成 {values.filter(v => v !== "").length} / {count} 題</p>
              <div className="question-list">
                {questionnaire.questions.map((question, i) => (
                  <fieldset className="question-card" key={i} aria-describedby={submitted && values[i] === "" ? prefix + "-error-" + i : undefined}>
                    <legend>{i + 1}. {question.text}</legend>
                    {question.hint && <p className="field-hint">{question.hint}</p>}
                    {kind === "stop-bang" && i === 4 && <Link href="/tools/bmi/" target="_blank" className="text-link">開啟 BMI 計算器 ↗</Link>}
                    <div className="answer-options">
                      {question.choices.map((label, n) => (
                        <label className="answer-option" key={n}>
                          <input type="radio" name={prefix + "-question-" + i} value={n} checked={values[i] === String(n)} data-invalid={submitted && values[i] === ""} onChange={() => {
                            setValues(previous => previous.map((old, index) => index === i ? String(n) : old));
                            setSubmitted(false);
                            setResult(null);
                          }} />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                    {submitted && values[i] === "" && <p className="field-error" id={prefix + "-error-" + i}>請選擇一個答案。</p>}
                  </fieldset>
                ))}
              </div>
            </fieldset>
            {submitted && (values.some((v) => v === "")) && (
              <p className="form-error" role="alert">
                請回答所有問題，再查看結果。
              </p>
            )}
            <div className="calculator-actions">
              <button type="submit" className="button">
                查看評估結果
              </button>
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setValues(Array(count).fill(""));
                  setSubmitted(false);
                  setResult(null);
                }}
              >
                清除所有輸入
              </button>
            </div>
          </fieldset>
        </form>
        <ResultPanel result={result} />
      </div>
    </>
  );
}
