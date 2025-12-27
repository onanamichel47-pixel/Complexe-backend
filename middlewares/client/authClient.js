import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authClient = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Token manquant' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token manquant' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'client') return res.status(403).json({ message: 'Accès refusé : rôle client requis.' });

    req.user = decoded; // stockage des infos utilisateur décodées
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};
