type MaterialForScoring = {
  id: string;
  fileName: string;
  mimeType: string;
  extractedText: string | null;
};

export type RankedTopic = {
  title: string;
  summary: string;
  keyPhrases: string[];
  occurrenceCount: number;
  evidenceCount: number;
  emphasisScore: number;
  confidence: number;
  reasons: string[];
};

type TopicAccumulator = {
  title: string;
  occurrences: number;
  fileMentions: Set<string>;
  examMentions: number;
  reviewMentions: number;
  emphasisMentions: number;
  definitionMentions: number;
  formulaMentions: number;
  phraseCounts: Map<string, number>;
};

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "that",
  "with",
  "from",
  "this",
  "your",
  "what",
  "when",
  "where",
  "which",
  "into",
  "have",
  "will",
  "been",
  "were",
  "them",
  "their",
  "there",
  "also",
  "than",
  "each",
  "about",
  "because",
  "between",
  "course",
  "student",
  "students",
  "study",
  "class",
  "chapter",
]);

const EMPHASIS_PATTERNS = [
  /important/gi,
  /must know/gi,
  /remember/gi,
  /high[-\s]yield/gi,
  /focus on/gi,
  /core concept/gi,
  /likely/gi,
  /exam/gi,
  /test/gi,
];

const DEFINITION_PATTERNS = [
  /\bis defined as\b/gi,
  /\bdefinition\b/gi,
  /\brefers to\b/gi,
  /\bmeans\b/gi,
];

