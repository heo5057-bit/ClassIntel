# Professor Mode

Professor Mode is an AI-powered study platform for course-specific, professor-aware exam preparation.

## MVP implemented in this repo
- Supabase authentication setup (email/password sign in + sign up)
- Prisma-backed product data model for courses, uploaded materials, extracted topics, analysis runs, and generated study assets
- Premium subscription model with Stripe checkout + webhook sync
- Authenticated SaaS dashboard with course workspace CRUD
- Course workspace upload flow with persisted material status (`UPLOADED`, `PROCESSING`, `READY`, `ERROR`)
- Professor Mode pattern analysis pipeline (frequency + emphasis + overlap signals)
- Generated study outputs per course:
  - Study guide
  - Practice quiz
  - Flashcards
  - Quick review summary
- Environment variable template for local + Vercel setup

## Setup
1. Install dependencies:
```bash
npm install
```

2. Create your env file:
```bash
cp .env.example .env.local
```

3. Fill in:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for secure storage uploads from server actions)
- `SUPABASE_STORAGE_BUCKET` (optional, defaults to `course-materials`)
- `DATABASE_URL`
- `DIRECT_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_PREMIUM_MONTHLY`
- `NEXT_PUBLIC_APP_URL`

4. Apply Prisma schema:
```bash
npm run prisma:generate
npm run prisma:push
```

5. Run dev server:
```bash
npm run dev
```

Open `http://localhost:3000`.

## Routes
- `/` - landing page
- `/auth/sign-in` - sign in / sign up
- `/dashboard` - authenticated dashboard + course workspace creation
- `/dashboard/courses/[courseId]` - workspace, uploads, statuses, and analysis
- `/dashboard/courses/[courseId]/study-guide` - generated study guide
- `/dashboard/courses/[courseId]/practice-quiz` - generated quiz
- `/dashboard/courses/[courseId]/flashcards` - generated flashcards
- `/dashboard/courses/[courseId]/quick-review` - quick review summary
- `/premium` - premium pricing and upgrade flow
- `/api/stripe/webhook` - Stripe webhook endpoint for subscription sync
