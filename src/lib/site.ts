export const site = {
  name: "日常・家醫",
  description:
    "把健康知識，放回日常生活。從睡眠、慢性病到高齡照護，用容易理解的文字，陪你認識自己與家人的健康。",
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://fmdoc.vercel.app"
  ).replace(/\/$/, ""),
  physician: { name: "", biography: "", credentials: [] as string[] },
};
export const indexEnabled =
  process.env.INDEX_SITE === "true" &&
  !site.url.includes("example.org") &&
  Boolean(site.physician.name);
export const categories = [
  {
    slug: "sleep-mental-health",
    name: "睡眠與身心健康",
    icon: "moon",
    description: "從好好休息開始，照顧身體，也照顧心情。",
  },
  {
    slug: "chronic-disease",
    name: "三高與慢性疾病",
    icon: "heart",
    description: "認識血壓、血糖與血脂，走穩長期照護的每一步。",
  },
  {
    slug: "health-check",
    name: "健檢報告解讀",
    icon: "clipboard",
    description: "理解數字背後的意義，準備好下一次的醫病對話。",
  },
  {
    slug: "weight-management",
    name: "體重管理",
    icon: "scale",
    description: "把目光放在生活習慣，找到適合自己的健康步調。",
  },
  {
    slug: "musculoskeletal",
    name: "肌肉骨骼疼痛",
    icon: "activity",
    description: "理解身體的不舒服，認識活動與就醫的時機。",
  },
  {
    slug: "travel-medicine",
    name: "旅遊醫學",
    icon: "sun",
    description: "出發之前做好準備，讓旅途多一分安心。",
  },
  {
    slug: "prevention",
    name: "預防醫學",
    icon: "shield",
    description: "從疫苗到健康篩檢，提前為健康留一份心。",
  },
  {
    slug: "older-adults",
    name: "高齡健康",
    icon: "leaf",
    description: "關心營養、活動與生活功能，陪伴自在的熟齡生活。",
  },
  {
    slug: "medication",
    name: "用藥知識",
    icon: "pill",
    description: "了解藥物、整理用藥問題，和醫療團隊一起守護安全。",
  },
] as const;
export type Category = (typeof categories)[number];
export function categoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}
export function absolute(path: string) {
  return `${site.url}${path}`;
}
