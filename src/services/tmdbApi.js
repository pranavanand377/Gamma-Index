const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';
const CINEMETA_BASE = 'https://v3-cinemeta.strem.io';
const OMDB_BASE = 'https://www.omdbapi.com';
const OMDB_FALLBACK_KEY = '564727fa';

const getApiKey = () => import.meta.env.VITE_TMDB_API_KEY || '';

const mapTmdbMovie = (item) => ({
  apiId: item.id,
  title: item.title,
  image: item.poster_path ? `${TMDB_IMG}${item.poster_path}` : '',
  synopsis: item.overview || '',
  totalEpisodes: null,
  year: item.release_date ? new Date(item.release_date).getFullYear() : null,
  genres: [],
  score: item.vote_average || null,
});

const mapCinemetaMovie = (item) => ({
  apiId: item.id,
  title: item.name,
  image: item.poster || '',
  synopsis: item.description || '',
  totalEpisodes: null,
  year: item.releaseInfo ? parseInt(String(item.releaseInfo).slice(0, 4), 10) || null : null,
  genres: item.genres || [],
  score: item.imdbRating ? Number(item.imdbRating) : null,
});

const mapOmdbMovie = (item) => ({
  apiId: item.imdbID,
  title: item.Title,
  image: item.Poster && item.Poster !== 'N/A' ? item.Poster : '',
  synopsis: '',
  totalEpisodes: null,
  year: item.Year ? parseInt(String(item.Year).slice(0, 4), 10) || null : null,
  genres: [],
  score: null,
});

export const searchMovies = async (query) => {
  if (!query || query.length < 2) return [];

  const apiKey = getApiKey();

  if (apiKey) {
    const res = await fetch(
      `${TMDB_BASE}/search/movie?api_key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(query)}&page=1`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results.slice(0, 8).map(mapTmdbMovie);
  }

  try {
    const omdbRes = await fetch(
      `${OMDB_BASE}/?s=${encodeURIComponent(query)}&type=movie&apikey=${OMDB_FALLBACK_KEY}`
    );
    if (omdbRes.ok) {
      const omdbData = await omdbRes.json();
      if (omdbData.Response === 'True' && Array.isArray(omdbData.Search) && omdbData.Search.length > 0) {
        return omdbData.Search.slice(0, 8).map(mapOmdbMovie);
      }
    }
  } catch {}

  try {
    const cinemetaRes = await fetch(
      `${CINEMETA_BASE}/catalog/movie/top/search=${encodeURIComponent(query)}.json`
    );
    if (!cinemetaRes.ok) return [];
    const cinemetaData = await cinemetaRes.json();
    return (cinemetaData.metas || []).slice(0, 8).map(mapCinemetaMovie);
  } catch {
    return [];
  }
};

export const searchTvSeries = async (query) => {
  const apiKey = getApiKey();
  if (!query || query.length < 2 || !apiKey) return [];
  const res = await fetch(
    `${TMDB_BASE}/search/tv?api_key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(query)}&page=1`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results.slice(0, 8).map((item) => ({
    apiId: item.id,
    title: item.name,
    image: item.poster_path ? `${TMDB_IMG}${item.poster_path}` : '',
    synopsis: item.overview || '',
    totalEpisodes: item.number_of_episodes || null,
    year: item.first_air_date ? new Date(item.first_air_date).getFullYear() : null,
    genres: [],
    score: item.vote_average || null,
  }));
};

export const fetchTvSeasons = async (seriesId) => {
  const apiKey = getApiKey();
  if (!apiKey) return [];
  const res = await fetch(`${TMDB_BASE}/tv/${seriesId}?api_key=${encodeURIComponent(apiKey)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.seasons || [])
    .filter((s) => s.season_number > 0)
    .map((s) => ({ number: s.season_number, name: s.name, episodeCount: s.episode_count }));
};

export const fetchTvEpisodes = async (seriesId, seasonNumber) => {
  const apiKey = getApiKey();
  if (!apiKey) return [];
  const res = await fetch(
    `${TMDB_BASE}/tv/${seriesId}/season/${seasonNumber}?api_key=${encodeURIComponent(apiKey)}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.episodes || []).map((ep) => ({ number: ep.episode_number, name: ep.name || '' }));
};
