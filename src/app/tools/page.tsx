import { Breadcrumbs, PageIntro } from "@/components/layout";
import { ToolDirectory } from "@/components/tools/tool-directory";
import { healthTools, toolGroups } from "@/lib/tool-catalog";

import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "健康自我評估中心",
  "依睡眠、心理、體重代謝與肝腎等主題探索健康工具。提供 BMI、FIB-4、eGFR 計算，以及 ISI、STOP-BANG、PHQ-9、GAD-7 中文問卷與結果解讀。",
  "/tools/",
  true,
);
export default function Tools() {
  return (
    <div className="container page-space">
      <Breadcrumbs items={[{ label: "健康自我評估" }]} />
      <PageIntro eyebrow="" title="健康自我評估中心">{null}</PageIntro>
      <ToolDirectory
        groups={toolGroups}
        tools={healthTools.map((t) => ({
          slug: t.slug,
          name: t.name,
          shortName: t.shortName,
          group: t.group,
          icon: t.icon,
          description: t.description,
          status: "衛教參考",
        }))}
      />
    </div>
  );
}
