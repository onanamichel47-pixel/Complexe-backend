import db from '../models/index.js';
import cloudinary from '../config/cloudinary.js';
import isOnline from '../utils/isOnline.js';
import fs from 'fs';

const Vitrine = db.Vitrine;
const ImgVitrine = db.ImgVitrine;

const createVitrine = async (req, res) => {
  console.log("FILES REÇUS →", req.files);
  console.log("BODY REÇU →", req.body);

  const { description, heureOuverture, heureFermeture, email, contactClient, nomLocalisation, latitude, longitude } = req.body;
  const imgs = req.files || [];

  if (imgs.length > 3) return res.status(400).json({ message: 'Max 3 photos' });

  const online = await isOnline();
  console.log('DÉTECTION CONNEXION →', online ? 'ONLINE → Cloudinary' : 'OFFLINE → dossier uploads');

  const vitrine = await Vitrine.create({
    nomComplexe: 'COMPLEXE NNOMO',
    description, heureOuverture, heureFermeture, email, contactClient, nomLocalisation, latitude, longitude
  });

  for (const file of imgs) {
    let urlLocal = file.path, urlCloud = null;
    const type = 'image';
    if (file.mimetype.startsWith('video')) return res.status(400).json({ message: 'Seulement images pour Vitrine' });
    if (online) {
      const result = await cloudinary.uploader.upload(urlLocal, { resource_type: type });
      urlCloud = result.secure_url;
      fs.unlinkSync(urlLocal);
      urlLocal = null;
    }
    await ImgVitrine.create({ vitrineId: vitrine.id, urlLocal, urlCloud, type });
  }

  res.status(201).json({ message: 'Vitrine créée', vitrine });
};

const getVitrine = async (req, res) => {
  try {
    const vitrine = await Vitrine.findOne({
      include: [{
        model: ImgVitrine,
        as: 'ImgVitrines',
        attributes: ['urlLocal', 'urlCloud', 'type'],
      }],
    });

    if (!vitrine) return res.status(404).json({ message: 'Vitrine non trouvée' });

    res.json({ vitrine });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateVitrine = async (req, res) => {
  try {
    const { description, heureOuverture, heureFermeture, email, contactClient, nomLocalisation, latitude, longitude } = req.body;
    const imgs = req.files || [];

    const vitrine = await Vitrine.findOne();
    if (!vitrine) {
      return res.status(404).json({ message: 'Aucune vitrine à mettre à jour' });
    }

    // Mise à jour des champs texte
    vitrine.description = description ?? vitrine.description;
    vitrine.heureOuverture = heureOuverture ?? vitrine.heureOuverture;
    vitrine.heureFermeture = heureFermeture ?? vitrine.heureFermeture;
    vitrine.email = email ?? vitrine.email;
    vitrine.contactClient = contactClient ?? vitrine.contactClient;
    vitrine.nomLocalisation = nomLocalisation ?? vitrine.nomLocalisation;
    vitrine.latitude = latitude ?? vitrine.latitude;
    vitrine.longitude = longitude ?? vitrine.longitude;

    await vitrine.save();

    // Si tu veux aussi ajouter de nouvelles images lors de l’update:
    if (imgs.length) {
      const online = await isOnline();
      for (const file of imgs) {
        let urlLocal = file.path, urlCloud = null;
        const type = 'image';
        if (file.mimetype.startsWith('video')) {
          return res.status(400).json({ message: 'Seulement images pour Vitrine' });
        }
        if (online) {
          const result = await cloudinary.uploader.upload(urlLocal, { resource_type: type });
          urlCloud = result.secure_url;
          fs.unlinkSync(urlLocal);
          urlLocal = null;
        }
        await ImgVitrine.create({ vitrineId: vitrine.id, urlLocal, urlCloud, type });
      }
    }

    return res.json({ message: 'Vitrine mise à jour', vitrine });
  } catch (err) {
    console.error('updateVitrine error:', err);
    return res.status(500).json({ message: err.message });
  }
};

// AJOUTEZ ces fonctions à la fin du contrôleur existant
const toggleServiceRestauration = async (req, res) => {
  try {
    const { active } = req.body;
    let vitrine = await db.Vitrine.findOne();
    if (!vitrine) vitrine = await db.Vitrine.create({ nomComplexe: 'COMPLEXE NNOMO', description: '', activeServiceRestauration: active });
    else await vitrine.update({ activeServiceRestauration: active });
    res.json({ success: true, activeServiceRestauration: vitrine.activeServiceRestauration });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getVitrineStatus = async (req, res) => {
  try {
    const vitrine = await db.Vitrine.findOne();
    res.json({ activeServiceRestauration: vitrine?.activeServiceRestauration ?? true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { createVitrine, getVitrine, updateVitrine, toggleServiceRestauration, getVitrineStatus };
