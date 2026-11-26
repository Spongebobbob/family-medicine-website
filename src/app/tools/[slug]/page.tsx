import { notFound } from "next/navigation";
import { LdlTargetForm } from "@/components/tools/ldl-target-form";
import { BmiCalculator } from "@/components/bmi-calculator";
import {
  LabAssessment,
  ScaleQuestionnaire,
} from "@/components/tools/assessment-form";
import { MetabolicAssessment, type MetabolicToolKind } from "@/components/tools/metabolic-form";
import { PreventionAssessment } from "@/components/tools/prevention-form";
import type { PreventionKind } from "@/lib/prevention-assessments";
import { LicensedQuestionnaire } from "@/components/tools/licensed-questionnaire";
import { GeriatricQuestionnaire } from "@/components/tools/geriatric-questionnaire";
import { AgingSleepAssessment } from "@/components/tools/aging-sleep-form";
import { SleepDiary } from "@/components/tools/sleep-diary";
import { ToolShell } from "@/components/tools/tool-shell";
import { getHealthTool, healthTools } from "@/lib/tool-catalog";

import { pageMetadata } from "@/lib/seo";
export const dynamicParams = false;
export function generateStaticParams() {
  return healthTools.map((t) => ({ slug: t.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getHealthTool(slug);
  return tool
    ? pageMetadata(
        tool.name,
        `${tool.description} 衛教試用，待醫師審閱。`,
        `/tools/${slug}/`,
        true,
      )
    : {};
}
export default async function HealthToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getHealthTool(slug);
  if (!tool) notFound();
  return (
    <ToolShell tool={tool}>
      {tool.slug === "ldl-target" ? (
          <LdlTargetForm />
        ) : tool.slug === "bmi" ? (
          <BmiCalculator />
        ) : tool.slug === "fib-4" || tool.slug === "egfr" ? (
          <LabAssessment kind={tool.slug} />
        ) : ["cardiovascular-risk", "metabolic-syndrome", "tdee", "waist-height-ratio"].includes(tool.slug) ? (
          <MetabolicAssessment kind={tool.slug as MetabolicToolKind} />
        ) : tool.slug === "ess" || tool.slug === "mna-sf" ? (
          <LicensedQuestionnaire kind={tool.slug} />
        ) : tool.slug === "sarc-f" || tool.slug === "frail" ? (
          <GeriatricQuestionnaire kind={tool.slug} />
        ) : tool.slug === "sleep-diary" ? (
          <SleepDiary />
        ) : tool.slug === "sarcopenia" ? (
          <AgingSleepAssessment kind={tool.slug} />
        ) : tool.kind === "guide" ? (
          <PreventionAssessment kind={tool.slug as PreventionKind} />
        ) : (
          <ScaleQuestionnaire
            kind={tool.slug as "isi" | "stop-bang" | "phq-9" | "gad-7"}
          />
        )
      }
    </ToolShell>
  );
}