const FORMULA_PATTERNS = [
  /[A-Za-z]+\s*=\s*[A-Za-z0-9()+\-/*^.\s]+/g,
  /\bformula\b/gi,
  /\bequation\b/gi,
];

function normalizeToken(token: string): string {
  return token.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function sentenceSplit(text: string): string[] {
  return text
    .split(/\n{2,}|[.!?]\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 20);
}

function deriveTopicName(sentence: string): string {
  const cleaned = sentence.replace(/[^a-zA-Z0-9\s-]/g, " ");
  const words = cleaned
    .split(/\s+/)
    .map(normalizeToken)
    .filter((token) => token.length >= 4 && !STOPWORDS.has(token))
    .slice(0, 5);

  if (words.length === 0) {
    return "General Concept";
  }

  return words
    .slice(0, 3)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function extractKeyPhrases(sentence: string): string[] {
  const tokens = sentence
    .split(/\s+/)
    .map(normalizeToken)
    .filter((token) => token.length >= 5 && !STOPWORDS.has(token));

  return Array.from(new Set(tokens)).slice(0, 6);
}

function buildMetadataSentences(material: MaterialForScoring): string[] {
  const cleanName = material.fileName
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const signals = fileSignalFlags(material.fileName, material.mimeType);
  const sourceType = signals.looksLikeExam
    ? "assessment material"
    : signals.looksLikeReview
      ? "review material"
      : "lecture material";

  const summary = `${cleanName} appears in uploaded ${sourceType} and contributes to exam-focused prioritization.`;
  const emphasis = `${cleanName} should be reviewed with key terms, definitions, and applications from this course source.`;

  return [summary, emphasis];
}

function fileSignalFlags(fileName: string, mimeType: string): {
  looksLikeExam: boolean;
  looksLikeReview: boolean;
} {
  const haystack = (fileName + " " + mimeType).toLowerCase();

  return {
    looksLikeExam: /exam|midterm|final|quiz|test/.test(haystack),
    looksLikeReview: /review|study\s*guide|cheat|summary/.test(haystack),
  };
}

function countPatternMatches(text: string): number {
  return EMPHASIS_PATTERNS.reduce((total, pattern) => {
    const matches = text.match(pattern);
    return total + (matches ? matches.length : 0);
  }, 0);
}

function countAnyPatternMatches(text: string, patterns: RegExp[]): number {
  return patterns.reduce((total, pattern) => {
    const matches = text.match(pattern);
    return total + (matches ? matches.length : 0);
  }, 0);
}

function computeReasons(topic: TopicAccumulator): string[] {
  const reasons: string[] = [];

  if (topic.fileMentions.size >= 2) {
    reasons.push("Appeared across multiple uploaded materials");
  }

  if (topic.examMentions > 0) {
    reasons.push("Found in files that look like quizzes or past exams");
  }

  if (topic.reviewMentions > 0) {
    reasons.push("Repeated in review-oriented materials");
  }

  if (topic.emphasisMentions > 0) {
    reasons.push(
      "Contains emphasis cues like important, focus, or likely test coverage",
    );
  }

  if (topic.definitionMentions > 0) {
    reasons.push("Linked to explicit definitions in the source material");
  }

  if (topic.formulaMentions > 0) {
    reasons.push("Associated with equations or formulas present in your files");
  }

  if (reasons.length === 0) {
    reasons.push("Detected as a recurring concept in uploaded content");
  }

  return reasons;
}

function computeConfidence(score: number): number {
  const normalized = Math.max(0.35, Math.min(0.96, score / 100));
  return Number(normalized.toFixed(2));
}

export function rankProfessorTopics(input: {
  materials: MaterialForScoring[];
}): RankedTopic[] {
  const topicMap = new Map<string, TopicAccumulator>();

  for (const material of input.materials) {
    const text = material.extractedText?.trim();
    const sentenceChunks = text
      ? sentenceSplit(text).slice(0, 220)
      : buildMetadataSentences(material);
    const fileSignals = fileSignalFlags(material.fileName, material.mimeType);

    for (const sentence of sentenceChunks) {
      const topicName = deriveTopicName(sentence);
      const topicKey = topicName.toLowerCase();
      const keyPhrases = extractKeyPhrases(sentence);
      const emphasis = countPatternMatches(sentence);
      const definitionSignals = countAnyPatternMatches(
        sentence,
        DEFINITION_PATTERNS,
      );
      const formulaSignals = countAnyPatternMatches(sentence, FORMULA_PATTERNS);

      let record = topicMap.get(topicKey);

      if (!record) {
        record = {
          title: topicName,
          occurrences: 0,
          fileMentions: new Set<string>(),
          examMentions: 0,
          reviewMentions: 0,
          emphasisMentions: 0,
          definitionMentions: 0,
          formulaMentions: 0,
          phraseCounts: new Map<string, number>(),
        };
        topicMap.set(topicKey, record);
      }

      record.occurrences += 1;
      record.fileMentions.add(material.id);
      record.examMentions += fileSignals.looksLikeExam ? 1 : 0;
      record.reviewMentions += fileSignals.looksLikeReview ? 1 : 0;
      record.emphasisMentions += emphasis;
      record.definitionMentions += definitionSignals;
      record.formulaMentions += formulaSignals;

      for (const phrase of keyPhrases) {
        record.phraseCounts.set(phrase, (record.phraseCounts.get(phrase) ?? 0) + 1);
      }
    }
  }

  return Array.from(topicMap.values())
    .map((topic): RankedTopic => {
      const evidenceCount = topic.fileMentions.size;
      const emphasisScore = Number(
        (
          topic.occurrences * 3 +
          evidenceCount * 12 +
          topic.examMentions * 5 +
          topic.reviewMentions * 4 +
          topic.emphasisMentions * 2 +
          topic.definitionMentions * 2 +
          topic.formulaMentions * 3
        ).toFixed(1),
      );

      const keyPhrases = Array.from(topic.phraseCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([phrase]) => phrase);

      return {
        title: topic.title,
        summary:
          "This concept appears repeatedly across your course material and is ranked from observed frequency, emphasis cues, and assessment overlap.",
        keyPhrases,
        occurrenceCount: topic.occurrences,
        evidenceCount,
        emphasisScore,
        confidence: computeConfidence(emphasisScore),
        reasons: computeReasons(topic),
      };
    })
    .sort((a, b) => b.emphasisScore - a.emphasisScore)
    .slice(0, 18);
}
