export type SearchArticle = {
  slug: string;
  title: string;
  description: string;
  categoryName: string;
  status: "pending-review" | "reviewed";
  keywords: string[];
  text: string;
  published: string;
  minutes: number;
};
export function searchArticles(articles: SearchArticle[], query: string) {
  const words = query
    .trim()
    .toLocaleLowerCase("zh-TW")
    .split(/\s+/)
    .filter(Boolean);
  return words.length
    ? articles.filter((a) =>
        words.every((w) =>
          `${a.title} ${a.description} ${a.categoryName} ${a.keywords.join(" ")} ${a.text}`
            .toLocaleLowerCase("zh-TW")
            .includes(w),
        ),
      )
    : articles;
}
