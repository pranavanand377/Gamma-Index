// CSV export utility
export const exportToCSV = (items, filename = 'gamma-index-library.csv') => {
  if (!items || items.length === 0) {
    alert('No items to export');
    return;
  }

  // Define CSV headers
  const headers = [
    'Title',
    'Type',
    'Status',
    'Rating',
    'Is Favorite',
    'Current Episode/Chapter',
    'Total Episodes/Chapters',
    'Season',
    'Year',
    'Genres',
    'Synopsis',
    'Watch Link',
    'Notes',
    'Date Added',
    'Last Updated',
  ];

  // Map items to CSV rows
  const rows = items.map((item) => [
    `"${(item.title || '').replace(/"/g, '""')}"`, // Escape quotes in title
    item.type || '',
    (item.status || '').replaceAll('_', ' '),
    item.rating || '',
    item.isFavorite ? 'Yes' : 'No',
    item.currentEpisode || item.current_episode || '',
    item.totalEpisodes || item.total_episodes || '',
    item.season || '',
    item.year || '',
    Array.isArray(item.genres) ? item.genres.join('; ') : item.genres || '',
    `"${(item.synopsis || '').replace(/"/g, '""')}"`,
    `"${(item.watchLink || item.watch_link || '').replace(/"/g, '""')}"`,
    `"${(item.notes || '').replace(/"/g, '""')}"`,
    item.addedAt || item.added_at || '',
    item.updatedAt || item.updated_at || '',
  ]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
