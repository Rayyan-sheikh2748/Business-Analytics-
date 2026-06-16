import mongoose from "mongoose";

// strict: false allows any dynamic CSV inventory columns to be stored.
// sku is no longer required or unique – dynamic inventory CSVs may not
// have a SKU column at all.
const productSchema = new mongoose.Schema(
  {
    legacyId:  { type: Number, index: true },
    sku:       { type: String, index: true },       // not required, not unique
    name:      { type: String, index: true },       // not required
    category:  { type: String, index: true },
    warehouse: { type: String, default: "Main Warehouse", index: true },
    stock:     { type: Number, default: 0 },
    threshold: { type: Number, default: 10 },
    unitCost:  { type: Number, default: 0 },
  },
  { timestamps: true, strict: false },
);

productSchema.index({ category: 1, warehouse: 1 });

export const Product = mongoose.model("Product", productSchema);
