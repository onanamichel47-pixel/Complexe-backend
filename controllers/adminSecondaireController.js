import db from '../models/index.js';
import bcrypt from 'bcryptjs';

const AdminSecondaire = db.AdminSecondaire;

// 1. LISTER les admins secondaires
export const listAdmins = async (req, res) => {
  try {
    const admins = await AdminSecondaire.findAll({
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['motDePasse'] } // On ne renvoie pas le hash
    });
    return res.json({ admins });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// 2. CRÉER un admin secondaire
export const createAdmin = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, sexe, privileges, sections } = req.body;

    if (!nom || !email || !motDePasse || !sexe) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    const exist = await AdminSecondaire.findOne({ where: { email } });
    if (exist) return res.status(400).json({ message: "Cet email est déjà utilisé" });

    const hashed = await bcrypt.hash(motDePasse, 10);
    
    // privileges doit être un tableau ex: ["READ", "WRITE"]
    const newAdmin = await AdminSecondaire.create({
      nom,
      prenom,
      email,
      motDePasse: hashed,
      sexe,
      privileges: privileges || [],
  sections: sections || [], // Enregistrement des sections
  statut: 'actif'
    });

    return res.status(201).json({ success: true, admin: newAdmin });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// 3. MODIFIER (Privilèges, Statut, Infos, Reset password)
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await AdminSecondaire.findByPk(id);
    if (!admin) return res.status(404).json({ message: "Admin introuvable" });

    const { nom, prenom, email, motDePasse, sexe, privileges, sections,statut } = req.body;

    if (nom) admin.nom = nom;
    if (prenom) admin.prenom = prenom;
    if (email) admin.email = email;
    if (sexe) admin.sexe = sexe;
    if (privileges) admin.privileges = privileges; // Sequelize gère le JSON
    if (sections) admin.sections = sections; // Mise à jour
    if (statut) admin.statut = statut;

    // Si on modifie le mot de passe
    if (motDePasse && motDePasse.trim() !== "") {
      admin.motDePasse = await bcrypt.hash(motDePasse, 10);
    }

    await admin.save();
    return res.json({ success: true, admin });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// 4. SUPPRIMER
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await AdminSecondaire.findByPk(id);
    if (!admin) return res.status(404).json({ message: "Admin introuvable" });

    await admin.destroy();
    return res.json({ success: true, message: "Admin supprimé" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};