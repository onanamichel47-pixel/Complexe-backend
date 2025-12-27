// controllers/categorieAppartController.js
import db from '../models/index.js';
import cloudinary from '../config/cloudinary.js';
import isOnline from '../utils/isOnline.js';
import fs from 'fs';

const CategorieAppart = db.CategorieAppart;

export const createCategorieAppart = async (req, res) => {
  try {
    const { categorie, nombreApparts, description, statut, nombreDisponible } = req.body;
    if (!categorie || !nombreApparts || !description || !statut) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    let photoLocal = null;
    let photoCloud = null;
    if (req.file) {
      photoLocal = req.file.path.replace(/\\/g, '/');
      if (await isOnline()) {
        const result = await cloudinary.uploader.upload(photoLocal, { folder: 'categorie_apparts' });
        photoCloud = result.secure_url;
        try { fs.unlinkSync(photoLocal); photoLocal = null; } catch (e) {}
      }
    }

    const cat = await CategorieAppart.create({
      categorie, nombreApparts, description, statut,
      photoLocal, photoCloud,
      nombreDisponible: nombreDisponible ?? nombreApparts
    });

    return res.status(201).json({ success: true, categorie: cat });
  } catch (err) {
    console.error('createCategorieAppart error:', err);
    return res.status(500).json({ message: err.message });
  }
};

export const listCategorieAppart = async (req, res) => {
  try {
    const cats = await CategorieAppart.findAll({ order: [['createdAt', 'DESC']] });
    return res.json({ categories: cats });
  } catch (err) {
    console.error('listCategorieAppart error:', err);
    return res.status(500).json({ message: err.message });
  }
};

export const updateCategorieAppart = async (req, res) => {
  try {
    const { id } = req.params;
    const cat = await CategorieAppart.findByPk(id);
    if (!cat) return res.status(404).json({ message: 'Catégorie introuvable' });

    const { categorie, nombreApparts, description, statut, nombreDisponible } = req.body;

    if (typeof categorie !== 'undefined') cat.categorie = categorie;
    if (typeof nombreApparts !== 'undefined') cat.nombreApparts = nombreApparts;
    if (typeof description !== 'undefined') cat.description = description;
    if (typeof statut !== 'undefined') cat.statut = statut;
    if (typeof nombreDisponible !== 'undefined') cat.nombreDisponible = nombreDisponible;

    if (req.file) {
      // delete old cloud if exists
      if (cat.photoCloud) {
        try {
          const publicId = cat.photoCloud.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`categorie_apparts/${publicId}`);
        } catch (e) {}
      }
      let local = req.file.path.replace(/\\/g, '/');
      let cloud = null;
      if (await isOnline()) {
        const result = await cloudinary.uploader.upload(local, { folder: 'categorie_apparts' });
        cloud = result.secure_url;
        try { fs.unlinkSync(local); } catch (e) {}
        local = null;
      }
      cat.photoLocal = local;
      cat.photoCloud = cloud;
    }

    await cat.save();
    return res.json({ success: true, categorie: cat });
  } catch (err) {
    console.error('updateCategorieAppart error:', err);
    return res.status(500).json({ message: err.message });
  }
};

export const deleteCategorieAppart = async (req, res) => {
  try {
    const { id } = req.params;
    const cat = await CategorieAppart.findByPk(id);
    if (!cat) return res.status(404).json({ message: 'Catégorie introuvable' });

    if (cat.photoLocal) {
      try { fs.unlinkSync(cat.photoLocal); } catch (e) {}
    }
    if (cat.photoCloud) {
      try {
        const publicId = cat.photoCloud.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`categorie_apparts/${publicId}`);
      } catch (e) {}
    }

    await cat.destroy();
    return res.json({ success: true });
  } catch (err) {
    console.error('deleteCategorieAppart error:', err);
    return res.status(500).json({ message: err.message });
  }
};
