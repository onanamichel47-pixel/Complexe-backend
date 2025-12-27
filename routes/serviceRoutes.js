import express from 'express';
import { createService, listServices, updateService, deleteService } from '../controllers/serviceController.js';
import { auth, superAdminOnly } from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

// GET /api/service (public pour client vitrine)
router.get('/', listServices);

// POST /api/service (protected)
router.post('/', auth, superAdminOnly, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'logo', maxCount: 1 }]), createService);

// PUT /api/service/:id (protected)
router.put('/:id', auth, superAdminOnly, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'logo', maxCount: 1 }]), updateService);

// DELETE /api/service/:id (protected)
router.delete('/:id', auth, superAdminOnly, deleteService);

export default router;