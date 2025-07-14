const express = require('express');
const axios = require('axios');
const cors = require('cors');
const Anime = require('./models/models');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const weekday = require('dayjs/plugin/weekday');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekday);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const app = express();
const PORT = 5000;

require('dotenv').config();
const mongoose = require('mongoose');

app.use(cors({
  origin: '*', // or add mobile IP/domain if needed
}));

app.use(express.json());
async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await axios.get(url);
      return res;
    } catch (err) {
      if (err.response?.status === 429 && attempt < retries) {
        console.warn(`Rate limited (429) on ${url}. Retrying in ${delay}ms... (Attempt ${attempt})`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw err; // Fail if not 429 or out of retries
      }
    }
  }
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Search anime
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  try {
    const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${query}&limit=10`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from Jikan API' });
  }
});

// Get enriched anime data
app.get('/api/anime/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [detailsRes, picturesRes] = await Promise.all([
      fetchWithRetry(`https://api.jikan.moe/v4/anime/${id}/full`, 3, 1000),
      fetchWithRetry(`https://api.jikan.moe/v4/anime/${id}/pictures`, 3, 1000),
    ]);


    const anime = detailsRes.data.data;
    const pictures = picturesRes.data.data || [];

    const startDate = anime.aired?.from;
    const airingDay = anime.broadcast?.day;
    let calculatedEpisodes = 0;
    let nextEpisodeDate = null;

    if (startDate && airingDay) {
      const start = dayjs(startDate);
      const today = dayjs();

      const dayMap = {
        Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
        Thursday: 4, Friday: 5, Saturday: 6,
      };

      const normalizedDay = airingDay?.trim().toLowerCase().replace(/s$/, '');
      const capitalizedDay = normalizedDay.charAt(0).toUpperCase() + normalizedDay.slice(1);
      const targetDay = dayMap[capitalizedDay];

      if (targetDay !== undefined) {
        let firstAir = start.day(targetDay);
        if (firstAir.isBefore(start)) firstAir = firstAir.add(1, 'week');

        const weeksElapsed = Math.floor(today.diff(firstAir, 'week', true)) + 1;
        calculatedEpisodes = Math.max(0, weeksElapsed);

        const lastEpisodeDate = firstAir.add(calculatedEpisodes - 1, 'week');
        const nextDate = lastEpisodeDate.add(1, 'week');

        if (nextDate.isSameOrAfter(today)) {
          nextEpisodeDate = nextDate.toISOString();
        }
      }
    }

    const imageUrl = pictures.length > 0
      ? pictures[0].jpg.large_image_url
      : anime.images?.jpg?.large_image_url;

    res.json({
      mal_id: anime.mal_id,
      title: anime.title,
      airing: anime.airing,
      totalEpisodes: anime.airing ? calculatedEpisodes : anime.episodes || 0,
      nextEpisodeDate: anime.airing ? nextEpisodeDate : anime.broadcast?.next_aired || null,
      picture: imageUrl,
    });
  } catch (error) {
    console.error('Error fetching enriched anime data:', error.message);
    console.status(500).json({ error: 'Failed to fetch enriched anime data' });
  }
});

// Track new anime
app.post('/api/track', async (req, res) => {
  try {
    const { userId, ...animeData } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    const anime = await Anime.create({ ...animeData, userId });

    res.json(anime);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not track anime' });
  }
});

// Update watched episodes
app.put('/api/update-progress/:id', async (req, res) => {
  const { id } = req.params;
  const { watchedEpisodes } = req.body;

  try {
    const updated = await Anime.findByIdAndUpdate(
      id,
      { watchedEpisodes },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Get all tracked anime
app.get('/api/tracked', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    const tracked = await Anime.find({ userId });
    res.json(tracked);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch tracked anime' });
  }
});

// Update status
app.put('/api/update-status/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await Anime.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Delete
app.delete('/api/delete/:id', async (req, res) => {
  try {
    await Anime.findByIdAndDelete(req.params.id);
    res.json({ message: 'Anime untracked successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// Root route
app.get('/api', (req, res) => {
  res.send("WORKS");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
