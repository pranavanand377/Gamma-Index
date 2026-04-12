const MANGADEX_BASE = 'https://api.mangadex.org';

const FETCH_OPTIONS = {
  headers: {
    'User-Agent': 'Gamma-Index-App/1.0',
  },
};

export const searchManga = async (query, subtype = null) => {
  if (!query || query.length < 2) return [];

  let url = `${MANGADEX_BASE}/manga?title=${encodeURIComponent(query)}&limit=8&includes%5B%5D=cover_art&order%5Brelevance%5D=desc`;

  if (subtype) {
    const originMap = { manga: 'ja', manhwa: 'ko', manhua: 'zh' };
    const origin = originMap[subtype];
    if (origin) url += `&originalLanguage%5B%5D=${origin}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      ...FETCH_OPTIONS,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[MangaDex] Search failed with status ${res.status}:`, query);
      return [];
    }
    const data = await res.json();
    if (!data.data) return [];

    return (data.data || []).map((item) => {
      const coverRel = item.relationships?.find((r) => r.type === 'cover_art');
      const coverFile = coverRel?.attributes?.fileName || '';
      const image = coverFile
        ? `https://uploads.mangadex.org/covers/${item.id}/${coverFile}.256.jpg`
        : '';

      const title =
        item.attributes.title?.en ||
        item.attributes.title?.ja ||
        Object.values(item.attributes.title || {})[0] ||
        'Unknown';

      const synopsis =
        item.attributes.description?.en ||
        Object.values(item.attributes.description || {})[0] ||
        '';

      return {
        apiId: item.id,
        title,
        image,
        synopsis: synopsis.slice(0, 300),
        totalEpisodes: item.attributes.lastChapter ? parseInt(item.attributes.lastChapter) : null,
        year: item.attributes.year || null,
        genres: item.attributes.tags
          ?.filter((t) => t.attributes.group === 'genre')
          .map((t) => t.attributes.name?.en)
          .filter(Boolean)
          .slice(0, 5) || [],
        score: null,
      };
    });
  } catch (err) {
    console.error('[MangaDex] Search error:', err);
    return [];
  }
};

export const fetchMangaChapters = async (mangaId, offset = 0, limit = 200) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `${MANGADEX_BASE}/manga/${mangaId}/feed?limit=${limit}&offset=${offset}&order%5Bchapter%5D=asc&includes%5B%5D=scanlation_group`,
      {
        ...FETCH_OPTIONS,
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[MangaDex] Chapters fetch failed with status ${res.status}:`, mangaId);
      return { chapters: [], hasMore: false, nextOffset: offset };
    }

    const data = await res.json();
    const seen = new Set();
    const chapters = (data.data || [])
      .map((item) => item.attributes?.chapter)
      .filter(Boolean)
      .map((chapterStr) => Number(chapterStr))
      .filter((n) => Number.isFinite(n) && n > 0)
      .filter((n) => {
        if (seen.has(n)) return false;
        seen.add(n);
        return true;
      })
      .sort((a, b) => a - b)
      .map((n) => ({ number: n, name: `Chapter ${n}` }));

    const total = data.total || 0;
    const nextOffset = offset + limit;

    return {
      chapters,
      hasMore: nextOffset < total,
      nextOffset,
    };
  } catch (err) {
    console.error('[MangaDex] Chapters fetch error:', err);
    return { chapters: [], hasMore: false, nextOffset: offset };
  }
};
