// components/AnimeGrid.jsx
import React from 'react';
import AnimeCard from './AnimeCard';

const AnimeGrid = ({
  animeList,
  searchTerm,
  loading,
  onTrack,
  onUpdateProgress,
  onUpdateStatus,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
          Searching for anime...
        </p>
      </div>
    );
  }

  if (animeList.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">
          {searchTerm ? 'No Results Found' : 'Your Anime List is Empty'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md mx-auto">
          {searchTerm
            ? 'Try searching with different keywords or check your spelling.'
            : 'Start by searching for anime above to build your personal tracking list!'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
      {animeList.map((anime) => (
        <AnimeCard
          key={anime._id || anime.mal_id}
          anime={anime}
          trackedAnime={!!anime._id}
          onTrack={onTrack}
          onUpdateProgress={onUpdateProgress}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default AnimeGrid;
