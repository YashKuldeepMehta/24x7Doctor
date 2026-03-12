import express from "express";
import {
  searchMedicine,
  updateInventory,
  getPharmacyInventory,
  addMedicine,
  addPharmacy
} from "../controllers/medicineController.js";

const router = express.Router();

router.get("/search", searchMedicine);
router.post("/add", addMedicine);
router.post("/pharmacy/add", addPharmacy);
router.post("/inventory/update", updateInventory);
router.get("/inventory/:pharmacyId", getPharmacyInventory);

export default router;