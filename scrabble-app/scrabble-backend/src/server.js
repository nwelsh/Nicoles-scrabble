const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// load dictionary
const words = fs.readFileSync('./src/dictionary.txt', 'utf-8')
  .split('\n')
  .map(w => w.trim().toLowerCase());

const wordSet = new Set(words);

// route
app.get('/validate', (req, res) => {
  const { word } = req.query;

  const isValid = wordSet.has(String(word).toLowerCase());

  res.json({ valid: isValid });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});