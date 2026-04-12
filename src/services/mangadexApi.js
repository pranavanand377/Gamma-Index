const MANGADEX_BASE = 'https://api.mangadex.org';

const FETCH_OPTIONS = {
  headers: {
    'User-Agent': 'Gamma-Index-App/1.0 (https://github.com/pranavanand377/Gamma-Index)',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  mode: 'cors',
};

export const searchManga = async (query, subtype = null) => {
  if (!query || query.length < 2) return [];

  // Build URL with proper encoding
  let url = `${MANGADEX_BASE}/manga?title=${encodeURIComponent(query)}&limit=10&includes[]=cover_art&includes[]=author&includes[]=artist&order[relevance]=desc&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica`;

  // Filter by original language for specific subtypes
  if (subtype && subtype !== 'general') {
    const originMap = { manga: 'ja', manhwa: 'ko', manhua: 'zh' };
    const origin = originMap[subtype];
    if (origin) url += `&originalLanguage[]=${origin}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    console.log('[MangaDex] Searching:', { query, subtype, url });

    const res = await fetch(url, {
      ...FETCH_OPTIONS,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`[MangaDex] API error ${res.status}:`, res.statusText, query);
      return [];
    }

    const data = await res.json();
    console.log('[MangaDex] Search results:', data.data?.length || 0);

    if (!data.data || !Array.isArray(data.data)) {
      console.warn('[MangaDex] No data in response:', data);
      return [];
    }

    return data.data.map((item) => {
      try {
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
          totalEpisodes: item.attributes.lastChapter ? parseInt(item.attributes.lastChapter, 10) : null,
          year: item.attributes.year || null,
          genres: item.attributes.tags
            ?.filter((t) => t.attributes.group === 'genre')
            .map((t) => t.attributes.name?.en)
            .filter(Boolean)
            .slice(0, 5) || [],
          score: null,
        };
      } catch (itemErr) {
        console.warn('[MangaDex] Error mapping item:', itemErr, item);
        return null;
      }
    }).filter(Boolean);
  } catch (err) {
    console.error('[MangaDex] Search error:', err.message || err);
    if (err.name === 'AbortError') {
      console.error('[MangaDex] Request timeout');
    }
    return [];
  }
};

export const fetchMangaChapters = async (mangaId, offset = 0, limit = 200) => {
  try {
    const url = `${MANGADEX_BASE}/manga/${mangaId}/feed?limit=${limit}&offset=${offset}&order[chapter]=asc&includes[]=scanlation_group&translatedLanguage[]=en`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    console.log('[MangaDex] Fetching chapters:', { mangaId, offset });

    const res = await fetch(url, {
      ...FETCH_OPTIONS,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`[MangaDex] Chapters API error ${res.status}:`, res.statusText);
      return { chapters: [], hasMore: false, nextOffset: offset };
    }

    const data = await res.json();
    const seen = new Set();
    const chapters = (data.data || [])
      .map((item) => item.attributes?.chapter)
      .filter(Boolean)
      .map((chapterStr) => {
        const num = parseFloat(chapterStr);
        return Number.isFinite(num) ? num : null;
      })
      .filter((n) => n !== null && n > 0)
      .filter((n) => {
        if (seen.has(n)) return false;
        seen.add(n);
        return true;
      })
      .sort((a, b) => a - b)
      .map((n) => ({ number: n, name: `Chapter ${n}` }));

    const total = data.total || 0;
    const nextOffset = offset + limit;

    console.log('[MangaDex] Chapters fetched:', { count: chapters.length, hasMore: nextOffset < total });

    return {
      chapters,
      hasMore: nextOffset < total,
      nextOffset,
    };
  } catch (err) {
    console.error('[MangaDex] Chapters fetch error:', err.message || err);
    return { chapters: [], hasMore: false, nextOffset: offset };
  }
};
