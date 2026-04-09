import type { RankedTopic } from "@/src/analysis/scoring/professor-mode";

export type StudyGuideSection = {
  topic: string;
  importance: "High" | "Medium";
  confidence: number;
  summary: string;
  keyPoints: string[];
  whyItMatters: string[];
};

export type QuizQuestion = {
  prompt: string;
  type: "multiple_choice" | "short_answer";
  choices?: string[];
  answer: string;
  explanation: string;
  topic: string;
};

export type Flashcard = {
  topic: string;
  front: string;
  back: string;
};

export type QuickReviewTopic = {
  topic: string;
  confidence: number;
  reasons: string[];
  howToReview: string;
};

export type GeneratedAssets = {
  studyGuide: StudyGuideSection[];
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
  quickReview: QuickReviewTopic[];
};

type MaterialForAssetGeneration = {
  fileName: string;
  mimeType: string;
  extractedText: string | null;
};

function ensureAtLeast<T>(items: T[], fallback: T[]): T[] {
  return items.length > 0 ? items : fallback;
}

function extractDefinitions(materials: MaterialForAssetGeneration[]): string[] {
  const definitions: string[] = [];

  for (const material of materials) {
    const text = material.extractedText || "";
    const matches = text.match(
      /\b([A-Za-z][A-Za-z0-9\s\-]{2,40})\s+(is defined as|refers to|means)\s+([^.]{8,140})/gi,
    );
    if (!matches) {
      continue;
    }

    for (const match of matches.slice(0, 3)) {
      definitions.push(match.trim());
    }
  }

  return Array.from(new Set(definitions)).slice(0, 8);
}

