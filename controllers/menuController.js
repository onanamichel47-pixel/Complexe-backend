// controllers/menuController.js
import db from '../models/index.js';
import cloudinary from '../config/cloudinary.js';
import isOnline from '../utils/isOnline.js';
import fs from 'fs';

const Menu = db.Menu;

/**
 * POST /api/menu
 * body: type, nom, categorie, description, caracteristiques, prixUnitaire
 * file: photo (optionnel)
 */
export const createMenu = async (req, res) => {
  try {
    const {
      type,
      nom,
      categorie,
      description,
      caracteristiques,
      prixUnitaire
    } = req.body;

    if (!type || !nom || !categorie || !prixUnitaire) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    let photoLocal = null;
    let photoCloud = null;

    if (req.file) {
      // normalize windows path
      photoLocal = req.file.path.replace(/\\/g, '/');
      const online = await isOnline();

      if (online) {
        const result = await cloudinary.uploader.upload(photoLocal, { resource_type: 'image' });
        photoCloud = result.secure_url;
        try { fs.unlinkSync(photoLocal); photoLocal = null; } catch (e) { /* ignore */ }
      }
    }

    const menu = await Menu.create({
      type,
      nom,
      categorie,
      description: description || null,
      caracteristiques: caracteristiques || null,
      prixUnitaire,
      photoLocal,
      photoCloud,
      disponible: true
    });

    return res.status(201).json({ success: true, menu });
  } catch (err) {
    console.error('createMenu error:', err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/menu
 * Protected (admin). Returns all menus (order newest first)
 */
export const listMenu = async (req, res) => {
  try {
    const menus = await Menu.findAll({ order: [['createdAt', 'DESC']] });
    return res.json({ menus });
  } catch (err) {
    console.error('listMenu error:', err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * PUT /api/menu/:id
 * body: any fields to update (type, nom, categorie, prixUnitaire, disponible, description, caracteristiques)
 * file: photo (optionnel, replace existing)
 */
export const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findByPk(id);
    if (!menu) return res.status(404).json({ message: 'Menu introuvable' });

    const {
      type,
      nom,
      categorie,
      description,
      caracteristiques,
      prixUnitaire,
      disponible
    } = req.body;

    menu.type = (type ?? menu.type);
    menu.nom = (nom ?? menu.nom);
    menu.categorie = (categorie ?? menu.categorie);
    menu.description = (description ?? menu.description);
    menu.caracteristiques = (caracteristiques ?? menu.caracteristiques);
    menu.prixUnitaire = (prixUnitaire ?? menu.prixUnitaire);
    if (typeof disponible !== 'undefined') menu.disponible = (disponible === 'true' || disponible === true);

    // photo replacement
    if (req.file) {
      // remove old cloud image if exists
      if (menu.photoCloud) {
        try {
          const publicId = menu.photoCloud.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
        } catch (e) { /* ignore */ }
      }
      let local = req.file.path.replace(/\\/g, '/');
      let cloud = null;
      if (await isOnline()) {
        const result = await cloudinary.uploader.upload(local, { resource_type: 'image' });
        cloud = result.secure_url;
        try { fs.unlinkSync(local); local = null; } catch (e) {}
      }
      menu.photoLocal = local;
      menu.photoCloud = cloud;
    }

    await menu.save();
    return res.json({ success: true, menu });
  } catch (err) {
    console.error('updateMenu error:', err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE /api/menu/:id
 */
export const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findByPk(id);
    if (!menu) return res.status(404).json({ message: 'Menu introuvable' });

    // delete cloud image if exists
    if (menu.photoCloud) {
      try {
        const publicId = menu.photoCloud.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      } catch (e) { /* ignore */ }
    }
    // delete local file if exists
    if (menu.photoLocal) {
      try { fs.unlinkSync(menu.photoLocal); } catch (e) { /* ignore */ }
    }

    await menu.destroy();
    return res.json({ success: true });
  } catch (err) {
    console.error('deleteMenu error:', err);
    return res.status(500).json({ message: err.message });
  }
};



// controllers/menuController.js → AJOUTEZ
export const getMenus = async (req, res) => {
  try {
    const menus = await db.Menu.findAll({
      where: { disponible: true },
      order: [['type', 'ASC'], ['nom', 'ASC']]
    });
    res.json(menus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};