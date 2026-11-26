export type FigureBase = {
  id: string;
  title: string;
  alt: string;
  sources: string[];
  note: string;
};
export type StatisticalFigure = FigureBase & {
  type: "bar";
  unit: string;
  population: string;
  series: { key: string; label: string }[];
  data: { label: string; values: Record<string, number> }[];
};
export type DiagramNode = {
  id: string; title: string; lines: string[];
  x: number; y: number; width: number; height: number;
};
export type ForestFigure = FigureBase & {
  type: "forest";
  measure: "HR" | "SMD";
  nullValue: number;
  population: string;
  axisLabel: string;
  rows: { label: string; estimate: number; lower: number; upper: number; n?: number }[];
};
export type DiagramEdge = {
  from: string; to: string; label?: string;
  fromSide?: "top" | "bottom" | "left" | "right";
  toSide?: "top" | "bottom" | "left" | "right";
  effect?: "inhibition";
  via?: { x: number; y: number }[];
  labelPosition?: { x: number; y: number };
};
export type DiagramFigure = FigureBase & {
  type: "mechanism" | "decision";
  width: number; height: number;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
};
export type ArticleFigure = StatisticalFigure | ForestFigure | DiagramFigure;

export function forestAxis(figure: ForestFigure) {
  const min = Math.min(figure.nullValue, ...figure.rows.map(row => row.lower));
  const max = Math.max(figure.nullValue, ...figure.rows.map(row => row.upper));
  const padding = Math.max((max - min) * .08, .01);
  const roughStep = (max - min + 2 * padding) / 5;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const step = [1, 2, 2.5, 5, 10].find(value => value >= roughStep / magnitude)! * magnitude;
  const lower = Math.floor((min - padding) / step) * step;
  const upper = Math.ceil((max + padding) / step) * step;
  const start = figure.measure === "HR" ? Math.max(0, lower) : lower;
  const ticks = Array.from({length: Math.round((upper - start) / step) + 1}, (_, index) => Number((start + index * step).toPrecision(12)));
  return { domain: [ticks[0], ticks.at(-1)!], ticks };
}

// Validate authored data at build time. No arbitrary SVG, executable MDX or external data fetches.
export function validateFigure(input: unknown, id: string, referenceIds: string[]): ArticleFigure {
  const fail = (detail: string): never => { throw new Error(`圖表 ${id}：${detail}`); };
  const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
  const text = (value: unknown): value is string => typeof value === "string" && !!value.trim();
  const positive = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value > 0;
  if (!object(input)) return fail("須為 JSON 物件");
  if (input.id !== id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) fail("ID 無效");
  for (const key of ["title", "alt", "note"]) if (!text(input[key])) fail(`${key} 不可空白`);
  if (!Array.isArray(input.sources) || !input.sources.length || input.sources.some(s => !text(s) || !referenceIds.includes(s))) fail("必須引用文章內已登錄的文獻");
  if (input.type === "bar") {
    if (!text(input.unit) || !text(input.population)) fail("須提供單位與母群體");
    if (!Array.isArray(input.series) || !input.series.length || !Array.isArray(input.data) || !input.data.length) return fail("缺少數列或資料");
    const keys: string[] = [];
    for (const series of input.series) {
      if (!object(series) || !text(series.key) || !text(series.label) || !/^[a-z][a-z0-9_]*$/.test(series.key) || keys.includes(series.key)) return fail("數列 ID 重複或無效");
      keys.push(series.key);
    }
    for (const row of input.data) {
      if (!object(row) || !text(row.label) || !object(row.values)) return fail("資料列無效");
      for (const key of keys) {
        const value = row.values[key];
        if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || (input.unit === "%" && value > 100)) fail("數據缺漏、非有限數或超出範圍");
      }
      if (Object.keys(row.values).some(key => !keys.includes(key))) fail("存在未定義的數列");
    }
  } else if (input.type === "forest") {
    if (!["HR", "SMD"].includes(String(input.measure)) || input.nullValue !== (input.measure === "HR" ? 1 : 0) || !text(input.population) || !text(input.axisLabel) || !Array.isArray(input.rows) || !input.rows.length) return fail("森林圖須指定指標、無效值、母群體與資料");
    for (const row of input.rows) {
      if (!object(row) || !text(row.label) || typeof row.estimate !== "number" || typeof row.lower !== "number" || typeof row.upper !== "number" || ![row.estimate, row.lower, row.upper].every(Number.isFinite) || row.lower > row.estimate || row.estimate > row.upper || (input.measure === "HR" && row.lower <= 0) || (row.n !== undefined && (typeof row.n !== "number" || !Number.isInteger(row.n) || row.n <= 0))) fail("森林圖估計值、95% CI 或樣本數無效");
    }
  } else if (input.type === "mechanism" || input.type === "decision") {
    if (!positive(input.width) || !positive(input.height) || !Array.isArray(input.nodes) || !input.nodes.length || !Array.isArray(input.edges)) return fail("圖面或節點缺漏");
    const ids: string[] = [];
    for (const node of input.nodes) {
      if (!object(node) || !text(node.id) || ids.includes(node.id) || !text(node.title) || !Array.isArray(node.lines) || node.lines.some(line => !text(line))) return fail("節點文字或 ID 無效");
      if (typeof node.x !== "number" || typeof node.y !== "number" || !Number.isFinite(node.x) || !Number.isFinite(node.y) || node.x < 0 || node.y < 0 || !positive(node.width) || !positive(node.height) || node.x + node.width > input.width || node.y + node.height > input.height) return fail("節點超出圖面");
      if (node.lines.length > 4 || node.height < 58 + node.lines.length * 24) fail("節點空間不足以顯示文字");
      ids.push(node.id);
    }
    const point = (value: unknown) => object(value) && typeof value.x === "number" && typeof value.y === "number" && Number.isFinite(value.x) && Number.isFinite(value.y) && value.x >= 0 && value.y >= 0 && value.x <= (input.width as number) && value.y <= (input.height as number);
    for (const edge of input.edges) {
      if (!object(edge) || !ids.includes(String(edge.from)) || !ids.includes(String(edge.to)) || edge.from === edge.to || (edge.label !== undefined && !text(edge.label))) return fail("連線指向無效節點");
      for (const key of ["fromSide", "toSide"]) if (edge[key] !== undefined && !["top", "bottom", "left", "right"].includes(String(edge[key]))) fail("連線接點無效");
      if (edge.effect !== undefined && edge.effect !== "inhibition") fail("不支援的連線效果");
      if (edge.via !== undefined && (!Array.isArray(edge.via) || edge.via.some(p => !point(p)))) fail("連線路徑超出圖面");
      if (edge.labelPosition !== undefined && !point(edge.labelPosition)) fail("連線文字超出圖面");
    }
  } else fail("不支援的圖表類型");
  return input as unknown as ArticleFigure;
}
