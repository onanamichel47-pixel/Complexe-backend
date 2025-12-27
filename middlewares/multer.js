// middlewares/multer.js  (modifie les limites et le fileFilter)
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Allow images and videos, increase limit to 50MB
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedImage = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const allowedVideo = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
    if (allowedImage.includes(file.mimetype) || allowedVideo.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images et vidéos (mp4, mov, avi, mkv) sont autorisées'));
    }
  },
});

export default upload;
