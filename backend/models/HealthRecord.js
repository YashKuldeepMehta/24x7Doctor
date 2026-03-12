const mongoose = require("mongoose");

const healthRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient"
  },

  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor"
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

module.exports = mongoose.model("HealthRecord", healthRecordSchema);