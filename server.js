const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');


const app = express();
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse incoming JSON requests
app.use('/uploads', express.static('uploads'));



const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'flags',
  password: '092003',
  port: 3000
});

// Set up storage for uploaded images using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this directory exists in your project
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique filenames
  }
});


const upload = multer({ storage });

// API route to handle form submissions
app.post('/api/submit', upload.array('images', 10), async (req, res) => {
  const { name, handle } = req.body;
  const images = req.files.map(file => file.filename);

  try {
    const result = await pool.query(
      'INSERT INTO submissions (name, handle, images) VALUES ($1, $2, $3) RETURNING *',
      [name, handle, images]
    );
    
    const user = result.rows[0];
    res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error saving submission' });
  }
});


// API route to fetch all user submissions
app.get('/api/submissions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM submissions');
    const users = result.rows;

    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching user submissions' });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
