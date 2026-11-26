/** 純計算函式；所有臨床解讀待醫師審閱。不要在此加入記錄或網路傳輸。 */
function inRange(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max;
}
export function classifyFib4(value: number, age: number) {
  if (
    !inRange(value, 0, Number.MAX_VALUE) ||
    !Number.isInteger(age) ||
    !inRange(age, 18, 120)
  )
    return null;
  if (age < 35)
    return {
      level: "unreliable" as const,
      label: "未滿 35 歲，不進行風險分層",
      lowerCutoff: null,
    };
  // 採 AASLD 2023 的 >65 歲定義；65 歲整仍使用 1.3。
  const lowerCutoff = age > 65 ? 2 : 1.3;
  return {
    level:
      value < lowerCutoff
        ? ("lower" as const)
        : value > 2.67
          ? ("higher" as const)
          : ("indeterminate" as const),
    label:
      value < lowerCutoff
        ? "較低風險區間"
        : value > 2.67
          ? "較高風險區間"
          : "需要進一步評估的區間",
    lowerCutoff,
  };
}
export function calculateFib4(input: {
  age: number;
  ast: number;
  alt: number;
  platelets: number;
  stable: boolean;
}) {
  const { age, ast, alt, platelets, stable } = input;
  if (
    stable !== true ||
    !Number.isInteger(age) ||
    !inRange(age, 18, 120) ||
    !inRange(ast, 1, 10000) ||
    !inRange(alt, 1, 10000) ||
    !inRange(platelets, 1, 2000)
  )
    return null;
  const value = (age * ast) / (platelets * Math.sqrt(alt));
  return { value, ...classifyFib4(value, age)! };
}
export type CreatinineUnit = "mg/dL" | "µmol/L";
export type EquationSex = "female" | "male";
export function gfrCategory(value: number) {
  if (!inRange(value, 0, Number.MAX_VALUE)) return null;
  return value >= 90
    ? "G1"
    : value >= 60
      ? "G2"
      : value >= 45
        ? "G3a"
        : value >= 30
          ? "G3b"
          : value >= 15
            ? "G4"
            : "G5";
}
export function calculateEgfr(input: {
  age: number;
  creatinine: number;
  sex: EquationSex;
  unit: CreatinineUnit;
  stable: boolean;
}) {
  const { age, creatinine, sex, unit, stable } = input;
  if (
    stable !== true ||
    !Number.isInteger(age) ||
    !inRange(age, 18, 120) ||
    !["female", "male"].includes(sex) ||
    !["mg/dL", "µmol/L"].includes(unit)
  )
    return null;
  const scr = unit === "µmol/L" ? creatinine / 88.4 : creatinine;
  // 工程合理性界限，並非臨床正常值。
  if (!inRange(scr, 0.1, 30)) return null;
  const k = sex === "female" ? 0.7 : 0.9;
  const alpha = sex === "female" ? -0.241 : -0.302;
  const ratio = scr / k;
  const value =
    142 *
    Math.min(ratio, 1) ** alpha *
    Math.max(ratio, 1) ** -1.2 *
    0.9938 ** age *
    (sex === "female" ? 1.012 : 1);
  return { value, category: gfrCategory(value)!, creatinineMgDl: scr };
}
function itemTotal(items: readonly number[], count: number, max: number) {
  if (
    items.length !== count ||
    !Array.from(items).every((n) => Number.isInteger(n) && inRange(n, 0, max))
  )
    return null;
  return items.reduce((sum, n) => sum + n, 0);
}
export function scoreIsi(items: readonly number[]) {
  const score = itemTotal(items, 7, 4);
  if (score === null) return null;
  return {
    score,
    label:
      score <= 7
        ? "無明顯失眠症狀區間"
        : score <= 14
          ? "閾下失眠症狀區間"
          : score <= 21
            ? "中度失眠症狀區間"
            : "重度失眠症狀區間",
  };
}
export function scoreGad7(items: readonly number[]) {
  const score = itemTotal(items, 7, 3);
  if (score === null) return null;
  return {
    score,
    label:
      score < 5
        ? "極輕微焦慮症狀區間"
        : score < 10
          ? "輕度焦慮症狀區間"
          : score < 15
            ? "中度焦慮症狀區間"
            : "重度焦慮症狀區間",
  };
}
export function phq9NeedsSafety(item9: number) {
  return Number.isInteger(item9) && item9 >= 1 && item9 <= 3;
}
export function scorePhq9(items: readonly number[]) {
  const score = itemTotal(items, 9, 3);
  if (score === null) return null;
  return {
    score,
    label:
      score < 5
        ? "極輕微憂鬱症狀區間"
        : score < 10
          ? "輕度憂鬱症狀區間"
          : score < 15
            ? "中度憂鬱症狀區間"
            : score < 20
              ? "中重度憂鬱症狀區間"
              : "重度憂鬱症狀區間",
    needsSafety: phq9NeedsSafety(items[8]),
  };
}
/** 接受合法題本的原始二元分數，不包含或替代任何授權題目。 */
export function scoreStopBang(items: readonly number[]) {
  const score = itemTotal(items, 8, 1);
  if (score === null) return null;
  const stop = items.slice(0, 4).reduce((sum, n) => sum + n, 0);
  const combinationHigh =
    stop >= 2 && (items[4] === 1 || items[6] === 1 || items[7] === 1);
  return {
    score,
    stop,
    combinationHigh,
    level:
      score >= 5 || combinationHigh
        ? "higher"
        : score >= 3
          ? "intermediate"
          : "lower",
    label:
      score >= 5 || combinationHigh
        ? "較高風險區間"
        : score >= 3
          ? "中間風險區間"
          : "較低風險區間",
  };
}
