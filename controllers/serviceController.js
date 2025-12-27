import db from '../models/index.js';
import isOnline from '../utils/isOnline.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

const { Service } = db;

// Fonction utilitaire pour uploader un fichier sur Cloudinary et nettoyer le local
const handleFileUpload = async (file, folder) => {
  if (!file) return { local: null, cloud: null };
  
  const localPath = file.path;
  const result = { local: localPath, cloud: null };
  const online = await isOnline();

  if (online) {
    try {
      const upload = await cloudinary.uploader.upload(localPath, {
        folder: folder,
      });
      result.cloud = upload.secure_url;
      fs.unlinkSync(localPath);
      result.local = null; // Clear local après success
    } catch (error) {
      console.error(`Cloudinary upload failed for ${file.originalname}:`, error);
    }
  }
  return result;
};

// CREATE SERVICE
export const createService = async (req, res) => {
  try {
    const { nom, description, ordreAffichage } = req.body;
    
    const photoFile = req.files['photo'] ? req.files['photo'][0] : null;
    const logoFile = req.files['logo'] ? req.files['logo'][0] : null;

    if (!nom || !description) {
      if (photoFile && fs.existsSync(photoFile.path)) fs.unlinkSync(photoFile.path);
      if (logoFile && fs.existsSync(logoFile.path)) fs.unlinkSync(logoFile.path);
      return res.status(400).json({ message: "Nom et description requis." });
    }

    const photoResult = await handleFileUpload(photoFile, "services/photos");
    const logoResult = await handleFileUpload(logoFile, "services/logos");

    const service = await Service.create({
      nom,
      description,
      ordreAffichage: ordreAffichage || 0,
      photoLocal: photoResult.local,
      photoCloud: photoResult.cloud,
      logoLocal: logoResult.local,
      logoCloud: logoResult.cloud,
    });

    return res.status(201).json({ message: "Service créé", service });
  } catch (err) {
    console.error("❌ createService ERROR :", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// LIST SERVICES
export const listServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      order: [["ordreAffichage", "ASC"]],
    });

    return res.json({ services });
  } catch (err) {
    console.error("❌ listServices ERROR :", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// DELETE SERVICE
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: "Service introuvable." });
    }

    // Delete local files
    if (service.photoLocal && fs.existsSync(service.photoLocal)) fs.unlinkSync(service.photoLocal);
    if (service.logoLocal && fs.existsSync(service.logoLocal)) fs.unlinkSync(service.logoLocal);

    // Delete Cloudinary photo
    if (service.photoCloud) {
      try {
        const publicId = service.photoCloud.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`services/photos/${publicId}`);
      } catch (err) {
        console.warn("Cloudinary photo deletion failed:", err.message);
      }
    }

    // Delete Cloudinary logo
    if (service.logoCloud) {
      try {
        const publicId = service.logoCloud.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`services/logos/${publicId}`);
      } catch (err) {
        console.warn("Cloudinary logo deletion failed:", err.message);
      }
    }

    await service.destroy();

    return res.json({ message: "Service supprimé." });
  } catch (err) {
    console.error("❌ deleteService ERROR :", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// Ajoute updateService si besoin (similaire à create, avec replace)
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);
    if (!service) return res.status(404).json({ message: "Service introuvable." });

    const { nom, description, ordreAffichage } = req.body;

    if (nom) service.nom = nom;
    if (description) service.description = description;
    if (ordreAffichage) service.ordreAffichage = ordreAffichage;

    const photoFile = req.files['photo'] ? req.files['photo'][0] : null;
    const logoFile = req.files['logo'] ? req.files['logo'][0] : null;

    if (photoFile) {
      // Delete old photo
      if (service.photoCloud) {
        const publicId = service.photoCloud.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`services/photos/${publicId}`).catch(err => console.warn(err));
      }
      if (service.photoLocal && fs.existsSync(service.photoLocal)) fs.unlinkSync(service.photoLocal);

      const photoResult = await handleFileUpload(photoFile, "services/photos");
      service.photoLocal = photoResult.local;
      service.photoCloud = photoResult.cloud;
    }

    if (logoFile) {
      // Delete old logo
      if (service.logoCloud) {
        const publicId = service.logoCloud.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`services/logos/${publicId}`).catch(err => console.warn(err));
      }
      if (service.logoLocal && fs.existsSync(service.logoLocal)) fs.unlinkSync(service.logoLocal);

      const logoResult = await handleFileUpload(logoFile, "services/logos");
      service.logoLocal = logoResult.local;
      service.logoCloud = logoResult.cloud;
    }

    await service.save();

    return res.json({ message: "Service mis à jour", service });
  } catch (err) {
    console.error("❌ updateService ERROR :", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};