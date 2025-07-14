import React, { useState, useEffect } from 'react';
import AnimeCard from '../components/AnimeCard';
import axios from 'axios';

const Home = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [animeList, setAnimeList] = useState([]);
    const [filterStatus, setFilterStatus] = useState('watching'); // watching | completed | dropped
    const [loading, setLoading] = useState(false);

    const fetchTracked = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/tracked');
            console.log(res);
            setAnimeList(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error fetching tracked anime:', err);
            setAnimeList([]); // fallback in case of failure
        }
    };


    useEffect(() => {
        fetchTracked();
    }, []);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        setLoading(true);

        try {
            const res = await axios.get(`http://localhost:5000/api/search?q=${searchTerm}`);
            const baseResults = res.data.data;

            const enrichedResults = await Promise.all(
                baseResults.map(async (anime) => {
                    try {
                        const full = await axios.get(`http://localhost:5000/api/anime/${anime.mal_id}`);
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

            setAnimeList(enrichedResults);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTrack = async (anime) => {
        const fullData = await axios.get(`http://localhost:5000/api/anime/${anime.mal_id}`);
        const data = fullData.data;

        const payload = {
            mal_id: data.mal_id,
            title: data.title,
            image: data.picture,
            totalEpisodes: data.totalEpisodes || 0,
            watchedEpisodes: 0,
            airing: data.airing,
            nextEpisodeDate: data.nextEpisodeDate,
        };

        await axios.post('http://localhost:5000/api/track', payload);
        fetchTracked(); // refresh
    };

    const handleUpdateProgress = async (animeId, newCount) => {
        await axios.put(`http://localhost:5000/api/update-progress/${animeId}`, {
            watchedEpisodes: newCount,
        });
        fetchTracked();
    };

    const handleUpdateStatus = async (animeId, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/update-status/${animeId}`, {
                status: newStatus,
            });
            fetchTracked(); // ✅ refresh list after update
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };


    const handleDelete = async (animeId) => {
        await axios.delete(`http://localhost:5000/api/delete/${animeId}`);
        fetchTracked();
    };
    const filteredList = Array.isArray(animeList)
        ? animeList.filter(anime => !anime.status || anime.status === filterStatus)
        : [];
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white" href="/">Anime Tracker</h1>

            <div className="flex justify-center mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search anime..."
                    className="px-4 py-2 border border-gray-300 rounded-l w-[300px]"
                />
                <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700"
                >
                    Search
                </button>
            </div>

            <div className="flex justify-center mb-6 gap-4">
                {['watching', 'completed', 'dropped'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded font-medium ${filterStatus === status
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-300 text-gray-800'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <p className="text-center text-gray-600 dark:text-gray-300">Loading...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
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
            )}
        </div>
    );
};

export default Home;
