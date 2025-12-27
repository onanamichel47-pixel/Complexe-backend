// routes/client/clientAppartRoutes.js
import express from "express";
import {
  getCategoriesWithApparts,
  getAppartsByCategorie,
  getAppartementStatus
} from "../../controllers/client/clientAppartController.js";

const router = express.Router();

router.get("/categories", getCategoriesWithApparts);
router.get("/categorie/:id", getAppartsByCategorie);
router.get("/apparts/:id/status", getAppartementStatus);


export default router;
