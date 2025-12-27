import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const registerSuper = async (req, res) => {
  const { nom, prenom, email, motDePasse, sexe } = req.body;

  const existing = await db.SuperAdmin.findOne({ where: { email } });
  if (existing) return res.status(400).json({ message: 'Super admin déjà existant' });

  const hashed = await bcrypt.hash(motDePasse, 10);

  const superAdmin = await db.SuperAdmin.create({ nom, prenom, email, motDePasse: hashed, sexe });

  res.status(201).json({ message: 'Super admin créé', superAdmin });
};

const login = async (req, res) => {
  const { email, motDePasse } = req.body;
  let user = null;
  let role = '';

  // 1. Essayer de trouver un Super Admin
  user = await db.SuperAdmin.findOne({ where: { email } });
  if (user) {
    role = 'superadmin';
  } else {
    // 2. Sinon, essayer de trouver un Admin Secondaire
    user = await db.AdminSecondaire.findOne({ where: { email } });
    if (user) {
      if (user.statut === 'suspendu') {
        return res.status(403).json({ message: 'Compte suspendu. Contactez le Super Admin.' });
      }
      role = 'admin_secondaire';
    }
  }

  if (!user) return res.status(400).json({ message: 'Utilisateur non trouvé' });

  // 3. Vérifier mot de passe
  const match = await bcrypt.compare(motDePasse, user.motDePasse);
  if (!match) return res.status(400).json({ message: 'Mot de passe incorrect' });

  // 4. Mettre à jour lastLogin
  user.lastLogin = new Date();
  await user.save();

  // 5. Créer le Payload du Token
  const payload = {
    id: user.id,
    role: role,
    nom: user.nom,
    // Pour l'admin secondaire, on inclut ses droits spécifiques
    privileges: role === 'admin_secondaire' ? user.privileges : ['ALL'],
    sections: role === 'admin_secondaire' ? user.sections : ['ALL']
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
  
  // On renvoie aussi les infos utilisateur pour le frontend
  res.json({ token, user: payload });
};

export { registerSuper, login };