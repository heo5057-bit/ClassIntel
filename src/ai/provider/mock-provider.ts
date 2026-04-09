import type { RankedTopic } from "@/src/analysis/scoring/professor-mode";

export type AiProviderOutput = {
  modelName: string;
  topics: RankedTopic[];
  note: string;
};

export async function runProfessorModeProvider(input: {
  rankedTopics: RankedTopic[];
}): Promise<AiProviderOutput> {
  return {
    modelName: "heuristic-professor-mode-v1",
    topics: input.rankedTopics,
    note:
      "MVP analysis uses deterministic ranking from uploaded course signals. Optional LLM refinement can be added in the ai/provider layer without changing downstream pages.",
  };
}
