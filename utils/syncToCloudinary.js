import fs from 'fs';
import cloudinary from '../config/cloudinary.js';
import isOnline from './isOnline.js';
import db from '../models/index.js';

const syncPendingUploads = async () => {
  const online = await isOnline();
  if (!online) return;

  // Similaire pour ImgVitrine (seul, car Vitrine logo supprimé)
  const imgs = await db.ImgVitrine.findAll({ where: { urlCloud: null, urlLocal: { [db.Sequelize.Op.ne]: null } } });
  for (const img of imgs) {
    const result = await cloudinary.uploader.upload(img.urlLocal, { resource_type: img.type === 'video' ? 'video' : 'image' });
    img.urlCloud = result.secure_url;
    fs.unlinkSync(img.urlLocal);
    img.urlLocal = null;
    await img.save();
  }
};

export default syncPendingUploads;