function extractFormulas(materials: MaterialForAssetGeneration[]): string[] {
  const formulas: string[] = [];

  for (const material of materials) {
    const text = material.extractedText || "";
    const matches = text.match(/[A-Za-z][A-Za-z0-9]*\s*=\s*[A-Za-z0-9()+\-/*^.\s]{2,80}/g);
    if (!matches) {
      continue;
    }

    for (const match of matches.slice(0, 4)) {
      formulas.push(match.trim());
    }
  }

  return Array.from(new Set(formulas)).slice(0, 8);
}

function detectSourceCoverage(materials: MaterialForAssetGeneration[]) {
  const names = materials.map((material) => material.fileName);
  const lecture = names.filter((name) => /lecture|slides|notes|week/i.test(name)).length;
  const exam = names.filter((name) => /exam|quiz|midterm|final|test/i.test(name)).length;
  const review = names.filter((name) => /review|study\s*guide|summary|cheat/i.test(name)).length;

  return { lecture, exam, review };
}

export function generateStudyAssetsFromTopics(input: {
  rankedTopics: RankedTopic[];
  materials: MaterialForAssetGeneration[];
  plan: "free" | "premium";
}): GeneratedAssets {
  const { materials } = input;
  const topics = input.rankedTopics.slice(
    0,
    input.plan === "premium" ? 14 : 6,
  );
  const sourceCoverage = detectSourceCoverage(materials);
  const definitions = extractDefinitions(materials);
  const formulas = extractFormulas(materials);
  const sourceFiles = materials.slice(0, 4).map((material) => material.fileName);

  const studyGuide: StudyGuideSection[] = ensureAtLeast<StudyGuideSection>(
    topics
      .slice(0, input.plan === "premium" ? 12 : 6)
      .map((topic, index) => ({
      topic: topic.title,
      importance: (index < 4 ? "High" : "Medium") as "High" | "Medium",
      confidence: topic.confidence,
      summary: `${topic.summary} Sources include ${sourceCoverage.lecture} lecture-style file(s), ${sourceCoverage.exam} assessment file(s), and ${sourceCoverage.review} review file(s).`,
      keyPoints: ensureAtLeast(topic.keyPhrases, [
        "Review definitions",
        "Practice examples",
      ]),
      whyItMatters: ensureAtLeast(topic.reasons, [
        "Appeared repeatedly in uploaded materials",
      ]),
    })),
    [
      {
        topic: sourceFiles[0] ? `Core ideas from ${sourceFiles[0]}` : "Core course concepts",
        importance: "High",
        confidence: 0.55,
        summary: "A simplified guide was generated from available course files and metadata.",
        keyPoints: sourceFiles.length > 0 ? sourceFiles : ["Upload more course files"],
        whyItMatters: [
          "This topic is derived from currently available uploads and can be refined with additional files.",
        ],
      },
    ],
  );

  const quiz: QuizQuestion[] = ensureAtLeast(
    topics.slice(0, input.plan === "premium" ? 10 : 5).flatMap((topic, index) => {
      const phrase = topic.keyPhrases[0] ?? "core concept";
      const mcq: QuizQuestion = {
        prompt: `Which statement best reflects the role of ${topic.title} in this course?`,
        type: "multiple_choice",
        choices: [
          `${topic.title} appears in uploaded materials but should only be memorized without understanding.`,
          `${topic.title} appears repeatedly and should be practiced using ${phrase} and applied examples.`,
          `${topic.title} is useful only when doing optional enrichment reading.`,
          `${topic.title} can be deferred because it is unlikely to affect exam prep.`,
        ],
        answer: "B",
        explanation: `This topic is prioritized from recurrence, emphasis language, and source overlap in your uploads.`,
        topic: topic.title,
      };

      const shortAnswer: QuizQuestion = {
        prompt: `In 3-5 sentences, explain why ${topic.title} is likely exam-relevant and reference one term such as "${phrase}".`,
        type: "short_answer",
        answer: `A strong response links ${topic.title} to repeated course emphasis, one concrete term (${phrase}), and one practical application.`,
        explanation:
          "Short-answer prompts are generated from topic-level signals and source overlap patterns.",
        topic: topic.title,
      };

      return input.plan === "premium"
        ? index < 8
          ? [mcq, shortAnswer]
          : [mcq]
        : index < 3
          ? [mcq, shortAnswer]
          : [mcq];
    }),
    [
      {
        prompt:
          "Based on your uploaded files, what two topics should you review first and why?",
        type: "short_answer",
        answer:
          "Reference the files with lecture/review/exam naming signals and explain how repeated concepts should be prioritized.",
        explanation:
          "This fallback quiz is still course-specific and becomes more detailed as more extractable text is available.",
        topic: "Course Prioritization",
      },
    ],
  );

  const flashcards: Flashcard[] = ensureAtLeast(
    topics.slice(0, input.plan === "premium" ? 24 : 10).map((topic) => ({
      topic: topic.title,
      front: `Define or explain: ${topic.title}`,
      back: `Key terms: ${ensureAtLeast(topic.keyPhrases, [
        "definition",
        "process",
        "application",
      ]).join(", ")}. Why it matters: ${topic.reasons[0] ?? "Recurring in course material."}`,
    })),
    [
      {
        topic: "Course Signals",
        front: "Which uploaded files should you review first?",
        back: sourceFiles.length
          ? `Start with: ${sourceFiles.join(", ")}. Prioritize files that look like assessments and review guides.`
          : "Upload more files to produce richer flashcards.",
      },
    ],
  );

  const quickReview = ensureAtLeast(
    topics.slice(0, input.plan === "premium" ? 10 : 5).map((topic) => ({
      topic: topic.title,
      confidence: topic.confidence,
      reasons: ensureAtLeast(topic.reasons, ["Pattern-based emphasis detected"]),
      howToReview: `Spend 20-30 focused minutes on ${topic.title}. Include ${
        formulas[0] ? `formula review (${formulas[0]})` : "definition recall"
      } and one short-answer self-test.`,
    })),
    [
      {
        topic: sourceFiles[0] ? `Focus on ${sourceFiles[0]}` : "Course setup",
        confidence: 0.5,
        reasons: [
          "Generated from available course metadata and upload patterns",
          ...(definitions.length > 0 ? [`Definition cue: ${definitions[0]}`] : []),
          ...(formulas.length > 0 ? [`Formula cue: ${formulas[0]}`] : []),
        ],
        howToReview:
          "Review top uploaded course artifacts, summarize repeated terms, and answer one short practice prompt.",
      },
    ],
  );

  if (quickReview.length > 0 && (definitions.length > 0 || formulas.length > 0)) {
    const head = quickReview[0];
    quickReview[0] = {
      ...head,
      reasons: [
        ...head.reasons,
        ...(definitions.length > 0
          ? [`Definition highlight: ${definitions[0]}`]
          : []),
        ...(formulas.length > 0 ? [`Formula highlight: ${formulas[0]}`] : []),
      ],
    };
  }

  return {
    studyGuide,
    quiz,
    flashcards,
    quickReview,
  };
}
