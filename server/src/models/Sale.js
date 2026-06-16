import mongoose from "mongoose";

// strict: false allows any dynamic CSV columns to be stored as-is.
// No required fields on dynamic columns so CSV rows with different column
// names are never rejected by Mongoose validation.
const saleSchema = new mongoose.Schema(
  {
    legacyId: { type: Number, index: true },
    // Standard mapped fields – all optional so dynamic CSVs are accepted
    invoiceId: { type: String, index: true },
    date:      { type: String, index: true },
    customer:  { type: String, index: true },
    product:   { type: String, index: true },
    category:  { type: String, index: true },
    qty:       { type: Number },
    unitPrice: { type: Number },
    revenue:   { type: Number },
    profit:    { type: Number },
    region:    { type: String, index: true },
    paymentMethod: { type: String, index: true },
    channel:   { type: String, default: "Online", index: true },
  },
  { timestamps: true, strict: false },
);

saleSchema.index({ date: -1 });
saleSchema.index({ category: 1, channel: 1 });
saleSchema.index({ date: -1, product: 1 });
saleSchema.index({ date: -1, category: 1 });

export const Sale = mongoose.model("Sale", saleSchema);
