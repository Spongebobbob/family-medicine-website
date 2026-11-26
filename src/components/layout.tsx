import Link from "next/link";
import { Icon } from "./icon";
import { site } from "@/lib/site";
export function Header() {
  return (
    <>
      <a href="#main" className="skip-link">
        跳至主要內容
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label={`${site.name}首頁`}>
            <span className="brand-mark">
              <Icon name="leaf" />
            </span>
            <span>
              {site.name}
              <small>家庭醫學・健康生活</small>
            </span>
          </Link>
          <nav aria-label="主要導覽">
            <Link href="/about/">醫師介紹</Link>
            <Link href="/articles/">衛教百科</Link>
            <Link href="/categories/">健康分類</Link>
            <Link href="/tools/">健康工具</Link>
          </nav>
          <Link href="/search/" className="search-link">
            <Icon name="search" />
            <span>搜尋</span>
          </Link>
        </div>
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-links">
          <Link href="/about/">關於本站</Link>
          <Link href="/policy/">醫療免責聲明與編輯政策</Link>
          <Link href="/references/">參考文獻</Link>
          <Link href="/search/">搜尋文章</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>日常・家醫　｜　健康知識，溫暖陪伴</span>
      </div>
    </footer>
  );
}
export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="麵包屑" className="breadcrumbs">
      <ol>
        <li>
          <Link href="/">首頁</Link>
        </li>
        {items.map((item, i) => (
          <li key={i}>
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="page-intro">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {children && <div className="intro-text">{children}</div>}
    </div>
  );
}
