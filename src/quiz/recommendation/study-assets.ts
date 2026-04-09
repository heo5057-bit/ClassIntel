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

function ensureAtLeast<T>(items: T[], fallback: T[]): T[] {
  return items.length > 0 ? items : fallback;
}

export function generateStudyAssetsFromTopics(input: {
  rankedTopics: RankedTopic[];
}): GeneratedAssets {
  const topics = input.rankedTopics.slice(0, 10);

  const studyGuide: StudyGuideSection[] = ensureAtLeast<StudyGuideSection>(
    topics.slice(0, 8).map((topic, index) => ({
      topic: topic.title,
      importance: (index < 4 ? "High" : "Medium") as "High" | "Medium",
      confidence: topic.confidence,
      summary: topic.summary,
      keyPoints: ensureAtLeast(topic.keyPhrases, ["Review definitions", "Practice examples"]),
      whyItMatters: topic.reasons,
    })),
    [
      {
        topic: "Upload more course content",
        importance: "High",
        confidence: 0.4,
        summary: "Add lectures, notes, and prior exams to generate targeted study guidance.",
        keyPoints: ["Upload at least one text-based file", "Run analysis"],
        whyItMatters: ["Analysis quality improves with more course-specific evidence"],
      },
    ],
  );

  const quiz: QuizQuestion[] = ensureAtLeast(
    topics.slice(0, 6).flatMap((topic, index) => {
      const mcq: QuizQuestion = {
        prompt: `Which statement best reflects the core idea of ${topic.title}?`,
        type: "multiple_choice",
        choices: [
          `${topic.title} is primarily unrelated to course assessments.`,
          `${topic.title} appears repeatedly and should be prioritized with worked examples.`,
          `${topic.title} is only useful for optional reading sections.`,
          `${topic.title} should be skipped unless extra time remains.`,
        ],
        answer: "B",
        explanation: `This topic is ranked high due to repeated emphasis signals and evidence overlap.`,
        topic: topic.title,
      };

      const shortAnswer: QuizQuestion = {
        prompt: `In 3-5 sentences, explain why ${topic.title} is likely exam-relevant in this course and include one key phrase from your notes.`,
        type: "short_answer",
        answer: `A strong response references repeated lecture emphasis, course artifacts, and one concrete key phrase tied to ${topic.title}.`,
        explanation: "Professor-style short answers reward clear evidence-based reasoning and precise terminology.",
        topic: topic.title,
      };

      return index < 4 ? [mcq, shortAnswer] : [mcq];
    }),
    [
      {
        prompt: "Upload content to generate course-specific quiz questions.",
        type: "short_answer",
        answer: "Once material is available, Professor Mode will generate targeted quizzes.",
        explanation: "Quiz generation depends on extracted course content.",
        topic: "Getting Started",
      },
    ],
  );

  const flashcards: Flashcard[] = ensureAtLeast(
    topics.slice(0, 12).map((topic) => ({
      topic: topic.title,
      front: `What are the most important points to remember about ${topic.title}?`,
      back: `${ensureAtLeast(topic.keyPhrases, ["definition", "process", "application"]).join(", ")}. Why it matters: ${topic.reasons[0] ?? "Recurring in course material."}`,
    })),
    [
      {
        topic: "Getting Started",
        front: "How do I get better study output?",
        back: "Upload lecture notes, guides, and past assessments to build a stronger signal profile.",
      },
    ],
  );

  const quickReview = ensureAtLeast(
    topics.slice(0, 6).map((topic) => ({
      topic: topic.title,
      confidence: topic.confidence,
      reasons: topic.reasons,
      howToReview: `Spend 20-30 focused minutes on ${topic.title}, then self-test with one short answer and one application problem.`,
    })),
    [
      {
        topic: "Course setup",
        confidence: 0.35,
        reasons: ["No extractable material yet"],
        howToReview: "Upload your first course files and rerun analysis.",
      },
    ],
  );

  return {
    studyGuide,
    quiz,
    flashcards,
    quickReview,
  };
}
