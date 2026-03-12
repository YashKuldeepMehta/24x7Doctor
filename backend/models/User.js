import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ["patient", "doctor", "pharmacy"],
    required: true,
  },
  village: { type: String, trim: true },
  district: { type: String, trim: true },
  language: {
    type: String,
    enum: ["hi", "pa", "en"],
    default: "en", // default punjabi for Nabha region
  },
  isActive: { type: Boolean, default: true },
  lastSeen: { type: Date },

   // ─── Patient-Only Fields ─────────────────────────────────────
    dob: {
      type: Date,
      required: function () { return this.role === "patient"; },
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: function () { return this.role === "patient"; },
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    // emergencyContact: { type: emergencyContactSchema },


    // ─── Doctor-Only Fields ──────────────────────────────────────
    specialization: {
      type: String,
      required: function () { return this.role === "doctor"; },
      trim: true,
    },
    registrationNumber: {
      type: String,
      unique: true,
      sparse: true,
      required: function () { return this.role === "doctor"; },
      trim: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },
     qualifications: [{ type: String, trim: true }], // ["MBBS", "MD - General Medicine"]
    experienceYears: { type: Number, min: 0 },
    // availabilitySlots: [availabilitySlotSchema],
    consultationFee: { type: Number, default: 0 }, // 0 for govt doctors
    isOnline: { type: Boolean, default: false },

    // ─── Pharmacy Admin-Only Fields ──────────────────────────────
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
    },
  },
  {
    timestamps: true, // auto adds createdAt and updatedAt
  }
);


const User = mongoose.model("User", userSchema);
export default User;
