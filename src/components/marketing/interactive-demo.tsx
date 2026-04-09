"use client";

import { useMemo, useState } from "react";

type DemoMode = "rank" | "guide" | "quiz";

const demoData = {
  rank: {
    title: "Topic Priority View",
    summary:
      "ClassIntel detects repeated and exam-linked concepts to rank what is most likely to matter.",
    items: [
      { topic: "Cellular Respiration", reason: "Appears in 4 lectures + review sheet", score: 94 },
      { topic: "Enzyme Kinetics", reason: "Shown in homework + prior quiz", score: 89 },
      { topic: "ATP Yield Comparisons", reason: "Repeated in slide headings", score: 82 },
    ],
  },
  guide: {
    title: "Targeted Study Guide",
    summary:
      "Your guide starts with highest-yield topics and includes reasoning so students know why each section is prioritized.",
    items: [
      { topic: "Glycolysis Bottlenecks", reason: "Frequently tested conceptual trap", score: 93 },
      { topic: "Citric Acid Cycle Inputs", reason: "Cross-linked in notes and problem sets", score: 87 },
      { topic: "Oxidative Phosphorylation", reason: "Professor spends longest lecture time", score: 84 },
    ],
  },
  quiz: {
    title: "Professor-Style Practice Quiz",
    summary:
      "AI-generated questions mimic style and difficulty of your class based on course materials.",
    items: [
      { topic: "Question 1", reason: "Application-focused MCQ like previous quiz", score: 91 },
      { topic: "Question 2", reason: "Short response with multi-step reasoning", score: 86 },
      { topic: "Question 3", reason: "Diagram interpretation from lecture style", score: 80 },
    ],
  },
} as const;

const labels: { key: DemoMode; label: string }[] = [
  { key: "rank", label: "Topic Rankings" },
  { key: "guide", label: "Study Guide" },
  { key: "quiz", label: "Quiz Generator" },
];

export function InteractiveDemo() {
  const [mode, setMode] = useState<DemoMode>("rank");
  const panel = useMemo(() => demoData[mode], [mode]);

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-blue-950/40">
      <div className="border-b border-white/10 bg-slate-900/90 px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            ClassIntel Workflow Preview
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-wrap gap-3">
        {labels.map((item) => {
          const active = item.key === mode;
          return (
            <button
              key={item.key}
              onClick={() => setMode(item.key)}
              className={
                active
                  ? "rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950"
                  : "rounded-full border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:border-cyan-300/50"
              }
            >
              {item.label}
            </button>
          );
        })}
        </div>

        <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
              Pattern-Based Analysis Snapshot
            </p>
            <span className="rounded-md border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">
              Confidence Model Enabled
            </span>
          </div>
          <h3 className="mt-3 text-2xl font-semibold">{panel.title}</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">{panel.summary}</p>

          <div className="mt-5 space-y-3">
            {panel.items.map((item) => (
              <div
                key={item.topic}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-900/80 p-3"
              >
                <div>
                  <p className="font-medium text-white">{item.topic}</p>
                  <p className="text-sm text-slate-300">{item.reason}</p>
                </div>
                <div className="rounded-md bg-cyan-400/15 px-3 py-1 text-sm font-semibold text-cyan-200">
                  Confidence {item.score}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 rounded-xl border border-white/10 bg-slate-900/60 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Inputs
            </p>
            <p className="mt-1 text-sm text-slate-200">Lectures, notes, exams</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Signals
            </p>
            <p className="mt-1 text-sm text-slate-200">Frequency, overlap, emphasis</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Output
            </p>
            <p className="mt-1 text-sm text-slate-200">Actionable study priority</p>
          </div>
        </div>
      </div>
    </section>
  );
}
