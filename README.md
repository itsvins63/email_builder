# Email Builder (MVP)

Internal email template builder:
- Google login (Supabase Auth)
- Drag-and-drop editor (GrapesJS)
- Save current template state + HTML
- Version history
- Share templates with other signed-in users (viewer/editor)

## Local dev

1. Create a Supabase project
2. Run `supabase.sql` in the Supabase SQL editor
3. Enable Google provider in **Authentication → Providers → Google**
4. Configure redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://<your-vercel-domain>/auth/callback`
5. Create `.env.local`:

```bash
cp .env.example .env.local
```

Fill:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Then:

```bash
npm run dev
```

## Deployment (Vercel)

- Import the repo into Vercel
- Add the same env vars in Vercel project settings
- Deploy

## Testing

### Unit tests (Vitest + React Testing Library)

```bash
npm run test:unit
# or
npm run test:watch
```

### E2E + visual regression (Playwright)

```bash
npm run e2e

# First run / when intentionally changing UI:
npm run e2e:update
```

Playwright visual baselines live next to the spec files in `tests/**.spec.ts-snapshots/`.

### Supabase / RLS integration tests

These tests validate core RLS behavior (owner vs viewer vs editor). They run when the following env vars are present:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Local Supabase (recommended):

```bash
supabase start
supabase db reset
SUPABASE_URL=http://127.0.0.1:54321 \
SUPABASE_ANON_KEY=<from supabase status> \
SUPABASE_SERVICE_ROLE_KEY=<from supabase status> \
  npm run test:integration
```

## Notes

Sharing by email requires the recipient to have signed in at least once (so they exist in `public.profiles`).
