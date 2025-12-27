// routes/notificationRoutes.js ✅ SIMPLIFIÉ
import express from 'express';
import { auth, checkPrivilege } from '../middlewares/auth.js'; 
import {
  createNotification,
  listNotifications,
  getNotification,
  updateNotification,
  deleteNotification,
  purgeExpiredNotifications,
  getNotificationCount,  // ✅ NOUVEAU pour /count
  countClientNotifications, 
  listClientNotifications 
} from '../controllers/notificationController.js';

const router = express.Router();
const SECTION_KEY = 'notification';

// ✅ ROUTES CLIENT PUBLIQUES (SANS AUTH)
router.get('/count', getNotificationCount);        // ← POUR BADGE CLIENT
router.get('/client', listClientNotifications);    // ← Liste client

// 🔐 ADMIN CRUD (PROTÉGÉ)
router.post('/', auth, checkPrivilege('WRITE', SECTION_KEY), createNotification);
router.get('/', auth, checkPrivilege('READ', SECTION_KEY), listNotifications);
router.get('/:id', auth, checkPrivilege('READ', SECTION_KEY), getNotification);
router.put('/:id', auth, checkPrivilege('UPDATE', SECTION_KEY), updateNotification);
router.delete('/:id', auth, checkPrivilege('DELETE', SECTION_KEY), deleteNotification);
router.post('/purge-expired', auth, checkPrivilege('DELETE', SECTION_KEY), purgeExpiredNotifications);

export default router;
