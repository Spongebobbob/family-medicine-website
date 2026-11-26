"use client";
import { useEffect } from "react";

// Native details work without JS. This island reveals legacy deep links and citations.
export function ArticleAnchorNavigation() {
  useEffect(() => {
    let frame = 0;
    const reveal = (hash: string, focus: boolean) => {
      let id: string;
      try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
      const target = document.getElementById(id);
      if (!target?.closest(".article-main")) return;
      let parent = target.parentElement, opened = false;
      while (parent) {
        if (parent instanceof HTMLDetailsElement && !parent.open) { parent.open = true; opened = true; }
        parent = parent.parentElement;
      }
      if (opened || focus) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          target.scrollIntoView({ block: "start", behavior: "instant" });
          if (focus) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
        });
      }
    };
    const onHash = () => reveal(location.hash, true);
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      if (link) reveal(link.hash, true);
    };
    reveal(location.hash, false);
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHash);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("click", onClick); window.removeEventListener("hashchange", onHash); };
  }, []);
  return null;
}
