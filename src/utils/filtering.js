// Advanced filter utilities
export const filterItems = (
  items,
  { type = 'all', status = 'all', minRating = 0, isFavoritesOnly = false, searchQuery = '' }
) => {
  return items.filter((item) => {
    if (type !== 'all' && item.type !== type) return false;
    if (status !== 'all' && item.status !== status) return false;
    if (isFavoritesOnly && !item.isFavorite) return false;
    if (minRating > 0 && (item.rating || 0) < minRating) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
};

export const getGenres = (items) => {
  const genreSet = new Set();
  items.forEach((item) => {
    if (item.genres && Array.isArray(item.genres)) {
      item.genres.forEach((g) => genreSet.add(g));
    }
  });
  return Array.from(genreSet);
};

export const getGenreDistribution = (items) => {
  const distribution = {};
  items.forEach((item) => {
    if (item.genres && Array.isArray(item.genres)) {
      item.genres.forEach((genre) => {
        distribution[genre] = (distribution[genre] || 0) + 1;
      });
    }
  });
  return Object.entries(distribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
};

export const getStatusDistribution = (items) => {
  const statuses = {
    watching: items.filter((i) => i.status === 'watching').length,
    completed: items.filter((i) => i.status === 'completed').length,
    dropped: items.filter((i) => i.status === 'dropped').length,
    plan_to_watch: items.filter((i) => i.status === 'plan_to_watch').length,
  };

  return [
    { name: 'Watching', value: statuses.watching, fill: '#10B981' },
    { name: 'Completed', value: statuses.completed, fill: '#22C55E' },
    { name: 'Dropped', value: statuses.dropped, fill: '#EF4444' },
    { name: 'Planned', value: statuses.plan_to_watch, fill: '#F59E0B' },
  ].filter((s) => s.value > 0);
};

export const getTypeDistribution = (items) => {
  return [
    { name: 'Anime', value: items.filter((i) => i.type === 'anime').length, fill: '#06B6D4' },
    { name: 'TV', value: items.filter((i) => i.type === 'tv').length, fill: '#10B981' },
    { name: 'Movies', value: items.filter((i) => i.type === 'movie').length, fill: '#F59E0B' },
    { name: 'Comics', value: items.filter((i) => i.type === 'comic').length, fill: '#EC4899' },
  ].filter((t) => t.value > 0);
};
