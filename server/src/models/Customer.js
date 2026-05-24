import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    legacyId: { type: Number, unique: true, index: true },
    name: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    segment: { type: String, default: "Regular", index: true },
    location: { type: String, index: true },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    joinDate: { type: String, required: true },
  },
  { timestamps: true },
);

export const Customer = mongoose.model("Customer", customerSchema);
