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

## Notes

Sharing by email requires the recipient to have signed in at least once (so they exist in `public.profiles`).
