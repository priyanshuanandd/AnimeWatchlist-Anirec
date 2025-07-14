import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import StatusFilter from '../components/StatusFilter';
import AnimeGrid from '../components/AnimeGrid';

const API_URL =
  (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:5000';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [animeList, setAnimeList] = useState([]);
  const [filterStatus, setFilterStatus] = useState('watching');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();

  const fetchTracked = async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_URL}/api/tracked`, {
        params: { userId: user.id },
      });
      setAnimeList(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching tracked anime:', err);
      setError('Failed to fetch tracked anime');
      setAnimeList([]);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/api/search?q=${searchTerm}`);
      const baseResults = response.data.data;
      const enriched = await Promise.all(
        baseResults.slice(0, 5).map(async (anime) => {
          try {
            const full = await axios.get(`${API_URL}/api/anime/${anime.mal_id}`);
            return full.data;
          } catch {
            return {
              mal_id: anime.mal_id,
              title: anime.title,
              image: anime.images?.jpg?.large_image_url,
              totalEpisodes: anime.episodes || 0,
              airing: anime.airing || false,
              watchedEpisodes: 0,
              nextEpisodeDate: null,
            };
          }
        })
      );
      setAnimeList(enriched);
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (anime) => {
    try {
      const res = await axios.get(`${API_URL}/api/anime/${anime.mal_id}`);
      const data = res.data;
      const payload = {
        mal_id: data.mal_id,
        title: data.title,
        image: data.picture || anime.image || anime.images?.jpg?.large_image_url || '',
        totalEpisodes: data.totalEpisodes || 0,
        watchedEpisodes: 0,
        airing: data.airing,
        nextEpisodeDate: data.nextEpisodeDate,
        userId: user.id,
      };
      await axios.post(`${API_URL}/api/track`, payload);
      await fetchTracked();
    } catch (err) {
      console.error('Failed to track anime:', err);
      setError('Failed to track anime');
    }
  };

  const handleUpdateProgress = async (animeId, newCount) => {
    try {
      await axios.put(`${API_URL}/api/update-progress/${animeId}`, {
        watchedEpisodes: newCount,
      });
      await fetchTracked();
    } catch (err) {
      console.error('Failed to update progress:', err);
      setError('Failed to update progress');
    }
  };

  const handleUpdateStatus = async (animeId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/update-status/${animeId}`, {
        status: newStatus,
      });
      await fetchTracked();
    } catch (err) {
      console.error('Failed to update status:', err);
      setError('Failed to update status');
    }
  };

  const handleDelete = async (animeId) => {
    try {
      await axios.delete(`${API_URL}/api/delete/${animeId}`);
      await fetchTracked();
    } catch (err) {
      console.error('Failed to delete anime:', err);
      setError('Failed to delete anime');
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchTracked();
  };

  const filteredList = Array.isArray(animeList)
    ? animeList.filter((anime) => !anime.status || anime.status === filterStatus)
    : [];

  useEffect(() => {
    fetchTracked();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12">
          <a href="/">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              🎌 Anime Tracker
            </h1>
          </a>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Track your favorite anime and never miss an episode
          </p>
        </div>

        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          loading={loading}
        />

        <StatusFilter filterStatus={filterStatus} setFilterStatus={setFilterStatus} />

        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-6 py-4 rounded-xl mb-6 text-center font-medium shadow-md">
            ⚠️ {error}
          </div>
        )}

        <AnimeGrid
          animeList={filteredList}
          searchTerm={searchTerm}
          loading={loading}
          onTrack={handleTrack}
          onUpdateProgress={handleUpdateProgress}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default Home;
