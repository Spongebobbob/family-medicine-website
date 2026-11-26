"use client";
import { useState } from "react";
import { calculateBmi } from "@/lib/health";
import { ResultPanel } from "@/components/tools/assessment-form";
import { bmiVisual } from "@/lib/result-visuals";
import { useClientReady } from "@/components/tools/use-client-ready";
export function BmiCalculator() {
  const ready = useClientReady();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calculateBmi>>(null);
  const [error, setError] = useState("");
  const clearResult = () => {
    setResult(null);
    setError("");
  };
  return (
    <div className="calculator">
      <form
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          const next = calculateBmi(Number(height), Number(weight));
          setResult(next);
          setError(
            next ? "" : "請輸入有效身高（100–250 公分）及體重（20–400 公斤）。",
          );
        }}
        noValidate
      >
        <fieldset
          className="ready-fieldset"
          disabled={!ready}
          aria-label="BMI 輸入"
        >
          {!ready && <p role="status">工具載入中，請稍候再填寫。</p>}
          <div className="calculator-fields">
            <label htmlFor="height">
              身高 <span>公分 cm</span>
              <input
                id="height"
                type="number"
                inputMode="decimal"
                min="100"
                max="250"
                step="any"
                placeholder="例如 165"
                value={height}
                onChange={(e) => {
                  setHeight(e.target.value);
                  clearResult();
                }}
                required
                aria-describedby={error ? "bmi-error" : undefined}
                aria-invalid={Boolean(error)}
              />
            </label>
            <label htmlFor="weight">
              體重 <span>公斤 kg</span>
              <input
                id="weight"
                type="number"
                inputMode="decimal"
                min="20"
                max="400"
                step="any"
                placeholder="例如 60"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  clearResult();
                }}
                required
                aria-describedby={error ? "bmi-error" : undefined}
                aria-invalid={Boolean(error)}
              />
            </label>
          </div>
          {error && (
            <p id="bmi-error" role="alert" className="form-error">
              {error}
            </p>
          )}
          <div className="calculator-actions">
            <button className="button" type="submit">
              計算我的 BMI
            </button>
            <button
              className="text-link"
              type="button"
              onClick={() => {
                setHeight("");
                setWeight("");
                clearResult();
              }}
            >
              重新填寫
            </button>
          </div>
        </fieldset>
      </form>
      <ResultPanel result={result ? {
        value: result.value.toFixed(2),
        label: result.category,
        visual: bmiVisual(result.value),
        message: "分類依未四捨五入的數值判定；BMI 是體位指標，請搭配肌肉量與健康狀況解讀。",
      } : null} />
    </div>
  );
}
