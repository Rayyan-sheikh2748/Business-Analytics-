import mongoose from "mongoose";

// email/phone are no longer required or unique.
// When building customers from a sales CSV upload, email is synthetically
// generated and duplicate customers (same name → same generated email)
// would violate the old unique constraint, causing the entire customer
// bulkWrite to fail.
const customerSchema = new mongoose.Schema(
  {
    legacyId:    { type: Number, index: true },
    name:        { type: String, required: true, index: true },
    email:       { type: String, index: true },      // not required, not unique
    phone:       { type: String },                   // not required
    segment:     { type: String, default: "Regular", index: true },
    location:    { type: String, index: true },
    totalOrders: { type: Number, default: 0 },
    totalSpent:  { type: Number, default: 0 },
    joinDate:    { type: String },
    lastOrderDate: { type: String },
    status:      { type: String, default: "Active" },
  },
  { timestamps: true, strict: false },
);

export const Customer = mongoose.model("Customer", customerSchema);
