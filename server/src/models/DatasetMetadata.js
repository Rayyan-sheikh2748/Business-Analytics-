import mongoose from "mongoose";

const datasetMetadataSchema = new mongoose.Schema(
  {
    moduleType: { type: String, required: true, unique: true }, // 'sales', 'inventory'
    numericFields: [String],
    dateFields: [String],
    categoryFields: [String],
    mappings: {
      revenue: String,    // e.g. 'Total Amount', 'Sales'
      quantity: String,   // e.g. 'Qty', 'Units'
      date: String,       // e.g. 'Order Date', 'Date'
      category: String,   // e.g. 'Category', 'Department'
      customer: String,   // e.g. 'Customer', 'Client'
      product: String,    // e.g. 'Product', 'Item'
      invoice: String,    // e.g. 'Invoice', 'Order ID'
      unitPrice: String,  // e.g. 'Price', 'Unit Cost'
      channel: String,    // e.g. 'Channel', 'Source'
      profit: String,     // e.g. 'Profit', 'Margin'
      region: String,     // e.g. 'Region', 'Location'
      paymentMethod: String, // e.g. 'Payment Method', 'Payment'
      stock: String,      // e.g. 'Stock', 'Quantity'
      threshold: String,  // e.g. 'Threshold', 'Min Stock'
      warehouse: String,  // e.g. 'Warehouse', 'Location'
      sku: String,        // e.g. 'SKU', 'Barcode'
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, strict: false }
);

export const DatasetMetadata = mongoose.model("DatasetMetadata", datasetMetadataSchema);

