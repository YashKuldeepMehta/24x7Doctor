import HealthRecord from "../models/HealthRecord.js";
import Prescription from "../models/Prescription.js";
import Doctor from "../models/Doctor.js";


// Get all health records of a patient

export const getPatientRecords = async (req, res) => {

  try {

    const { patientId } = req.params;

    const records = await HealthRecord
      .find({ patientId })
      .populate("doctorId","name specialization")
      .populate("prescriptionId")
      .sort({ createdAt: -1 });

    res.json(records);

  }catch (error) {

  console.log(error);

  res.status(500).json({
    message: "Error creating record",
    error: error.message
  });

}

};



// Get single health record

export const getRecordDetails = async (req, res) => {

  try {

    const { recordId } = req.params;

    const record = await HealthRecord
      .findById(recordId)
      .populate("doctorId", "name specialization")
      .populate("prescriptionId");

    res.json(record);

  } catch (error) {

    res.status(500).json({ message: "Error fetching record" });

  }

};



// Create health record

export const createHealthRecord = async (req, res) => {

  try {

    const newRecord = new HealthRecord(req.body);

    await newRecord.save();

    res.json({
      message: "Health record created",
      record: newRecord
    });

  } catch (error) {

    res.status(500).json({ message: "Error creating record" });

  }

};