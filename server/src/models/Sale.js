import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    legacyId: { type: Number, unique: true, index: true },
    invoiceId: { type: String, required: true, unique: true },
    date: { type: String, required: true, index: true },
    customer: { type: String, required: true, index: true },
    product: { type: String, required: true },
    category: { type: String, required: true, index: true },
    qty: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    revenue: { type: Number, required: true },
    channel: { type: String, default: "Online", index: true },
  },
  { timestamps: true },
);

saleSchema.index({ date: -1 });
saleSchema.index({ category: 1, channel: 1 });

export const Sale = mongoose.model("Sale", saleSchema);
