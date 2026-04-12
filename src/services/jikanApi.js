const JIKAN_BASE = 'https://api.jikan.moe/v4';

export const searchAnime = async (query) => {
  if (!query || query.length < 2) return [];
  const res = await fetch(
    `${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&limit=8&sfw=true`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.data.map((item) => ({
    apiId: item.mal_id,
    title: item.title,
    image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '',
    synopsis: item.synopsis || '',
    totalEpisodes: item.episodes || null,
    year: item.year || (item.aired?.from ? new Date(item.aired.from).getFullYear() : null),
    genres: item.genres?.map((g) => g.name) || [],
    score: item.score || null,
  }));
};

export const fetchAnimeEpisodes = async (malId, page = 1) => {
  const res = await fetch(`${JIKAN_BASE}/anime/${malId}/episodes?page=${page}`);
  if (!res.ok) return { episodes: [], hasNext: false };
  const data = await res.json();
  const episodes = (data.data || []).map((ep) => ({
    number: ep.mal_id,
    name: ep.title || '',
  }));

  // Jikan's has_next_page can be false on long-running shows; infer continuation from page size.
  const inferredHasNext = episodes.length >= 100;
  return {
    episodes,
    hasNext: Boolean(data.pagination?.has_next_page) || inferredHasNext,
  };
};

export const searchManga = async (query, subtype = null) => {
  if (!query || query.length < 2) return [];

  const typeMap = { manga: 'manga', manhwa: 'manhwa', manhua: 'manhua' };
  const typeParam = subtype && typeMap[subtype] ? `&type=${typeMap[subtype]}` : '';
  const url = `${JIKAN_BASE}/manga?q=${encodeURIComponent(query)}&limit=10&sfw=true${typeParam}`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();

  return (data.data || []).map((item) => ({
    apiId: item.mal_id,
    title: item.title_english || item.title,
    image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '',
    synopsis: item.synopsis || '',
    totalEpisodes: item.chapters || null,
    year: item.published?.from ? new Date(item.published.from).getFullYear() : null,
    genres: item.genres?.map((g) => g.name).slice(0, 5) || [],
    score: item.score || null,
  }));
};

export const fetchMangaChapters = async (malId, offset = 0, limit = 200) => {
  try {
    const res = await fetch(`${JIKAN_BASE}/manga/${malId}`);
    if (!res.ok) return { chapters: [], hasMore: false, nextOffset: 0 };
    const data = await res.json();
    const total = data.data?.chapters;
    if (!total) return { chapters: [], hasMore: false, nextOffset: 0 };

    const end = Math.min(offset + limit, total);
    const chapters = [];
    for (let i = offset + 1; i <= end; i++) {
      chapters.push({ number: i, name: `Chapter ${i}` });
    }
    return { chapters, hasMore: end < total, nextOffset: end };
  } catch {
    return { chapters: [], hasMore: false, nextOffset: 0 };
  }
};
