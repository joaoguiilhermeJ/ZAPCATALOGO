/**
 * Configuração do Multer para upload de planilhas
 */

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import config from '../config/index.js';
import { AppError } from './errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Garantir que pasta de uploads exista
const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedMimes = config.upload.allowedTypes.filter(t => t.startsWith('application'));
  const allowedExts = config.upload.allowedTypes.filter(t => t.startsWith('.'));
  const ext = path.extname(file.originalname).toLowerCase();
  const isValid = allowedMimes.includes(file.mimetype) || allowedExts.includes(ext);

  if (isValid) {
    cb(null, true);
  } else {
    cb(new AppError('Formato não permitido. Use arquivos .xlsx ou .xls'), 400);
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxSize },
});
