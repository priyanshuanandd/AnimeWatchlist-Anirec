import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const AnimeCard = ({
  anime,
  onTrack,
  trackedAnime,
  onUpdateProgress,
  onUpdateStatus,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [watched, setWatched] = useState(anime.watchedEpisodes || 0);
  const [imageError, setImageError] = useState(false);

  const total = anime.totalEpisodes || 0;
  const airingDate = anime.nextEpisodeDate;
  const progressPercentage = total > 0 ? (watched / total) * 100 : 0;

  useEffect(() => {
    setWatched(anime.watchedEpisodes || 0);
  }, [anime.watchedEpisodes]);

  const handleUpdate = (newCount) => {
    if (newCount >= 0 && newCount <= total) {
      setWatched(newCount);
      onUpdateProgress(anime._id, newCount);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'watching':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'dropped':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'watching':
        return '👀';
      case 'completed':
        return '✅';
      case 'dropped':
        return '❌';
      default:
        return '📺';
    }
  };


  return (
    <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-white/20 hover:border-purple-200 dark:hover:border-purple-600 transform hover:-translate-y-1 w-full max-w-md mx-auto">
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={anime.image || anime.images?.jpg?.large_image_url || 'https://i.postimg.cc/pL6XHghj/anime-sleepy.gif'}
          alt={anime.title}
          className="w-full h-64 md:h-72 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // fallback immediately
            e.target.onerror = null;
            e.target.src = 'https://i.postimg.cc/pL6XHghj/anime-sleepy.gif';
          }}
        />




        {/* Status Badge */}
        {trackedAnime && anime.status && (
          <div className={`absolute top-3 right-3 ${getStatusColor(anime.status)} text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg`}>
            <span className="mr-1">{getStatusEmoji(anime.status)}</span>
            {anime.status.charAt(0).toUpperCase() + anime.status.slice(1)}
          </div>
        )}

        {/* Airing Status */}
        <div className="absolute top-3 left-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium shadow-lg ${anime.airing
            ? 'bg-green-500 text-white'
            : 'bg-gray-500 text-white'
            }`}>
            {anime.airing ? '🔴 Airing' : '⏹️ Finished'}
          </div>
        </div>

        {/* Progress Bar */}
        {trackedAnime && total > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm">
            <div
              className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-bold text-lg text-gray-800 dark:text-white line-clamp-2 mb-2">
            {anime.title}
          </h3>

          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>📺 {total || 'N/A'} episodes</span>
            {trackedAnime && (
              <span className="font-medium text-purple-600 dark:text-purple-400">
                {watched}/{total}
              </span>
            )}
          </div>
        </div>
        {/* Next Episode Date */}
        {airingDate && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center text-blue-700 dark:text-blue-300">
              <span className="mr-2">📅</span>
              <div>
                <div className="font-medium">Next Episode</div>
                <div className="text-sm">
                  {dayjs(airingDate).format('dddd, MMM D')} ({dayjs(airingDate).fromNow()})
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Progress Circle for tracked anime */}
        {trackedAnime && total > 0 && (
          <div className="flex items-center justify-center">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-gray-200 dark:text-gray-600"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPercentage / 100)}`}
                  className="text-purple-500 transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium transition-colors duration-200 flex items-center justify-center"
        >
          {expanded ? (
            <>
              <span>Hide Details</span>
              <svg className="w-4 h-4 ml-1 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          ) : (
            <>
              <span>Show Details</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>

        {/* Expanded Content */}
        {expanded && (
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            {/* Progress Controls */}
            {trackedAnime && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Episode Progress
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdate(watched - 1)}
                    disabled={watched <= 0}
                    className="w-8 h-8 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center font-bold"
                  >
                    −
                  </button>

                  <div className="flex-1 text-center">
                    <span className="text-lg font-semibold text-gray-800 dark:text-white">
                      {watched} / {total}
                    </span>
                  </div>

                  <button
                    onClick={() => handleUpdate(watched + 1)}
                    disabled={watched >= total}
                    className="w-8 h-8 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => {
                    handleUpdate(total);
                    onUpdateStatus(anime._id, 'completed');
                  }}
                  className="w-full py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  ✅ Mark as Completed
                </button>
              </div>
            )}



            {/* Action Buttons */}
            {trackedAnime ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateStatus(anime._id, 'watching')}
                    className="py-2 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
                  >
                    👀 Watching
                  </button>
                  <button
                    onClick={() => onUpdateStatus(anime._id, 'completed')}
                    className="py-2 px-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm font-medium"
                  >
                    ✅ Completed
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateStatus(anime._id, 'dropped')}
                    className="py-2 px-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm font-medium"
                  >
                    ❌ Dropped
                  </button>
                  <button
                    onClick={() => onDelete(anime._id)}
                    className="py-2 px-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onTrack(anime)}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
              >
                📝 Track This Anime
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimeCard;