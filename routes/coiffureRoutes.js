import express from 'express';
import upload from '../middlewares/multer.js';
import { auth, superAdminOnly } from '../middlewares/auth.js';
import {
  listCoiffures,
  createCoiffure,
  updateCoiffure,
  deleteCoiffure
} from '../controllers/coiffureController.js';

const router = express.Router();

// GET all
router.get('/', auth, superAdminOnly, listCoiffures);

// CREATE
router.post(
  '/',
  auth,
  superAdminOnly,
  upload.single('photo'),
  createCoiffure
);

// UPDATE
router.put(
  '/:id',
  auth,
  superAdminOnly,
  upload.single('photo'),
  updateCoiffure
);

// DELETE
router.delete('/:id', auth, superAdminOnly, deleteCoiffure);

export default router;
