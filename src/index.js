/**
 * ZapCatálogo — Servidor Express
 * Ponto de entrada da aplicação
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/index.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Middlewares globais ──
app.use(cors({ origin: config.cors.origin }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Arquivos estáticos (Frontend) ──
app.use(express.static(path.resolve(__dirname, '..', 'public')));

// ── API REST ──
app.use('/api', apiRoutes);

// ── Health Check ──
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ── Fallback SPA ──
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'));
});

// ── Tratamento global de erros ──
app.use(errorHandler);

// ── Inicialização ──
app.listen(config.port, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║           ZapCatálogo  API                ║
  ╠═══════════════════════════════════════════╣
  ║  🚀  http://localhost:${String(config.port).padEnd(30)}║
  ║  📁  Modo: ${config.env.padEnd(35)}║
  ╚═══════════════════════════════════════════╝
  `);
});
