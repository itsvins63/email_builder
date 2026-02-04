# Email Builder (MVP)

Next.js + Supabase + GrapesJS email template builder.

## Features (current)
- Google login via Supabase Auth
- Templates: create/delete
- GrapesJS editor
- Save version history (`template_versions`)
- Share templates with other users by email (viewer/editor)
  - recipient must have logged in once (so they exist in `profiles`)

## Local dev

1. Create a Supabase project
2. Run the SQL migration:
   - `supabase/migrations/001_init.sql`
3. Enable Google provider in Supabase Auth and set redirect URLs
4. Copy env:

```bash
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Run:

```bash
npm run dev
```

## Deployment

- Deploy to Vercel
- Add the same env vars in Vercel Project Settings

