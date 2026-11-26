export function calculateBmi(heightCm: number, weightKg: number) {
  if (
    !Number.isFinite(heightCm) ||
    !Number.isFinite(weightKg) ||
    heightCm < 100 ||
    heightCm > 250 ||
    weightKg < 20 ||
    weightKg > 400
  )
    return null;
  const value = weightKg / (heightCm / 100) ** 2;
  const category =
    value < 18.5
      ? "體重過輕"
      : value < 24
        ? "健康體位"
        : value < 27
          ? "體重過重"
          : "肥胖";
  return { value, category };
}
