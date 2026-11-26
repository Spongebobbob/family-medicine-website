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
export type DiagramFigure = FigureBase & {
  type: "mechanism" | "decision";
  width: number; height: number;
  nodes: DiagramNode[];
  edges: { from: string; to: string; label?: string }[];
};
export type ArticleFigure = StatisticalFigure | DiagramFigure;

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
  } else if (input.type === "mechanism" || input.type === "decision") {
    if (!positive(input.width) || !positive(input.height) || !Array.isArray(input.nodes) || !input.nodes.length || !Array.isArray(input.edges)) return fail("圖面或節點缺漏");
    const ids: string[] = [];
    for (const node of input.nodes) {
      if (!object(node) || !text(node.id) || ids.includes(node.id) || !text(node.title) || !Array.isArray(node.lines) || node.lines.some(line => !text(line))) return fail("節點文字或 ID 無效");
      if (typeof node.x !== "number" || typeof node.y !== "number" || !Number.isFinite(node.x) || !Number.isFinite(node.y) || node.x < 0 || node.y < 0 || !positive(node.width) || !positive(node.height) || node.x + node.width > input.width || node.y + node.height > input.height) return fail("節點超出圖面");
      if (node.lines.length > 4 || node.height < 58 + node.lines.length * 24) fail("節點空間不足以顯示文字");
      ids.push(node.id);
    }
    for (const edge of input.edges) if (!object(edge) || !ids.includes(String(edge.from)) || !ids.includes(String(edge.to)) || edge.from === edge.to || (edge.label !== undefined && !text(edge.label))) fail("連線指向無效節點");
  } else fail("不支援的圖表類型");
  return input as unknown as ArticleFigure;
}
