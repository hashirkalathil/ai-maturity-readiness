# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Development
npm run dev              # Start development server at http://localhost:3000
npm run build           # Create production build
npm run start           # Start production server
npm run seed            # Seed database with sample assessment data
```

## Project Architecture

### Tech Stack
- **Next.js 16.2** with App Router (React 19)
- **Supabase** (auth, database, SSR clients)
- **Zustand** for client-side state management
- **Groq SDK** for AI-powered question generation
- **Tailwind CSS v4** for styling
- **@react-pdf/renderer** for PDF export
- **Recharts** for data visualization

### App Structure
The app uses **route groups** to separate admin and client flows:

```
app/
├── (admin)/              # Admin-only routes (protected by middleware)
│   ├── admin/
│   │   ├── dashboard/   # Main admin dashboard
│   │   ├── responses/   # View all assessment responses
│   │   └── export/      # Export data functionality
│   ├── login/           # Admin authentication
│   └── api/
│       └── admin/       # Admin API routes
├── (client)/            # Public-facing assessment flow
│   ├── assessment/      # Multi-step assessment wizard
│   ├── results/[sessionId]/  # Assessment results page
│   └── page.jsx         # Landing page
└── api/
    └── assessment/
        └── generate-questions/  # AI question generation endpoint
```

### Key Components

**State Management:**
- `store/assessmentStore.js` - Zustand store managing assessment state (questions, answers, progress)

**Core Libraries:**
- `lib/supabase/` - Supabase clients (browser, server, admin)
- `lib/groqQuestions.js` - AI question generation with fallback logic
- `lib/groqReport.js` - AI report generation
- `lib/scoring.js` - Scoring algorithms for maturity calculation

**Constants:**
- `constants/dimensions.js` - Defines the 7 AI maturity dimensions, weights, labels, and maturity levels

**Middleware:**
- `middleware.js` - Protects `/admin/*` routes, redirects unauthenticated users to login

**Components:**
- `components/admin/` - Dashboard charts, tables, stats
- `components/assessment/` - Assessment UI components
- Shared UI components follow standard React patterns

### Data Flow

1. **Assessment Start**: User lands on `/`, enters company info
2. **Question Generation**: 
   - Calls `/api/assessment/generate-questions` with industry/size
   - Uses Groq AI with fallback to template-based questions
   - Questions stored in Zustand store + Supabase session
3. **Assessment Flow**: Multi-step wizard, answers saved to store
4. **Submission**: Answers persisted to Supabase `assessment_responses` table
5. **Results**: Score calculated, stored, displayed with charts
6. **Admin View**: `/admin/responses` shows all submissions, drill-down available

### Database Schema

Key tables (in Supabase):
- `assessment_sessions` - Tracks assessment sessions
- `assessment_responses` - Stores completed responses with scores
- `dimension_definitions` - Dimension metadata (likely seeded)

Run `npm run seed` to insert initial dimension data.

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # For admin operations
GROQ_API_KEY=              # For AI question generation (optional but recommended)
```

### Important Patterns

- **Route Groups**: `(admin)` and `(client)` groups share global layout but enforce different auth flows
- **Server Actions**: Minimal; mostly API routes with server components
- **SSR vs Client**: Pages use hybrid approach - server components fetch data, client components handle interactivity
- **AI Fallback**: `lib/groqQuestions.js` gracefully falls back to template questions if Groq API fails

### Testing

No test suite currently exists. If adding tests, follow standard Next.js patterns:
- Place tests alongside files or in `__tests__` directories
- Use Jest/Vitest with React Testing Library for components
- Test critical logic in `lib/` (scoring, question generation)

### Styling

Uses **Tailwind CSS v4** with utility-first classes. Global styles in `app/globals.css`.

### Important Notes

- This Next.js version has **breaking changes** from standard Next.js - read `node_modules/next/dist/docs/` when in doubt
- Assessment questions are **industry-specific** and **size-calibrated**; Groq prompts in `lib/groqQuestions.js` are critical
- Middleware enforces admin protection - always test admin routes when modifying auth logic
- PDF generation uses `@react-pdf/renderer` - a client-side renderer packaged for server

### AGENTS.md

This project includes special agent rules in `AGENTS.md`. Read it before making significant changes - it warns about Next.js version differences.
