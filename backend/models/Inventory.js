import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      required: true,
    },
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },
    quantity: { type: Number, default: 0 },
    lastUpdatedBy: { type: String },
  },
  { timestamps: true },
);

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;
