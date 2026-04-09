export type WorkspaceStatus = {
  hasMaterials: boolean;
  readyMaterials: number;
  processingMaterials: number;
  erroredMaterials: number;
};

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
