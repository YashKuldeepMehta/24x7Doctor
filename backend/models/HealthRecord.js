import mongoose from "mongoose";

const healthRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment"
  },

  diagnosis: {
    type: String
  },

  notes: {
    type: String
  },

  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prescription"
  },

  attachments: [String]

}, { timestamps: true });

export default mongoose.model("HealthRecord", healthRecordSchema);