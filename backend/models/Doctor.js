const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  specialization: {
    type: String
  },

  hospitalName: {
    type: String
  },

  experienceYears: {
    type: Number
  },

  availabilityStatus: {
    type: Boolean,
    default: true
  },

  consultationFee: {
    type: Number
  }

}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);