const mongoose = require('mongoose');

const AnimeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  mal_id: { type: Number, required: true },
  title: String,
  airing: Boolean,
  totalEpisodes: Number,
  nextEpisodeDate: String,
  picture: String,
  watchedEpisodes: { type: Number, default: 0 },
  status: { type: String, enum: ['Watching', 'Completed', 'Dropped'], default: 'Watching' }
});

module.exports = mongoose.model('Anime', AnimeSchema);
