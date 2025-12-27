import db from "../models/index.js";
import bcrypt from "bcryptjs";

const Employe = db.Employe;

export const listEmployes = async (req, res) => {
  try {
    const employes = await Employe.findAll({ order: [["createdAt", "DESC"]] });
    return res.json({ employes });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createEmploye = async (req, res) => {
  try {
    const { nom, email, telephone, motDePasse } = req.body;

    if (!nom || !email || !motDePasse)
      return res.status(400).json({ message: "Champs obligatoires manquants." });

    const exist = await Employe.findOne({ where: { email } });
    if (exist)
      return res.status(400).json({ message: "Cet email existe déjà." });

    const hashed = await bcrypt.hash(motDePasse, 10);

    const emp = await Employe.create({
      nom,
      email,
      telephone,
      motDePasse: hashed,
    });

    return res.status(201).json({ employe: emp });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateEmploye = async (req, res) => {
  try {
    const { id } = req.params;
    const emp = await Employe.findByPk(id);
    if (!emp) return res.status(404).json({ message: "Employé introuvable" });

    const { nom, email, telephone, motDePasse } = req.body;

    if (nom) emp.nom = nom;
    if (email) emp.email = email;
    if (telephone) emp.telephone = telephone;
    if (motDePasse) emp.motDePasse = await bcrypt.hash(motDePasse, 10);

    await emp.save();
    return res.json({ employe: emp });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteEmploye = async (req, res) => {
  try {
    const { id } = req.params;
    const emp = await Employe.findByPk(id);
    if (!emp) return res.status(404).json({ message: "Employé introuvable" });

    await emp.destroy();
    return res.json({ success: true });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
