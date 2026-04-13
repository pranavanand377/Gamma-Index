// Sorting utilities for media items
export const sortOptions = [
  { value: 'date-added-newest', label: 'Date Added (Newest)' },
  { value: 'date-added-oldest', label: 'Date Added (Oldest)' },
  { value: 'title-az', label: 'Title (A-Z)' },
  { value: 'title-za', label: 'Title (Z-A)' },
  { value: 'rating-high', label: 'Rating (High to Low)' },
  { value: 'rating-low', label: 'Rating (Low to High)' },
  { value: 'progress', label: 'Progress (Highest First)' },
];

export const sortItems = (items, sortBy) => {
  const sorted = [...items];

  switch (sortBy) {
    case 'date-added-newest':
      return sorted.sort((a, b) => new Date(b.addedAt || b.added_at) - new Date(a.addedAt || a.added_at));
    case 'date-added-oldest':
      return sorted.sort((a, b) => new Date(a.addedAt || a.added_at) - new Date(b.addedAt || b.added_at));
    case 'title-az':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'title-za':
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case 'rating-high':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'rating-low':
      return sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    case 'progress':
      return sorted.sort((a, b) => {
        const progressA = a.totalEpisodes ? (a.currentEpisode || 0) / a.totalEpisodes : 1;
        const progressB = b.totalEpisodes ? (b.currentEpisode || 0) / b.totalEpisodes : 1;
        return progressB - progressA;
      });
    default:
      return sorted;
  }
};
