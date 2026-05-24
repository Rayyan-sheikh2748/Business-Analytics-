import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
  {
    legacyId: { type: Number, unique: true, index: true },
    productId: { type: Number, required: true },
    product: { type: String, required: true },
    warehouse: { type: String, required: true },
    change: { type: Number, required: true },
    date: { type: String, required: true },
  },
  { timestamps: true },
);

export const StockMovement = mongoose.model("StockMovement", stockMovementSchema);
