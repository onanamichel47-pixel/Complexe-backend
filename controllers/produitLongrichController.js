// controllers/produitLongrichController.js
import db from '../models/index.js';
import cloudinary from '../config/cloudinary.js';
import isOnline from '../utils/isOnline.js';
import fs from 'fs';

const ProduitLongrich = db.ProduitLongrich;
const Notification = db.Notification; // pour créer notifications promo


//---------------------------------------------------------
// HELPER : Créer automatiquement une notification promo
//---------------------------------------------------------
async function createPromoNotification(produit) {
  try {
    const message = `Promo sur ${produit.nom} — Prix promo: ${produit.prixPromo} FCFA. Offre limitée !`;

    const expiration = new Date();
    expiration.setMonth(expiration.getMonth() + 4);

    await Notification.create({
      message,
      type: 'promo',
      expiration,
    });

    console.log("Notification promo créée pour :", produit.nom);

  } catch (e) {
    console.error('createPromoNotification error', e);
  }
}


//---------------------------------------------------------
// LIST
//---------------------------------------------------------
export const listProduits = async (req, res) => {
  try {
    const produits = await ProduitLongrich.findAll({ order: [['createdAt', 'DESC']] });
    return res.json({ produits });
  } catch (err) {
    console.error('listProduits error', err);
    return res.status(500).json({ message: err.message });
  }
};


//---------------------------------------------------------
// CREATE
//---------------------------------------------------------
export const createProduit = async (req, res) => {
  try {
    const { nom, categorie, prixUnitaire, stock, pvs, statut, bienfaits } = req.body;
    if (!nom || !categorie || (!prixUnitaire && prixUnitaire !== '0')) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    let photoLocal = null;
    let photoCloud = null;
    if (req.file) {
      photoLocal = req.file.path.replace(/\\/g, '/');
      if (await isOnline()) {
        const result = await cloudinary.uploader.upload(photoLocal, { folder: 'produits_longrich' });
        photoCloud = result.secure_url;
        try { fs.unlinkSync(photoLocal); photoLocal = null; } catch (e) {}
      }
    }

    const p = await ProduitLongrich.create({
      nom,
      categorie,
      prixUnitaire,
      stock: stock ?? 0,
      pvs,
      statut: statut ?? 'disponible',
      bienfaits,
      photoLocal,
      photoCloud,
    });

    return res.status(201).json({ produit: p });
  } catch (err) {
    console.error('createProduit error', err);
    return res.status(500).json({ message: err.message });
  }
};


//---------------------------------------------------------
// UPDATE (normal)
//---------------------------------------------------------
export const updateProduit = async (req, res) => {
  try {
    const { id } = req.params;
    const prod = await ProduitLongrich.findByPk(id);
    if (!prod) return res.status(404).json({ message: 'Produit introuvable' });

    // sauvegarde ancienne promo
    const oldPrixPromo = prod.prixPromo;

    const { nom, categorie, prixUnitaire, stock, pvs, statut, bienfaits, prixPromo } = req.body;

    if (typeof nom !== 'undefined') prod.nom = nom;
    if (typeof categorie !== 'undefined') prod.categorie = categorie;
    if (typeof prixUnitaire !== 'undefined') prod.prixUnitaire = prixUnitaire;
    if (typeof stock !== 'undefined') prod.stock = stock;
    if (typeof pvs !== 'undefined') prod.pvs = pvs;
    if (typeof statut !== 'undefined') prod.statut = statut;
    if (typeof bienfaits !== 'undefined') prod.bienfaits = bienfaits;
    if (typeof prixPromo !== 'undefined') prod.prixPromo = prixPromo;

    // MAJ image
    if (req.file) {
      if (prod.photoCloud) {
        try {
          const publicId = prod.photoCloud.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`produits_longrich/${publicId}`);
        } catch (e) {}
      }
      let local = req.file.path.replace(/\\/g, '/');
      let cloud = null;

      if (await isOnline()) {
        const result = await cloudinary.uploader.upload(local, { folder: 'produits_longrich' });
        cloud = result.secure_url;
        try { fs.unlinkSync(local); } catch (e) {}
        local = null;
      }
      prod.photoLocal = local;
      prod.photoCloud = cloud;
    }

    await prod.save();

    //-----------------------------------------------------
    // SI prixPromo change → créer notification automatique
    //-----------------------------------------------------
    if (prod.prixPromo && prod.prixPromo !== oldPrixPromo) {
      await createPromoNotification(prod);
    }

    return res.json({ produit: prod });

  } catch (err) {
    console.error('updateProduit error', err);
    return res.status(500).json({ message: err.message });
  }
};


//---------------------------------------------------------
// DELETE
//---------------------------------------------------------
export const deleteProduit = async (req, res) => {
  try {
    const { id } = req.params;
    const prod = await ProduitLongrich.findByPk(id);
    if (!prod) return res.status(404).json({ message: 'Produit introuvable' });

    if (prod.photoLocal) { try { fs.unlinkSync(prod.photoLocal); } catch (e) {} }
    if (prod.photoCloud) {
      try {
        const publicId = prod.photoCloud.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`produits_longrich/${publicId}`);
      } catch (e) {}
    }

    await prod.destroy();
    return res.json({ success: true });

  } catch (err) {
    console.error('deleteProduit error', err);
    return res.status(500).json({ message: err.message });
  }
};


//---------------------------------------------------------
// SET PROMO (onglet Promo)
//---------------------------------------------------------
export const setPromo = async (req, res) => {
  try {
    const { id } = req.params;
    const prod = await ProduitLongrich.findByPk(id);
    if (!prod) return res.status(404).json({ message: 'Produit introuvable' });

    const { prixPromo, consignePromo, visibleNotification } = req.body;

    // sauvegarde ancienne promo
    const oldPrixPromo = prod.prixPromo;

    // Upload vidéo (optionnel)
    let promoVideoUrl = null;
    if (req.files && req.files.length > 0) {
      const f = req.files[0];
      let local = f.path.replace(/\\/g, '/');

      if (await isOnline()) {
        const result = await cloudinary.uploader.upload(local, { resource_type: 'video', folder: 'promos_longrich' });
        promoVideoUrl = result.secure_url;
        try { fs.unlinkSync(local); } catch (e) {}
      } else {
        promoVideoUrl = local; // offline
      }
    }

    // Mise à jour champs promo
    prod.prixPromo = prixPromo ?? prod.prixPromo;
    prod.consignePromo = consignePromo ?? prod.consignePromo;
    prod.promoVideo = promoVideoUrl ?? prod.promoVideo;
    prod.prixPromoVisibleNotification =
      visibleNotification === '1' || visibleNotification === 'true';

    await prod.save();

    //------------------------------------------
    // SI promo activée ou modifiée → notifier
    //------------------------------------------
    if (prod.prixPromo && prod.prixPromo !== oldPrixPromo) {
      await createPromoNotification(prod);
    }

    return res.json({ produit: prod });

  } catch (err) {
    console.error('setPromo error', err);
    return res.status(500).json({ message: err.message });
  }
};