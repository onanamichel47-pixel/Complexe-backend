// controllers/client/clientController.js

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const loginClient = async (req, res) => {
  try {
    const { nom, sexe } = req.body;
    if (!nom || !sexe || !['Homme', 'Femme'].includes(sexe)) {
      return res.status(400).json({ message: 'Nom et sexe (Homme ou Femme) requis' });
    }

    const payload = {
      nom,
      sexe,
      role: 'client',
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }); // Durée session longue
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};