const express = require("express");
const router = express.Router();

const controller = require("../controllers/healthRecordController");


// Get all records for a patient

router.get("/patient/:patientId", controller.getPatientRecords);


// Get single record

router.get("/record/:recordId", controller.getRecordDetails);


// Create record

router.post("/create", controller.createHealthRecord);


module.exports = router;