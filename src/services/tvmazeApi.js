const TVMAZE_BASE = 'https://api.tvmaze.com';

export const searchTvSeries = async (query) => {
  if (!query || query.length < 2) return [];
  const res = await fetch(`${TVMAZE_BASE}/search/shows?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.slice(0, 8).map(({ show }) => ({
    apiId: show.id,
    title: show.name,
    image: show.image?.medium || show.image?.original || '',
    synopsis: show.summary?.replace(/<[^>]*>/g, '').trim() || '',
    totalEpisodes: null,
    year: show.premiered ? new Date(show.premiered).getFullYear() : null,
    genres: show.genres || [],
    score: show.rating?.average || null,
  }));
};

// Fetches ALL episodes for a show in one call, groups them by season number.
// Returns: { 1: [{number, name}, ...], 2: [...], ... }
export const fetchTvEpisodesBySeason = async (showId) => {
  const res = await fetch(`${TVMAZE_BASE}/shows/${showId}/episodes`);
  if (!res.ok) return {};
  const eps = await res.json();
  return eps.reduce((acc, ep) => {
    if (!acc[ep.season]) acc[ep.season] = [];
    acc[ep.season].push({ number: ep.number, name: ep.name || '' });
    return acc;
  }, {});
};
