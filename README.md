# Hemi – Patient Overview Prototype

A rapid prototype of a clinician **Patient Overview** page built with **Next.js + React + TypeScript**.

The overview prioritizes high-risk patients, explains why each needs attention, and surfaces the next recommended action with multidisciplinary context.

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy the env file and set the API base URL (already set by default)
cp .env.example .env.local

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Auth Flow

1. Sign up or log in with your email + password.
2. A 6-digit verification code is sent to your email (**check your spam folder**).
3. Enter the code to receive a JWT, which is stored in `sessionStorage`.

## Project Structure

```
app/
  layout.tsx          Root layout (wraps AuthProvider)
  page.tsx            Redirect to /login or /overview
  login/page.tsx      Email + password auth form
  verify/page.tsx     2FA code verification
  overview/page.tsx   Patient Overview (main page)
  globals.css         App-wide styles

lib/
  types.ts            TypeScript interfaces (Patient, Status, Coordination, etc.)
  api.ts              API client (auth, patients)
  auth-context.tsx    React context for JWT + user state

components/
  PatientCard.tsx     Summary card for one patient
  PatientDetail.tsx   Drilldown modal with full patient info
```

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Sort by attention level, then risk score | High-risk patients appear first; within each tier, higher risk scores surface earlier. |
| Show attention reasons as tags | Quick scan — clinicians can see at a glance *why* a patient is flagged. |
| Prominent "Next step" box | Makes the recommended action impossible to miss. |
| Pending tasks by role + handoff risk | Surfaces multidisciplinary coordination gaps directly on the card. |
| Client-side filtering | 100 patients fit in a single request; no need for server-side pagination in the prototype. |
| sessionStorage for JWT | Acceptable for a 2h prototype; tab-scoped, cleared on close. |

## Trade-offs

- **No persistent auth** — Token lives in sessionStorage; refresh preserves the session within the tab, but closing the tab loses it.
- **Single fetch for all patients** — Works for 100 patients; would need server-side pagination for larger datasets.
- **Minimal visual polish** — Focus on clarity, hierarchy, and actionability over design system integration.
- **No unit tests** — Timeboxed to 2 hours; would add tests for API client and prioritization logic first.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `https://hemihealth-api-31950a0cf112.herokuapp.com` | Hemi candidate API base URL |
