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

  const total = anime.totalEpisodes || 0;
  const airingDate = anime.nextEpisodeDate;

  useEffect(() => {
    setWatched(anime.watchedEpisodes || 0);
  }, [anime.watchedEpisodes]);

  const handleUpdate = (newCount) => {
    if (newCount >= 0 && newCount <= total) {
      setWatched(newCount);
      onUpdateProgress(anime._id, newCount);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden w-[250px] flex flex-col">
      <img
        src={anime.image || anime.images?.jpg?.large_image_url || 'https://via.placeholder.com/250x350?text=No+Image'}
        alt={anime.title}
        className="w-full h-[350px] object-cover"
      />
      <div className="p-4 flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{anime.title}</h2>
        <p className="text-sm text-gray-500">Episodes: {total || 'N/A'}</p>
        <p className="text-sm text-gray-500">Status: {anime.airing ? 'Airing' : 'Completed'}</p>
        <div className="flex items-center justify-between mb-2">
          <span>Progress:</span>
          <span>{watched} / {total}</span>
        </div>
        <button
          className="mt-2 text-blue-600 text-sm underline"
          onClick={() => setExpanded(!expanded)}
        >

          {expanded ? 'Hide Details ▲' : 'Show Details ▼'}
        </button>

        {expanded && (
          <div className="mt-3 border-t pt-3 text-sm">


            <div className="flex gap-2 justify-between mb-2">
              <button
                onClick={() => handleUpdate(watched - 1)}
                className="bg-gray-300 text-black px-2 py-1 rounded hover:bg-gray-400"
              >−</button>
              <button
                onClick={() => handleUpdate(watched + 1)}
                className="bg-gray-300 text-black px-2 py-1 rounded hover:bg-gray-400"
              >+</button>
              <button
                onClick={() => {
                  handleUpdate(total);
                  onUpdateStatus(anime._id, 'completed');
                }}
                className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
              >Mark Done</button>
            </div>

            {airingDate && (
              <div className="mt-2 text-xs text-blue-500">
                📅 Next episode: {dayjs(airingDate).format('dddd, MMM D')} (
                {dayjs(airingDate).fromNow()})
              </div>
            )}
          </div>
        )}

        {trackedAnime ? (
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={() => onUpdateStatus(anime._id, 'watching')}
              className="bg-yellow-400 text-black px-2 py-1 rounded hover:bg-yellow-500"
            >
              Mark Watching
            </button>
            <button
              onClick={() => onUpdateStatus(anime._id, 'completed')}
              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
            >
              Mark Completed
            </button>
            <button
              onClick={() => onUpdateStatus(anime._id, 'dropped')}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              Mark Dropped
            </button>
            <button
              onClick={() => onDelete(anime._id)}
              className="bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-900"
            >
              Delete
            </button>
          </div>
        ) : (
          <button
            onClick={() => onTrack(anime)}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Track This Anime
          </button>
        )}
      </div>
    </div>
  );
};

export default AnimeCard;
