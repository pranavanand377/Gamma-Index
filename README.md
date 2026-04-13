# Gamma Index

Gamma Index is a media tracking web app for anime, TV series, movies, and comics.

It focuses on fast entry, clean tracking workflows, and a premium dark UI with a green-cyan visual identity.

## What It Does

- Add records across multiple media types
- Search metadata from public APIs
- Track progress by episode/chapter and season
- Filter your library by type and status
- Edit/delete records with confirmation safeguards
- Show quick dashboard insights from your tracked data

## Built With

- React 19 + Vite 5
- Tailwind CSS 3
- Framer Motion
- Zustand
- React Router
- Lucide React

## Data and APIs

Client-side storage is currently local to the browser using localStorage.

External data sources:
- Jikan API (anime and comic discovery)
- TVMaze API (TV series and episodes)
- TMDB API (movie search when API key is configured)
- OMDb/Cinemeta fallbacks for movies when TMDB key is missing

Recent integration note:
- Comic discovery moved from MangaDex to Jikan to avoid production browser CORS failures.

## Project Structure

```text
src/
	components/
		common/
		features/
		layout/
	pages/
	services/
	store/
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
```

App runs at: `http://localhost:5173`

### 3. Build for production

```bash
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

## Environment Variables

Optional TMDB integration:

```env
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

If TMDB key is not provided, movie search still works through fallback providers.

## Scripts

- `npm run dev` - start local development
- `npm run build` - create production bundle
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## Product Direction

Planned next step is account-backed persistence (Supabase) so records sync across devices while preserving current UX patterns.

## Learning Notes

In-depth implementation guides are maintained locally for this project workflow.
A tracked index is available in [docs/LEARNING_GUIDE_INDEX.md](docs/LEARNING_GUIDE_INDEX.md).

## License

This project is for personal/educational use unless you define a separate license.
