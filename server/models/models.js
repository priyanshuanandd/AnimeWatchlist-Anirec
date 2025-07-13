const mongoose = require('mongoose');

const AnimeSchema = new mongoose.Schema({
  userId: String, // for multi-user support
  mal_id: Number,
  title: String,
  image: String,
  totalEpisodes: Number,
  watchedEpisodes: Number,
  airing: Boolean,
  nextEpisodeDate: String,
});

module.exports = mongoose.model('Anime', AnimeSchema);
