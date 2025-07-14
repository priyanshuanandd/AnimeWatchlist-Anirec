import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showLeft, setShowLeft] = useState(true);
  const [showNone, setShowNone] = useState(true);

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

  // Group by episodes left vs none left
  const withEpisodesLeft = animeList.filter(
    anime =>
      typeof anime.totalEpisodes === 'number' &&
      typeof anime.watchedEpisodes === 'number' &&
      anime.watchedEpisodes < anime.totalEpisodes
  );

  const noEpisodesLeft = animeList.filter(
    anime =>
      anime.totalEpisodes == null ||
      anime.watchedEpisodes >= anime.totalEpisodes
  );

  const renderGroup = (title, group, isOpen, toggleOpen) => (
    <div className="mb-8">
      <button
        onClick={toggleOpen}
        className="w-full flex items-center justify-between px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-md border border-white/20"
      >
        <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        ) : (
          <ChevronDown className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {isOpen && group.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {group.map(anime => (
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
      )}
    </div>
  );

  return (
    <div>
      {searchTerm ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {animeList.map(anime => (
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
      ) : (
        <>
          {renderGroup(
            'Episodes Left',
            withEpisodesLeft,
            showLeft,
            () => setShowLeft(prev => !prev)
          )}
          {renderGroup(
            'No Episodes Left',
            noEpisodesLeft,
            showNone,
            () => setShowNone(prev => !prev)
          )}
        </>
      )}
    </div>
  );
};

export default AnimeGrid;
