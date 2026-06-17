/**
 * Agregador de rotas da API
 */

import { Router } from 'express';
import uploadRoutes from './uploadRoutes.js';

const router = Router();

router.use(uploadRoutes);

export default router;
