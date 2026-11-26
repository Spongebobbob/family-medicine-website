import Link from "next/link";
import { Icon } from "@/components/icon";
export default function NotFound() {
  return (
    <div className="container empty-state page-space">
      <Icon name="leaf" />
      <span className="eyebrow">找不到這個頁面</span>
      <h1>換一個起點，繼續照顧健康。</h1>
      <p>頁面可能已移動，或網址輸入有誤。</p>
      <Link className="button" href="/articles/">
        回到衛教百科
      </Link>
    </div>
  );
}
