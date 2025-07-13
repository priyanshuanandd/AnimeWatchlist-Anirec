const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
// db
require('dotenv').config();
const mongoose = require('mongoose');

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

// Get anime by ID
app.get('/api/anime/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`https://api.jikan.moe/v4/anime/${id}/full`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch anime details' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
