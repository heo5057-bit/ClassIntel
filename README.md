# Professor Mode

Professor Mode is an AI-powered study platform for course-specific, professor-aware exam preparation.

## MVP implemented in this repo
- Supabase authentication setup (email/password sign in + sign up)
- Prisma schema with `UserProfile`, `Subscription`, and `Course`
- Dashboard page with authenticated course creation
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
- `DATABASE_URL`

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
- `/dashboard` - authenticated dashboard + course creation
