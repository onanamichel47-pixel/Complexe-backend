// routes/client/clientRoutes.js

import express from 'express';
import { loginClient } from '../../controllers/client/clientController.js';

const router = express.Router();

router.post('/login', loginClient);

// Futures routes (ex: /commandes, etc.)

export default router;