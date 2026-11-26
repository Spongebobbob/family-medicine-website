"use client";
import { useSearchParams } from "next/navigation";
import { Search } from "./search";
import type { SearchArticle, SearchTool } from "@/lib/search";

export function SearchWithQuery({ articles, tools }: { articles: SearchArticle[]; tools: SearchTool[] }) {
  const query = useSearchParams().get("q") ?? "";
  return <Search key={query} initialQuery={query} articles={articles} tools={tools} />;
}
