import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
  {
    legacyId: { type: Number, index: true },
    productId: { type: Number, default: 0 },
    product: { type: String, required: true },
    warehouse: { type: String, required: true },
    change: { type: Number, required: true },
    date: { type: String, required: true },
  },
  { timestamps: true },
);

export const StockMovement = mongoose.model("StockMovement", stockMovementSchema);
