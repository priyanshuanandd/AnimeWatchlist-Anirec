import React, { useState, useEffect } from 'react';
import AnimeCard from '../components/AnimeCard';
import axios from 'axios';

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

    // Status options for filtering
    const STATUS_OPTIONS = ['watching', 'completed', 'dropped'];

    /**
     * Fetch tracked anime from the API
     */
    const fetchTracked = async () => {
        try {
            setError(null);
            const response = await axios.get(`${API_URL}/api/tracked`);
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
                baseResults.map(async (anime) => {
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
            };

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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
            {/* Header */}
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
                    🎌 Anime Tracker
                </h1>

                {/* Search Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                        <div className="flex w-full sm:w-auto">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Search anime..."
                                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-l-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="px-6 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium"
                            >
                                {loading ? '⏳' : '🔍'}
                            </button>
                        </div>
                        
                        {searchTerm && (
                            <button
                                onClick={handleClearSearch}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Status Filter */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 flex gap-2">
                        {STATUS_OPTIONS.map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                    filterStatus === status
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded-lg mb-4 sm:mb-6 text-center text-sm sm:text-base mx-2 sm:mx-0">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-8 sm:py-12">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">Loading anime...</p>
                    </div>
                )}

                {/* Anime Grid */}
                {!loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 px-2 sm:px-0">
                        {filteredList.length > 0 ? (
                            filteredList.map((anime) => (
                                <AnimeCard
                                    key={anime._id || anime.mal_id}
                                    anime={anime}
                                    trackedAnime={!!anime._id}
                                    onTrack={handleTrack}
                                    onUpdateProgress={handleUpdateProgress}
                                    onUpdateStatus={handleUpdateStatus}
                                    onDelete={handleDelete}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-8 sm:py-12 px-4">
                                <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
                                    {searchTerm 
                                        ? 'No anime found. Try a different search term.' 
                                        : 'No anime in your list yet. Start by searching for anime to track!'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;