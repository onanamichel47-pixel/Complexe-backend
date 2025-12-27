// controllers/notificationController.js ✅ COMPLÈT AVEC getNotificationCount
import db from '../models/index.js';
const Notification = db.Notification;
const Op = db.Sequelize.Op; 

function defaultExpiration() {
  const d = new Date();
  d.setMonth(d.getMonth() + 4);
  return d;
}

export const createNotification = async (req, res) => {
  try {
    const { message, type = 'nouveaute', expiration } = req.body;
    if (!message || !type) return res.status(400).json({ message: 'message et type requis' });

    const exp = expiration ? new Date(expiration) : defaultExpiration();

    const notif = await Notification.create({
      message,
      type,
      expiration: exp,
    });

    // ✅ ÉMETTRE À TOUS LES CLIENTS
    req.io?.emit('new-notification', {
      id: notif.id,
      message: notif.message,
      type: notif.type,
      createdAt: notif.createdAt
    });

    return res.status(201).json({ success: true, notification: notif });
  } catch (err) {
    console.error('createNotification error', err);
    return res.status(500).json({ message: err.message });
  }
};

export const listNotifications = async (req, res) => {
  try {
    const { showExpired = 'false', limit = 200, offset = 0 } = req.query;
    const where = {};
    if (showExpired !== 'true') {
      where.expiration = { [Op.gte]: new Date() };
    }
    const notifs = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
    return res.json({ notifications: notifs });
  } catch (err) {
    console.error('listNotifications error', err);
    return res.status(500).json({ message: err.message });
  }
};

export const getNotification = async (req, res) => {
  try {
    const n = await Notification.findByPk(req.params.id);
    if (!n) return res.status(404).json({ message: 'Notification introuvable' });
    return res.json({ notification: n });
  } catch (err) {
    console.error('getNotification error', err);
    return res.status(500).json({ message: err.message });
  }
};

export const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findByPk(id);
    if (!notif) return res.status(404).json({ message: 'Notification introuvable' });

    const { message, type, expiration } = req.body;
    if (typeof message !== 'undefined') notif.message = message;
    if (typeof type !== 'undefined') notif.type = type;
    if (typeof expiration !== 'undefined') notif.expiration = expiration ? new Date(expiration) : null;

    await notif.save();
    return res.json({ success: true, notification: notif });
  } catch (err) {
    console.error('updateNotification error', err);
    return res.status(500).json({ message: err.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findByPk(id);
    if (!notif) return res.status(404).json({ message: 'Notification introuvable' });
    await notif.destroy();
    return res.json({ success: true });
  } catch (err) {
    console.error('deleteNotification error', err);
    return res.status(500).json({ message: err.message });
  }
};

export const purgeExpiredNotifications = async (req, res) => {
  try {
    const deleted = await Notification.destroy({
      where: {
        expiration: { [Op.lt]: new Date() },
      },
    });
    return res.json({ success: true, deleted });
  } catch (err) {
    console.error('purgeExpiredNotifications error', err);
    return res.status(500).json({ message: err.message });
  }
};

// ✅ NOUVEAU : Compteur notifications NON EXPIRÉES (pour badge client)
export const getNotificationCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: {
        expiration: { [Op.gt]: new Date() } // Non expirées
      }
    });
    res.json({ count });
  } catch (err) {
    console.error('getNotificationCount error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ CLIENT ROUTES (remplace countClientNotifications)
export const countClientNotifications = async (req, res) => {
  try {
    const now = new Date();
    const count = await Notification.count({
      where: {
        expiration: { [Op.gte]: now }
      }
    });
    return res.json({ count });
  } catch (err) {
    console.error('countClientNotifications error', err);
    return res.status(500).json({ message: err.message });
  }
};

export const listClientNotifications = async (req, res) => {
  try {
    const now = new Date();
    const notifs = await Notification.findAll({
      where: {
        expiration: { [Op.gte]: now }
      },
      order: [['createdAt', 'DESC']],
    });
    return res.json({ notifications: notifs });
  } catch (err) {
    console.error('listClientNotifications error', err);
    return res.status(500).json({ message: err.message });
  }
};
