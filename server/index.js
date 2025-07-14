const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const animeRoutes = require('./routes/animeRoutes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Connect to DB
connectDB();

// Routes
app.use('/api', animeRoutes);

// Root route
app.get('/', (req, res) => res.send("WORKS"));

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
