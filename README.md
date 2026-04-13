# Gamma Index

Gamma Index is a multi-tenant media tracker for anime, TV series, movies, and comics.

It is designed around one goal: make tracking feel fast, visual, and reliable even when third-party APIs are incomplete.

## Product Overview

Gamma Index helps users:

- discover titles using integrated metadata APIs
- add entries quickly with polished tracking flows
- maintain progress over time (episode/chapter and seasons)
- monitor library health through dashboard insights
- manage favorites, ratings, and notes in one place

It also includes a built-in approval system so one admin account can control who gets access in a multi-tenant environment.

## Key Features

### Library and Tracking

- Track Anime, TV, Movies, and Comics in one workspace
- Add/Edit/Delete records with confirmation and toast feedback
- Episode/chapter progress tracking with manual override controls
- TV season-aware tracking
- Favorites system independent from rating
- Per-title notes and watch/read links

### Smart Data Entry

- API-driven search and metadata hydration
- Manual fallback entry when APIs fail or return poor matches
- Manual image upload support for custom records
- Dynamic manual episode tile generation when API episode data is missing

### Admin and Multi-Tenant Controls

- Account-backed persistence via Supabase
- Tenant data isolation
- Admin-only user approval and account disable controls
- Pending approval gate for new users

### UX and Visuals

- Branded dark theme with Gamma Green visual identity
- Dashboard statistics and chart visualizations
- My List filtering, sorting, and CSV export
- Responsive layout for desktop and mobile

## Tech Stack

- React 19 + Vite 5
- Tailwind CSS 3
- Framer Motion
- Zustand
- React Router
- Supabase (Auth, Postgres, Storage)
- Recharts
- Lucide React

## Quick Start

### 1. Install

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and set:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ADMIN_EMAIL=your_admin_email@example.com
VITE_TMDB_API_KEY=optional_tmdb_api_key
```

### 3. Run locally

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
npm run preview
```

## Deployment

Gamma Index is configured for GitHub Pages deployment through GitHub Actions.

Deployment workflow: `.github/workflows/deploy.yml`

Required repository secrets:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_EMAIL`
- `VITE_TMDB_API_KEY` (optional)

## Product Notes

- This project is actively iterated with a product-first mindset.
- Internal implementation deep-dives are documented separately in the local `learning/` folder.

## License

This project is currently intended for personal and educational use unless a separate license is added.
