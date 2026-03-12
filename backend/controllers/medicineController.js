import Pharmacy from "../models/Pharmacy.js";
import Medicine from "../models/Medicine.js";
import Inventory from "../models/Inventory.js";
import { getCoordinates } from "../utils/geocode.js";

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

// ─────────────────────────────────────────────
// GET /api/medicine/search?medicine=paracetamol&village=Nabha
// Works for ANY village name now
// ─────────────────────────────────────────────
export const searchMedicine = async (req, res) => {
  try {
    const { medicine, village } = req.query;

    if (!medicine || !village) {
      return res.status(400).json({
        success: false,
        message: "medicine and village query params are required"
      });
    }

    // Get coords dynamically via Google Maps — works for any village
    let coords;
    try {
      coords = await getCoordinates(village);
    } catch {
      return res.status(400).json({
        success: false,
        message: `Could not find location for village: ${village}`
      });
    }

    console.log("✅ Coords:", coords);

    // Fuzzy text search for medicine
    const matchedMedicines = await Medicine.find({$text: { $search: medicine }});
    console.log("✅ Matched medicines:", matchedMedicines); 

    if (matchedMedicines.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found. Try a generic name like Paracetamol."
      });
    }

    const medicineIds = matchedMedicines.map((m) => m._id);
    console.log("✅ Medicine IDs:", medicineIds);

    // Get all inventory entries for matched medicines
    const inventoryItems = await Inventory.find({
      medicine: { $in: medicineIds }
    })
      .populate("pharmacy")
      .populate("medicine");

      console.log("✅ Inventory items found:", inventoryItems.length);

    // Calculate distance for each pharmacy and format response
    const results = inventoryItems.map((item) => {
      const [lng, lat] = item.pharmacy.location.coordinates;
      console.log("🏪 Pharmacy location:", item.pharmacy.location);
      const distance = haversine(coords.lat, coords.lng, lat, lng);

      return {
        pharmacyId: item.pharmacy._id,
        pharmacyName: item.pharmacy.name,
        village: item.pharmacy.village,
        phone: item.pharmacy.phone,
        medicine: item.medicine.name,
        genericName: item.medicine.genericName,
        quantity: item.quantity,
        stockStatus:
          item.quantity === 0
            ? "out_of_stock"
            : item.quantity < 30
            ? "low"
            : "available",
        distance: parseFloat(distance),
        lastUpdated: item.updatedAt
      };
    });

    console.log("✅ Results array:", JSON.stringify(results, null, 2)); // add this
console.log("✅ About to send response"); 

    // Sort: in-stock first → then by distance
    results.sort((a, b) => {
      if (a.quantity === 0 && b.quantity > 0) return 1;
      if (a.quantity > 0 && b.quantity === 0) return -1;
      return a.distance - b.distance;
    });

    return res.json({
      success: true,
      searchedVillage: village,
      resolvedCoords: coords, // useful for frontend map
      count: results.length,
      data: results
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// POST /api/medicine/inventory/update
// Body: { pharmacyId, medicineId, quantity }
// ─────────────────────────────────────────────
export const updateInventory = async (req, res) => {
  try {
    const { pharmacyId, medicineId, quantity } = req.body;

    if (!pharmacyId || !medicineId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "pharmacyId, medicineId, and quantity are required"
      });
    }

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity cannot be negative"
      });
    }

    const updated = await Inventory.findOneAndUpdate(
      { pharmacy: pharmacyId, medicine: medicineId },
      { quantity, lastUpdatedBy: req.user?.name || "pharmacist" },
      { upsert: true, new: true }
    )
      .populate("medicine", "name")
      .populate("pharmacy", "name village");

    return res.status(200).json({
      success: true,
      message: "Inventory updated successfully",
      data: {
        pharmacy: updated.pharmacy.name,
        village: updated.pharmacy.village,
        medicine: updated.medicine.name,
        quantity: updated.quantity,
        updatedAt: updated.updatedAt
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// GET /api/medicine/inventory/:pharmacyId
// ─────────────────────────────────────────────
export const getPharmacyInventory = async (req, res, next) => {
  try {
    const { pharmacyId } = req.params;

    const inventory = await Inventory.find({ pharmacy: pharmacyId }).populate(
      "medicine",
      "name genericName category"
    );

    const formatted = inventory.map((item) => ({
      medicineId: item.medicine._id,
      name: item.medicine.name,
      genericName: item.medicine.genericName,
      category: item.medicine.category,
      quantity: item.quantity,
      stockStatus:
        item.quantity === 0
          ? "out_of_stock"
          : item.quantity < 30
          ? "low"
          : "available",
      lastUpdated: item.updatedAt
    }));

    res.json({ success: true, data: formatted });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// POST /api/medicine/add
// Body: { name, genericName?, aliases?, category? }
// ─────────────────────────────────────────────
export const addMedicine = async (req, res) => {
  try {
    const { name, genericName, aliases, category } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Medicine name is required"
      });
    }

    const existing = await Medicine.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Medicine already exists",
        data: existing
      });
    }

    const medicine = await Medicine.create({
      name,
      genericName: genericName || name,
      aliases: aliases || [],
      category: category || "General"
    });

    res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      data: medicine
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// POST /api/medicine/pharmacy/add
// Body: { name, village, phone }
// ─────────────────────────────────────────────
export const addPharmacy = async (req, res) => {
  try {
    const { name, village, phone } = req.body;

    if (!name || !village || !phone) {
      return res.status(400).json({
        success: false,
        message: "name, village, and phone are required"
      });
    }

    // Geocode the village to get coordinates
    let coords;
    try {
      coords = await getCoordinates(village);
    } catch {
      return res.status(400).json({
        success: false,
        message: `Could not find location for village: ${village}`
      });
    }

    const pharmacy = await Pharmacy.create({
      name,
      village,
      phone,
      location: {
        type: "Point",
        coordinates: [coords.lng, coords.lat] // GeoJSON: [lng, lat]
      }
    });

    res.status(201).json({
      success: true,
      message: "Pharmacy added successfully",
      data: pharmacy
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};