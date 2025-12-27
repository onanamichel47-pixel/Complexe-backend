// routes/menuRoutes.js
import express from 'express';
import { auth, superAdminOnly } from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import {
  createMenu,
  listMenu,      // liste complète pour admin
  updateMenu,
  deleteMenu,
  getMenus,      // déjà présent dans ton controller: menus disponibles pour client
} from '../controllers/menuController.js';

const router = express.Router();

/**
 * ROUTE PUBLIQUE CLIENT
 * -> utilisée par la page RESTAURATION côté client
 * -> ne nécessite PAS de token super admin
 * -> renvoie uniquement les menus disponibles (géré dans getMenus)
 */
router.get('/menu-client', getMenus);

/**
 * ROUTES ADMIN SUPER ADMIN UNIQUEMENT
 */
router.post('/menu', auth, superAdminOnly, upload.single('photo'), createMenu);
router.get('/menu', auth, superAdminOnly, listMenu);
router.put('/menu/:id', auth, superAdminOnly, upload.single('photo'), updateMenu);
router.delete('/menu/:id', auth, superAdminOnly, deleteMenu);

export default router;
