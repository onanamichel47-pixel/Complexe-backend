import express from 'express';
import {
  createEmploye,
  listEmployes,
  updateEmploye,
  deleteEmploye
} from '../controllers/employeController.js';

const router = express.Router();

router.get('/', listEmployes);
router.post('/', createEmploye);
router.put('/:id', updateEmploye);
router.delete('/:id', deleteEmploye);

export default router;
