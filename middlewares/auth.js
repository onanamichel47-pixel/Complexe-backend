import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Middleware d'authentification : vérifie le token et attache les données utilisateur à req.user.
 */
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Accès refusé. Aucun jeton fourni.' });

  try {
    // Le décodage du token contient déjà role, privileges, et sections
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

/**
 * Middleware pour vérifier les privilèges spécifiques et l'accès à la section.
 * @param {string} requiredPrivilege - Privilège requis (READ, WRITE, UPDATE, DELETE).
 * @param {string} requiredSection - Clé de la section/onglet (ex: 'longrich', 'menus', 'vitrine').
 */
const checkPrivilege = (requiredPrivilege, requiredSection) => {
  return (req, res, next) => {
    const user = req.user;

    // 1. Le Super Admin (rôle: 'superadmin') a TOUS les droits par défaut.
    if (user.role === 'superadmin') {
      return next();
    }

    // 2. Vérification pour l'Admin Secondaire
    if (user.role === 'admin_secondaire') {
      const { privileges = [], sections = [] } = user;
      
      // Sécurité: Si l'admin est suspendu, bloquer
      if (user.statut === 'suspendu') {
         return res.status(403).json({ message: 'Compte suspendu. Accès interdit.' });
      }

      // VÉRIFICATION 1 : Est-ce que la section/onglet est autorisée ?
      if (requiredSection && !sections.includes(requiredSection)) {
        console.warn(`Tentative d'accès non autorisé à la section ${requiredSection} par Admin ID: ${user.id}`);
        return res.status(403).json({ 
          message: `Accès refusé. La section "${requiredSection}" n'est pas autorisée pour votre compte.` 
        });
      }

      // VÉRIFICATION 2 : Est-ce que le privilège requis est possédé ?
      // L'erreur 403 sur le POST échoue car vous n'aviez que ["READ"]
      if (requiredPrivilege && !privileges.includes(requiredPrivilege)) {
        return res.status(403).json({ 
          message: `Accès refusé. Vous ne possédez pas le droit "${requiredPrivilege}" nécessaire pour cette action.` 
        });
      }

      // Si les deux vérifications sont passées, l'Admin Secondaire est autorisé
      return next();
    }

    // Si rôle inconnu
    return res.status(403).json({ message: 'Accès refusé. Rôle non reconnu.' });
  };
};

// L'ancien middleware superAdminOnly est conservé pour les routes Ultra-sensibles (ex: création de Super Admin, modification d'Admin Secondaire)
const superAdminOnly = (req, res, next) => {
  if (req.user.role !== 'superadmin') return res.status(403).json({ message: 'Accès réservé au super admin' });
  next();
};


export { auth, superAdminOnly, checkPrivilege };