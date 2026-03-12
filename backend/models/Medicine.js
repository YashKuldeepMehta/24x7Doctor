import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    genericName: { type: String },
    aliases: [String], // ["Crocin", "Dolo"] → both map to Paracetamol
    category: { type: String },
  },
  { timestamps: true },
);

medicineSchema.index({ name: "text", aliases: "text", genericName: "text" });

const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;
