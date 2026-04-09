# Professor Mode PRD

## One-line summary
Professor Mode is an AI-powered study platform that helps college students prepare for exams by analyzing their course materials and identifying what their specific professor emphasizes and tests.

---

## Problem

Students in difficult college courses are overwhelmed by too much content and limited time.

Most existing tools:
- treat all content equally
- generate generic summaries
- do not reflect how a specific professor teaches or tests

As a result, students waste time studying low-yield material and miss what actually appears on exams.

---

## Solution

Professor Mode allows students to upload:
- lecture slides
- class notes
- syllabi
- review guides
- homework/problem sets
- past quizzes and exams

The system analyzes these materials to:
- detect repeated concepts
- identify emphasized topics
- find overlap between teaching material and past exams
- infer how the professor structures questions

It then generates:
- ranked high-yield topics
- study guides
- summaries
- professor-style quizzes
- adaptive recommendations

---

## Core Differentiator

This is NOT a general-purpose AI study tool.

This is:
- course-specific
- professor-specific
- pattern-aware
- evidence-driven

It helps students study smarter by focusing on what is most likely to matter.

---

## Target Users

- College students in challenging courses
- Pre-med, engineering, CS, and science students
- Students preparing for midterms and finals
- Users who want to optimize study time

---

## Core Feature: Professor Mode

Professor Mode analyzes uploaded materials to estimate:

### Topic Importance
- which topics appear most frequently
- which concepts repeat across lectures
- which appear in both lectures and exams
- which are emphasized in review guides
- which are structurally emphasized (titles, repetition)

### Question Style
- multiple choice vs free response
- conceptual vs calculation-based
- direct recall vs application
- multi-step reasoning
- common phrasing patterns

---

## Outputs

The system generates:

### 1. Topic Rankings
- ranked by importance
- confidence/likelihood score
- explanation for ranking

### 2. Study Guide
- high-yield topics first
- concise summaries
- recommended focus areas

### 3. Practice Quizzes
- professor-style questions
- multiple formats (MCQ, short answer, etc.)
- explanations

### 4. Adaptive Recommendations
- identifies weak areas
- prioritizes high-yield + low-performance topics
- suggests next study steps

---

## Scoring System (Critical)

Topic importance is calculated using:

- frequency across materials
- recurrence across multiple documents
- appearance in quizzes/exams
- presence in review guides
- structural emphasis (headers, repetition)
- relationship to core concepts
- student performance (weakness weighting)

The system must be:
- modular
- explainable
- adjustable

---

## Explainability Requirement

Every recommendation must include reasoning such as:

- “Appears in 5 lecture decks”
- “Included in review guide”
- “Seen in past exams”
- “Repeated in headings”
- “You are weak in this topic”

---

## MVP Features

### Core
- authentication
- course creation
- file upload (PDF)
- document parsing
- topic extraction
- topic ranking
- study guide generation
- quiz generation
- quiz attempts
- weak-area tracking

### UI
- landing page
- dashboard
- course page
- upload page
- analysis page
- study guide page
- quiz page
- results page

### SaaS
- free tier (limited usage)
- paid tier (full features)
- Stripe integration
- subscription tracking
- feature gating

---

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (auth, DB, storage)
- PostgreSQL
- Stripe (billing)
- Vercel (deployment)
- OpenAI API (analysis + generation)

---

## Architecture Overview

Layers:
- UI (Next.js pages/components)
- API routes / server actions
- domain services
- ingestion/parsing pipeline
- analysis/scoring engine
- AI provider layer
- persistence (Supabase/Postgres)
- billing (Stripe)

---

## Success Criteria

- User can upload materials
- System produces believable topic rankings
- Study guide feels personalized
- Quiz feels similar to course style
- Recommendations feel useful and accurate
- App is clean, fast, and usable

---

## Future Features (Not MVP)

- collaborative class sharing
- professor/course templates
- mobile app
- flashcards / spaced repetition
- GPA tracking / analytics