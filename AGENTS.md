# Professor Mode – Agent Instructions

## Mission
Build a production-minded MVP for Professor Mode, an AI-powered study tool for college students that analyzes course materials to identify what a professor emphasizes and generates course-specific study guides and professor-style quizzes.

## Required platform choices
Use:
- Supabase for auth, Postgres, storage, and data ownership boundaries
- Stripe for subscription billing and webhook-driven entitlement syncing
- Vercel as the default deployment target
- Next.js App Router for the application structure

## Working style
- Make strong reasonable decisions without excessive back-and-forth
- Prefer end-to-end functionality over premature optimization
- Implement vertical slices so the app stays runnable
- Keep code modular and easy to extend

## Architecture rules
Keep these layers distinct:
- app / UI layer
- API routes / server actions
- domain layer
- persistence layer
- Supabase integration layer
- Stripe billing layer
- ingestion/parsing layer
- analysis/scoring layer
- AI provider layer
- quiz/recommendation layer

## Product goals
- Help students study smarter by prioritizing likely high-yield topics
- Use uploaded course materials as the source of truth
- Be transparent about why topics are ranked
- Avoid overstating certainty
- Keep the app polished and demo-ready