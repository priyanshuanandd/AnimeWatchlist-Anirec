import React, { useState, useEffect } from 'react';
import AnimeCard from '../components/AnimeCard';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';

// Environment variable for API URL with fallback
const API_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
    'http://localhost:5000';

const Home = () => {
    // State management
    const [searchTerm, setSearchTerm] = useState('');
    const [animeList, setAnimeList] = useState([]);
    const [filterStatus, setFilterStatus] = useState('watching');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useUser();

    // Status options for filtering
    const STATUS_OPTIONS = [
        { value: 'watching', label: 'Watching', emoji: '👀', color: 'bg-blue-500' },
        { value: 'completed', label: 'Completed', emoji: '✅', color: 'bg-green-500' },
        { value: 'dropped', label: 'Dropped', emoji: '❌', color: 'bg-red-500' }
    ];

    /**
     * Fetch tracked anime from the API
     */
    const fetchTracked = async () => {
        try {
            setError(null);
            const response = await axios.get(`${API_URL}/api/tracked`, {
                params: { userId: user.id }
            });

            setAnimeList(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Error fetching tracked anime:', err);
            setError('Failed to fetch tracked anime');
            setAnimeList([]);
        }
    };

    /**
     * Search for anime using the API
     */
    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const searchResponse = await axios.get(`${API_URL}/api/search?q=${searchTerm}`);
            const baseResults = searchResponse.data.data;

            // Enrich search results with full anime data
            const enrichedResults = await Promise.all(
                baseResults.slice(0, 5).map(async (anime) => {
                    try {
                        const fullResponse = await axios.get(`${API_URL}/api/anime/${anime.mal_id}`);
                        return fullResponse.data;
                    } catch (err) {
                        console.warn(`Failed to fetch full data for anime ${anime.mal_id}:`, err);
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


            setAnimeList(enrichedResults);
        } catch (err) {
            console.error('Search error:', err);
            setError('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle Enter key press in search input
     */
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    /**
     * Track a new anime
     */
    const handleTrack = async (anime) => {
        try {
            const fullDataResponse = await axios.get(`${API_URL}/api/anime/${anime.mal_id}`);
            const data = fullDataResponse.data;

            const payload = {
                mal_id: data.mal_id,
                title: data.title,
                image: data.picture,
                totalEpisodes: data.totalEpisodes || 0,
                watchedEpisodes: 0,
                airing: data.airing,
                nextEpisodeDate: data.nextEpisodeDate,
                userId: user.id,
            };

            await axios.post(`${API_URL}/api/track`, payload);


            await axios.post(`${API_URL}/api/track`, payload);
            await fetchTracked();
        } catch (err) {
            console.error('Failed to track anime:', err);
            setError('Failed to track anime');
        }
    };

    /**
     * Update anime progress (watched episodes)
     */
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

    /**
     * Update anime status (watching, completed, dropped)
     */
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

    /**
     * Delete anime from tracking
     */
    const handleDelete = async (animeId) => {
        try {
            await axios.delete(`${API_URL}/api/delete/${animeId}`);
            await fetchTracked();
        } catch (err) {
            console.error('Failed to delete anime:', err);
            setError('Failed to delete anime');
        }
    };

    /**
     * Clear search and return to tracked anime
     */
    const handleClearSearch = () => {
        setSearchTerm('');
        fetchTracked();
    };

    // Filter anime list based on selected status
    const filteredList = Array.isArray(animeList)
        ? animeList.filter(anime => !anime.status || anime.status === filterStatus)
        : [];

    // Load tracked anime on component mount
    useEffect(() => {
        fetchTracked();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                        🎌 Anime Tracker
                    </h1>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                        Track your favorite anime and never miss an episode
                    </p>
                </div>

                {/* Search Section */}
                <div className="backdrop-blur-md rounded-2xl p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                        <div className="relative flex w-full md:w-auto">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Search for anime..."
                                className="px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-l-xl w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white text-lg placeholder-gray-400 transition-all duration-200"
                            />
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-r-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    '🔍 Search'
                                )}
                            </button>
                        </div>

                        {searchTerm && (
                            <button
                                onClick={handleClearSearch}
                                className="px-6 py-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                </div>

                {/* Status Filter */}
                <div className="flex justify-center mb-10">
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-xl p-3 border border-white/20">
                        <div className="flex flex-wrap gap-2 justify-center">
                            {STATUS_OPTIONS.map((status) => (
                                <button
                                    key={status.value}
                                    onClick={() => setFilterStatus(status.value)}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${filterStatus === status.value
                                        ? `${status.color} text-white shadow-lg`
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <span className="mr-2">{status.emoji}</span>
                                    {status.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-6 py-4 rounded-xl mb-6 text-center font-medium shadow-md">
                        ⚠️ {error}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                            Searching for anime...
                        </p>
                    </div>
                )}

                {/* Anime Grid */}
                {!loading && (
                    <>
                        {filteredList.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                                {filteredList.map((anime) => (
                                    <AnimeCard
                                        key={anime._id || anime.mal_id}
                                        anime={anime}
                                        trackedAnime={!!anime._id}
                                        onTrack={handleTrack}
                                        onUpdateProgress={handleUpdateProgress}
                                        onUpdateStatus={handleUpdateStatus}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        ) : (
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
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Home;