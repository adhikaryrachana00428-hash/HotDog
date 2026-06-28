/**
 * BuildDNA Express API server.
 * Exposes analysis endpoints consumed by the frontend and React hook.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeRouter } from './routes/analyze.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '3001', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const app = express();

app.use(cors({ origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(',') }));
app.use(express.json({ limit: '2mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    services: {
      anakin: Boolean(process.env.ANAKIN_API_KEY),
      wire: Boolean(process.env.WIRE_API_KEY && process.env.WIRE_ACTION_ID),
      heuristicFallback: process.env.USE_HEURISTIC_FALLBACK === 'true',
    },
  });
});

app.use('/api', analyzeRouter);

// Serve static frontend files from project root
const staticRoot = path.resolve(__dirname, '..');
app.use(express.static(staticRoot));

// SPA fallback for HTML pages
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const htmlPath = path.join(staticRoot, req.path.endsWith('.html') ? req.path : `${req.path}.html`);
  res.sendFile(htmlPath, err => {
    if (err) res.sendFile(path.join(staticRoot, 'index.html'));
  });
});

if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`[HotDog] Server running at http://localhost:${PORT}`);
    console.log(`[HotDog] Anakin API: ${process.env.ANAKIN_API_KEY ? 'configured' : 'not configured'}`);
    console.log(`[HotDog] Wire API: ${process.env.WIRE_API_KEY && process.env.WIRE_ACTION_ID ? 'configured' : 'not configured'}`);
    console.log(`[HotDog] Heuristic fallback: ${process.env.USE_HEURISTIC_FALLBACK === 'true' ? 'enabled' : 'disabled'}`);
  });

  // Handle server errors gracefully
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`\n❌ Error: Port ${PORT} is already in use.`);
      console.error(`\nTo fix this, you can:`);
      console.error(`1. Kill the process using port ${PORT}:`);
      console.error(`   lsof -ti:${PORT} | xargs kill -9`);
      console.error(`2. Or use a different port by setting PORT environment variable:`);
      console.error(`   PORT=3002 npm run dev\n`);
      process.exit(1);
    } else {
      console.error(`\n❌ Server error: ${error.message}`);
      process.exit(1);
    }
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error(`\n❌ Unhandled Rejection at:`, promise, `reason:`, reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(`\n❌ Uncaught Exception:`, error);
  process.exit(1);
});

export default app;
