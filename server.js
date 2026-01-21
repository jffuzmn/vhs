import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const MOVIES_PATH = path.join(__dirname, 'src', 'movies.json');
const COVERS_PATH = path.join(__dirname, 'public', 'movie-covers');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, COVERS_PATH);
  },
  filename: (req, file, cb) => {
    const id = randomUUID();
    const ext = path.extname(file.originalname) || '.webp';
    req.movieId = id;
    cb(null, `${id}${ext}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Add a new movie with optional image upload
app.post('/api/movies', upload.single('cover'), async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Movie name is required' });
    }

    const moviesData = await fs.readFile(MOVIES_PATH, 'utf-8');
    const movies = JSON.parse(moviesData);
    
    const newId = req.movieId || randomUUID();
    let img_url = null;
    
    if (req.file) {
      const ext = path.extname(req.file.filename);
      img_url = `/vhs/movie-covers/${newId}${ext}`;
    }
    
    const newMovie = {
      id: newId,
      name: name.trim(),
      img_url
    };
    
    movies.push(newMovie);
    
    await fs.writeFile(MOVIES_PATH, JSON.stringify(movies, null, 2));
    
    console.log(`✅ Added: "${newMovie.name}" (ID: ${newId})${img_url ? ' with cover' : ''}`);
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
