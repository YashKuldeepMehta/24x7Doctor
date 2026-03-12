import mongoose from "mongoose";

const pharmacySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    village: { type: String, required: true },
    phone: { type: String, required: true },
    location: {
      type: { type: String, default: "Point" },
      coordinates: [Number], // [longitude, latitude]
    },
  },
  { timestamps: true },
);

const Pharmacy = mongoose.model("Pharmacy", pharmacySchema);

pharmacySchema.index({ location: "2dsphere" });
export default Pharmacy;
