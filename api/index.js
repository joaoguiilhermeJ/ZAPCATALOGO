/**
 * ZapCatálogo — Entry-point Serverless para Vercel
 * A Vercel encaminha /api/* para este handler.
 * O Express precisa tratar o path relativo (sem /api) porque
 * a Vercel já removeu o prefixo /api ao rotear para cá.
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../src/config/index.js';
import apiRoutes from '../src/routes/index.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Middlewares globais ──
app.use(cors({ origin: config.cors.origin }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Arquivos estáticos (Frontend) ──
app.use(express.static(path.resolve(__dirname, '..', 'public')));

// ── API REST — monta em /api porque a Vercel passa o path completo ──
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

export default app;
