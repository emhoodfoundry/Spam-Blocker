import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const distPath = path.resolve(__dirname, 'dist');

// Serve static files from the Vite build output
app.use(express.static(distPath));

// Health check
app.get('/healthz', (_req, res) => {
  res.status(200).send('OK');
});

// Fallback to index.html for client-side routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
