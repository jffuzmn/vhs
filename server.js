import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const MOVIES_PATH = path.join(__dirname, 'src', 'movies.json');

// Add a new movie
app.post('/api/movies', async (req, res) => {
  try {
    const { name, img_url } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Movie name is required' });
    }

    const moviesData = await fs.readFile(MOVIES_PATH, 'utf-8');
    const movies = JSON.parse(moviesData);
    
    const newId = randomUUID();
    const newMovie = {
      id: newId,
      name: name.trim(),
      img_url: img_url || null
    };
    
    movies.push(newMovie);
    
    await fs.writeFile(MOVIES_PATH, JSON.stringify(movies, null, 2));
    
    console.log(`✅ Added: "${newMovie.name}" (ID: ${newId})`);
    res.status(201).json(newMovie);
  } catch (error) {
    console.error('Error adding movie:', error);
    res.status(500).json({ error: 'Failed to add movie' });
  }
});

// Get all movies
app.get('/api/movies', async (req, res) => {
  try {
    const moviesData = await fs.readFile(MOVIES_PATH, 'utf-8');
    const movies = JSON.parse(moviesData);
    res.json(movies);
  } catch (error) {
    console.error('Error reading movies:', error);
    res.status(500).json({ error: 'Failed to read movies' });
  }
});

app.listen(PORT, () => {
  console.log(`📼 VHS API server running at http://localhost:${PORT}`);
});
