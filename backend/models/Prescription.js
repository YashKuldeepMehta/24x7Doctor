import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient"
  },

  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor"
  },

  recordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HealthRecord"
  },

  medicines: [
    {
      medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine"
      },

      dosage: String,
      duration: String,
      instructions: String
    }
  ]

}, { timestamps: true });

export default mongoose.model("Prescription", prescriptionSchema);