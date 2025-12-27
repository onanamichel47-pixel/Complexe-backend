// controllers/imgVitrineController.js

import db from "../models/index.js";
import cloudinary from "../config/cloudinary.js";
import isOnline from "../utils/isOnline.js";
import fs from "fs";

const ImgVitrine = db.ImgVitrine;

// POST /api/img-vitrine (upload image/vidéo)
export const uploadImgVitrine = async (req, res) => {
  try {
    const { type } = req.body;

    if (!type || !["image", "video"].includes(type)) {
      return res.status(400).json({ message: "Type invalide (image | video)" });
    }

    const files = req.files || [];
    if (files.length === 0) return res.status(400).json({ message: "Aucun fichier reçu" });

    const online = await isOnline();
    const created = [];

    for (const file of files) {
      let urlLocal = file.path.replace(/\\/g, "/"); //  FIX WINDOWS
      let urlCloud = null;

      if (online) {
        const result = await cloudinary.uploader.upload(urlLocal, {
          resource_type: type === "video" ? "video" : "image",
        });

        urlCloud = result.secure_url;

        // supprimer le fichier local
        try { fs.unlinkSync(urlLocal); urlLocal = null; } catch {}
      }

      const media = await ImgVitrine.create({
        urlLocal,
        urlCloud,
        type,
      });

      created.push(media);
    }

    return res.status(201).json({ success: true, medias: created });
  } catch (err) {
    console.error("uploadImgVitrine error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/img-vitrine
export const listImgVitrine = async (req, res) => {
  try {
    const medias = await ImgVitrine.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.json({ medias });
  } catch (err) {
    console.error("listImgVitrine error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/img-vitrine/:id
export const deleteImgVitrine = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await ImgVitrine.findByPk(id);
    if (!media) return res.status(404).json({ message: "Media introuvable" });

    if (media.urlLocal) {
      try { fs.unlinkSync(media.urlLocal); } catch {}
    }

    if (media.urlCloud) {
      try {
        const publicId = media.urlCloud.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId, {
          resource_type: media.type === "video" ? "video" : "image",
        });
      } catch {}
    }

    await media.destroy();

    return res.json({ success: true });
  } catch (err) {
    console.error("deleteImgVitrine error:", err);
    return res.status(500).json({ message: err.message });
  }
};
