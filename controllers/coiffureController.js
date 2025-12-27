import db from '../models/index.js';
import cloudinary from '../config/cloudinary.js';
import fs from "fs";
import isOnline from "../utils/isOnline.js";

const Coiffure = db.Coiffure;

export const listCoiffures = async (req, res) => {
  try {
    const data = await Coiffure.findAll({ order: [['createdAt', 'DESC']] });
    return res.json({ coiffures: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

export const createCoiffure = async (req, res) => {
  try {
    const { categorie, description, prixHomme, prixFemme } = req.body;

    let photoLocal = null;
    let photoCloud = null;

    if (req.file) {
      photoLocal = req.file.path.replace(/\\/g, '/');

      if (await isOnline()) {
        const result = await cloudinary.uploader.upload(photoLocal, {
          folder: "coiffures"
        });
        photoCloud = result.secure_url;

        try { fs.unlinkSync(photoLocal); photoLocal = null; } catch (e) {}
      }
    }

    const item = await Coiffure.create({
      categorie,
      description,
      prixHomme,
      prixFemme,
      photoLocal,
      photoCloud
    });

    return res.status(201).json({ coiffure: item });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateCoiffure = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Coiffure.findByPk(id);
    if (!item) return res.status(404).json({ message: "Introuvable" });

    const { categorie, description, prixHomme, prixFemme } = req.body;

    if (categorie) item.categorie = categorie;
    if (description) item.description = description;
    if (prixHomme) item.prixHomme = prixHomme;
    if (prixFemme) item.prixFemme = prixFemme;

    if (req.file) {
      // remove old cloud image
      if (item.photoCloud) {
        try {
          const publicId = item.photoCloud.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`coiffures/${publicId}`);
        } catch (e) {}
      }

      // upload new
      let local = req.file.path.replace(/\\/g, '/');
      let cloud = null;

      if (await isOnline()) {
        const r = await cloudinary.uploader.upload(local, { folder: "coiffures" });
        cloud = r.secure_url;
        try { fs.unlinkSync(local); } catch (e) {}
        local = null;
      }

      item.photoLocal = local;
      item.photoCloud = cloud;
    }

    await item.save();

    return res.json({ coiffure: item });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteCoiffure = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Coiffure.findByPk(id);
    if (!item) return res.status(404).json({ message: "Introuvable" });

    if (item.photoLocal) {
      try { fs.unlinkSync(item.photoLocal); } catch (e) {}
    }

    if (item.photoCloud) {
      try {
        const publicId = item.photoCloud.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`coiffures/${publicId}`);
      } catch (e) {}
    }

    await item.destroy();
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
