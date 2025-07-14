// models/models.js
const mongoose = require('mongoose');

const animeSchema = new mongoose.Schema({
  mal_id: Number,
  title: String,
  image: String,
  totalEpisodes: Number,
  watchedEpisodes: Number,
  airing: Boolean,
  nextEpisodeDate: String,
  userId: String,
  status: { type: String, default: 'watching' }, // 👈 important
});

module.exports = mongoose.model('Anime', animeSchema);
