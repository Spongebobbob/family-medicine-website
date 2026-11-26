import Link from "next/link";
import { categoryBySlug, type Category } from "@/lib/site";
import type { Article } from "@/lib/content";
import { Icon } from "./icon";
export function CategoryCard({
  category,
  count,
}: {
  category: Category;
  count?: number;
}) {
  return (
    <Link href={`/categories/${category.slug}/`} className="category-card">
      <span className="category-icon">
        <Icon name={category.icon} />
      </span>
      <div>
        <h3>{category.name}</h3>
        <p>{count === undefined ? category.description : `${count} 篇文章`}</p>
      </div>
      <span className="category-plus">
        <Icon name="plus" />
      </span>
    </Link>
  );
}
export function ArticleCard({ article }: { article: Article }) {
  const category = categoryBySlug(article.category)!;
  return (
    <article className="article-card">
      <Link
        href={`/articles/${article.slug}/`}
        className={`card-art art-${category.icon}`}
        aria-label={`閱讀：${article.title}`}
      >
        <span className="art-circle" />
        <Icon name={category.icon} />
        <span className="art-caption">日常裡的健康筆記</span>
      </Link>
      <div className="card-body">
        <div className="card-labels">
          <span className="category-label">{category.name}</span>
        </div>
        <h3>
          <Link href={`/articles/${article.slug}/`}>{article.title}</Link>
        </h3>
        <p>{article.description}</p>
        <div className="card-meta">
          <time dateTime={article.published}>
            {article.published.replaceAll("-", ".")}
          </time>
          <span>
            <Icon name="clock" />
            {article.minutes} 分鐘閱讀
          </span>
        </div>
      </div>
    </article>
  );
}
