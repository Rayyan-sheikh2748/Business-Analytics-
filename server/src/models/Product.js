import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    legacyId: { type: Number, unique: true, index: true },
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    warehouse: { type: String, default: "Main Warehouse", index: true },
    stock: { type: Number, default: 0 },
    threshold: { type: Number, default: 10 },
    unitCost: { type: Number, default: 0 },
  },
  { timestamps: true },
);

productSchema.index({ category: 1, warehouse: 1 });

export const Product = mongoose.model("Product", productSchema);
