// controllers/appartementController.js
import db from '../models/index.js';
import cloudinary from '../config/cloudinary.js';
import isOnline from '../utils/isOnline.js';
import fs from 'fs';

const Appartement = db.Appartement;
const CategorieAppart = db.CategorieAppart;
const AppartementPhoto = db.AppartementPhoto; // <= important

export const createAppartement = async (req, res) => {
  try {
    const { categorieId, nom, description, ordre, prixNuit, prixJournalier, disponible } = req.body;

    if (!categorieId || !nom || !description) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    const cat = await CategorieAppart.findByPk(categorieId);
    if (!cat) return res.status(400).json({ message: 'Categorie invalide' });

    let photoLocal = null;
    let photoCloud = null;

    // --- NOUVEAU : support multiples images ---
    if (req.files && req.files.length > 0) {
      const file = req.files[0]; // première image = image principale
      let local = file.path.replace(/\\/g, '/');

      if (await isOnline()) {
        const result = await cloudinary.uploader.upload(local, { folder: 'appartements' });
        photoCloud = result.secure_url;
        try { fs.unlinkSync(local); } catch (e) { }
        local = null;
      }

      photoLocal = local;
    }

    const app = await Appartement.create({
      categorieId,
      nom,
      description,
      ordre: ordre ?? 0,
      prixNuit: prixNuit ?? null,
      prixJournalier: prixJournalier ?? null,
      photoLocal,
      photoCloud,
      disponible: disponible === 'true' || disponible === true
    });

    return res.status(201).json({ success: true, appartement: app });
  } catch (err) {
    console.error('createAppartement error:', err);
    return res.status(500).json({ message: err.message });
  }
};


export const listAppartements = async (req, res) => {
  try {
    // optional filter by categorieId or availability
    const { categorieId, disponible } = req.query;
    const where = {};
    if (categorieId) where.categorieId = categorieId;
    if (typeof disponible !== 'undefined') where.disponible = disponible === 'true' || disponible === true;

    const apps = await Appartement.findAll({ where, order: [['ordre', 'ASC'], ['createdAt', 'DESC']] });
    return res.json({ appartements: apps });
  } catch (err) {
    console.error('listAppartements error:', err);
    return res.status(500).json({ message: err.message });
  }
};

export const updateAppartement = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await Appartement.findByPk(id);
    if (!app) return res.status(404).json({ message: 'Appartement introuvable' });

    const { categorieId, nom, description, ordre, prixNuit, prixJournalier, disponible } = req.body;

    if (categorieId) {
      const cat = await CategorieAppart.findByPk(categorieId);
      if (!cat) return res.status(400).json({ message: 'Categorie invalide' });
      app.categorieId = categorieId;
    }
    if (typeof nom !== 'undefined') app.nom = nom;
    if (typeof description !== 'undefined') app.description = description;
    if (typeof ordre !== 'undefined') app.ordre = ordre;
    if (typeof prixNuit !== 'undefined') app.prixNuit = prixNuit;
    if (typeof prixJournalier !== 'undefined') app.prixJournalier = prixJournalier;
    if (typeof disponible !== 'undefined') app.disponible = disponible === 'true' || disponible === true;

    if (req.file) {
      if (app.photoCloud) {
        try {
          const publicId = app.photoCloud.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`appartements/${publicId}`);
        } catch (e) {}
      }
      let local = req.file.path.replace(/\\/g, '/');
      let cloud = null;
      if (await isOnline()) {
        const result = await cloudinary.uploader.upload(local, { folder: 'appartements' });
        cloud = result.secure_url;
        try { fs.unlinkSync(local); } catch (e) {}
        local = null;
      }
      app.photoLocal = local;
      app.photoCloud = cloud;
    }

    await app.save();
    return res.json({ success: true, appartement: app });
  } catch (err) {
    console.error('updateAppartement error:', err);
    return res.status(500).json({ message: err.message });
  }
};

export const deleteAppartement = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await Appartement.findByPk(id);
    if (!app) return res.status(404).json({ message: 'Appartement introuvable' });

    if (app.photoLocal) { try { fs.unlinkSync(app.photoLocal);} catch(e){} }
    if (app.photoCloud) {
      try { const publicId = app.photoCloud.split('/').pop().split('.')[0]; await cloudinary.uploader.destroy(`appartements/${publicId}`); } catch(e) {}
    }

    await app.destroy();
    return res.json({ success: true });
  } catch (err) {
    console.error('deleteAppartement error:', err);
    return res.status(500).json({ message: err.message });
  }
};



export const addPhotosAppartement = async (req, res) => {
  try {
    const { categorieId, nom, appartementId } = req.body;

    if (!categorieId || (!nom && !appartementId)) {
      return res
        .status(400)
        .json({ message: "categorieId et nom ou appartementId requis" });
    }

    let app;

    if (appartementId) {
      app = await Appartement.findByPk(appartementId);
    } else {
      app = await Appartement.findOne({ where: { categorieId, nom } });
    }

    if (!app) {
      return res.status(404).json({ message: "Appartement introuvable" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Aucune image envoyée" });
    }

    const createdPhotos = [];

    for (const file of req.files) {
      let local = file.path.replace(/\\/g, "/");
      let cloud = null;

      if (await isOnline()) {
        const result = await cloudinary.uploader.upload(local, {
          folder: "appartements",
        });
        cloud = result.secure_url;

        try {
          fs.unlinkSync(local);
        } catch (e) {}
        local = null;
      }

      const photo = await AppartementPhoto.create({
        appartementId: app.id,
        urlLocal: local,
        urlCloud: cloud,
      });

      createdPhotos.push(photo);
    }

    return res.json({
      success: true,
      message: "Photos ajoutées",
      appartementId: app.id,
      photos: createdPhotos,
    });
  } catch (err) {
    console.error("addPhotosAppartement error:", err);
    return res.status(500).json({ message: err.message });
  }
};