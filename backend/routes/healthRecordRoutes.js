import express from "express";
import * as controller from "../controllers/healthRecordController.js";
const router = express.Router();


// Get all records for a patient

router.get("/patient/:patientId", controller.getPatientRecords);


// Get single record

router.get("/record/:recordId", controller.getRecordDetails);


// Create record

router.post("/create", controller.createHealthRecord);


export default router;