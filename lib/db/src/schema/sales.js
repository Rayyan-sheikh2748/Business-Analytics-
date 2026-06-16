import { pgTable, serial, text, integer, numeric, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
export const salesTable = pgTable("sales", {
    id: serial("id").primaryKey(),
    invoiceId: text("invoice_id").notNull().unique(),
    date: date("date").notNull(),
    customer: text("customer").notNull(),
    product: text("product").notNull(),
    category: text("category").notNull(),
    qty: integer("qty").notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    revenue: numeric("revenue", { precision: 12, scale: 2 }).notNull(),
    channel: text("channel").notNull().default("Online"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const insertSaleSchema = createInsertSchema(salesTable).omit({ id: true, createdAt: true });
export const stockMovementsTable = pgTable("stock_movements", {
    id: serial("id").primaryKey(),
    productId: integer("product_id").notNull(),
    product: text("product").notNull(),
    warehouse: text("warehouse").notNull(),
    change: integer("change").notNull(),
    date: date("date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
