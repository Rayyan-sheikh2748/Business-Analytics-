import { db, productsTable, salesTable, customersTable, settingsTable, stockMovementsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Clearing old data...");
  await db.execute(sql`DELETE FROM stock_movements`);
  await db.execute(sql`DELETE FROM sales`);
  await db.execute(sql`DELETE FROM products`);
  await db.execute(sql`DELETE FROM customers`);
  await db.execute(sql`DELETE FROM settings`);
  await db.execute(sql`SELECT setval('sales_id_seq', 1, false)`);
  await db.execute(sql`SELECT setval('products_id_seq', 1, false)`);
  await db.execute(sql`SELECT setval('customers_id_seq', 1, false)`);
  await db.execute(sql`SELECT setval('settings_id_seq', 1, false)`);
  await db.execute(sql`SELECT setval('stock_movements_id_seq', 1, false)`);

  console.log("Seeding settings...");
  await db.insert(settingsTable).values({
    businessName: "Sharma General Store",
    businessEmail: "sharma.store@gmail.com",
    defaultTheme: "light",
    language: "en",
    timezone: "Asia/Kolkata",
    currency: "INR",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12h",
    enableAnalytics: true,
    autoRefresh: true,
    emailNotifications: true,
    darkMode: false,
    compactView: false,
  });

  console.log("Seeding products (grocery)...");
  await db.insert(productsTable).values([
    { sku: "GR-001", name: "Basmati Rice (5kg)",       category: "Staples",       warehouse: "Main Warehouse",  stock: 480, threshold: 50,  unitCost: "245.00" },
    { sku: "GR-002", name: "Wheat Flour (10kg)",        category: "Staples",       warehouse: "Main Warehouse",  stock: 310, threshold: 40,  unitCost: "320.00" },
    { sku: "GR-003", name: "Toor Dal (1kg)",            category: "Staples",       warehouse: "Main Warehouse",  stock: 0,   threshold: 30,  unitCost: "140.00" },
    { sku: "GR-004", name: "Refined Oil (1L)",          category: "Cooking",       warehouse: "West Warehouse",  stock: 22,  threshold: 25,  unitCost: "155.00" },
    { sku: "GR-005", name: "Sugar (1kg)",               category: "Staples",       warehouse: "Main Warehouse",  stock: 540, threshold: 60,  unitCost: "42.00"  },
    { sku: "GR-006", name: "Salt (1kg)",                category: "Staples",       warehouse: "Main Warehouse",  stock: 820, threshold: 80,  unitCost: "18.00"  },
    { sku: "GR-007", name: "Brooke Bond Tea (250g)",    category: "Beverages",     warehouse: "Main Warehouse",  stock: 95,  threshold: 30,  unitCost: "285.00" },
    { sku: "GR-008", name: "Nescafe Coffee (100g)",     category: "Beverages",     warehouse: "East Warehouse",  stock: 18,  threshold: 20,  unitCost: "520.00" },
    { sku: "GR-009", name: "Parle-G Biscuits (800g)",   category: "Snacks",        warehouse: "Main Warehouse",  stock: 650, threshold: 50,  unitCost: "55.00"  },
    { sku: "GR-010", name: "Sunfeast Dark Fantasy",     category: "Snacks",        warehouse: "Main Warehouse",  stock: 240, threshold: 40,  unitCost: "85.00"  },
    { sku: "GR-011", name: "Amul Butter (500g)",        category: "Dairy",         warehouse: "Cold Storage",    stock: 0,   threshold: 20,  unitCost: "280.00" },
    { sku: "GR-012", name: "Lux Soap (3-pack)",         category: "Personal Care", warehouse: "Main Warehouse",  stock: 380, threshold: 30,  unitCost: "90.00"  },
    { sku: "GR-013", name: "Head & Shoulders (200ml)",  category: "Personal Care", warehouse: "Main Warehouse",  stock: 60,  threshold: 25,  unitCost: "345.00" },
    { sku: "GR-014", name: "Colgate Toothpaste (150g)", category: "Personal Care", warehouse: "Main Warehouse",  stock: 145, threshold: 30,  unitCost: "110.00" },
    { sku: "GR-015", name: "Lay's Chips (26g)",         category: "Snacks",        warehouse: "Main Warehouse",  stock: 310, threshold: 40,  unitCost: "20.00"  },
    { sku: "GR-016", name: "Haldiram Namkeen (200g)",   category: "Snacks",        warehouse: "East Warehouse",  stock: 175, threshold: 30,  unitCost: "50.00"  },
    { sku: "GR-017", name: "Dettol Handwash (200ml)",   category: "Personal Care", warehouse: "Main Warehouse",  stock: 12,  threshold: 15,  unitCost: "130.00" },
    { sku: "GR-018", name: "Maggi Noodles (70g)",       category: "Snacks",        warehouse: "West Warehouse",  stock: 480, threshold: 60,  unitCost: "14.00"  },
    { sku: "GR-019", name: "Real Fruit Juice (1L)",     category: "Beverages",     warehouse: "Cold Storage",    stock: 85,  threshold: 20,  unitCost: "115.00" },
    { sku: "GR-020", name: "Coca-Cola (500ml)",         category: "Beverages",     warehouse: "Main Warehouse",  stock: 320, threshold: 50,  unitCost: "40.00"  },
  ]);

  console.log("Seeding customers...");
  await db.insert(customersTable).values([
    { name: "Ramesh Sharma",    email: "ramesh.sharma@gmail.com",   phone: "+91 98765 43210", segment: "VIP",     location: "Mumbai",    totalOrders: 145, totalSpent: "58250.00", joinDate: "2023-01-15" },
    { name: "Priya Patel",      email: "priya.patel@gmail.com",     phone: "+91 87654 32109", segment: "Premium", location: "Ahmedabad", totalOrders: 98,  totalSpent: "32400.00", joinDate: "2023-03-20" },
    { name: "Suresh Kumar",     email: "suresh.kumar@gmail.com",    phone: "+91 76543 21098", segment: "Regular", location: "Delhi",     totalOrders: 62,  totalSpent: "18900.00", joinDate: "2023-05-10" },
    { name: "Anita Singh",      email: "anita.singh@gmail.com",     phone: "+91 65432 10987", segment: "VIP",     location: "Bengaluru", totalOrders: 112, totalSpent: "45600.00", joinDate: "2023-02-28" },
    { name: "Vikram Reddy",     email: "vikram.reddy@gmail.com",    phone: "+91 54321 09876", segment: "Premium", location: "Hyderabad", totalOrders: 78,  totalSpent: "27300.00", joinDate: "2023-06-05" },
    { name: "Kavita Gupta",     email: "kavita.gupta@gmail.com",    phone: "+91 43210 98765", segment: "Regular", location: "Pune",      totalOrders: 45,  totalSpent: "12500.00", joinDate: "2023-07-18" },
    { name: "Mohan Verma",      email: "mohan.verma@gmail.com",     phone: "+91 32109 87654", segment: "VIP",     location: "Chennai",   totalOrders: 130, totalSpent: "52000.00", joinDate: "2023-01-30" },
    { name: "Sunita Joshi",     email: "sunita.joshi@gmail.com",    phone: "+91 21098 76543", segment: "Regular", location: "Kolkata",   totalOrders: 38,  totalSpent: "9800.00",  joinDate: "2023-08-22" },
    { name: "Arun Mehta",       email: "arun.mehta@gmail.com",      phone: "+91 10987 65432", segment: "Premium", location: "Jaipur",    totalOrders: 88,  totalSpent: "31200.00", joinDate: "2023-04-12" },
    { name: "Deepa Nair",       email: "deepa.nair@gmail.com",      phone: "+91 09876 54321", segment: "VIP",     location: "Kochi",     totalOrders: 102, totalSpent: "39800.00", joinDate: "2023-03-05" },
    { name: "Rajesh Iyer",      email: "rajesh.iyer@gmail.com",     phone: "+91 91234 56789", segment: "Regular", location: "Chennai",   totalOrders: 55,  totalSpent: "14200.00", joinDate: "2023-09-10" },
    { name: "Meena Agarwal",    email: "meena.agarwal@gmail.com",   phone: "+91 82345 67890", segment: "Premium", location: "Lucknow",   totalOrders: 72,  totalSpent: "24500.00", joinDate: "2023-06-25" },
    { name: "Sanjay Desai",     email: "sanjay.desai@gmail.com",    phone: "+91 73456 78901", segment: "Regular", location: "Nagpur",    totalOrders: 31,  totalSpent: "8100.00",  joinDate: "2023-10-03" },
    { name: "Pooja Mishra",     email: "pooja.mishra@gmail.com",    phone: "+91 64567 89012", segment: "New",     location: "Bhopal",    totalOrders: 12,  totalSpent: "3200.00",  joinDate: "2024-01-15" },
    { name: "Arjun Chauhan",    email: "arjun.chauhan@gmail.com",   phone: "+91 55678 90123", segment: "New",     location: "Indore",    totalOrders: 8,   totalSpent: "2100.00",  joinDate: "2024-02-20" },
  ]);

  console.log("Seeding 60 sales transactions...");
  type SalesProduct = { name: string; cat: string; price: number };
  const salesProducts: SalesProduct[] = [
    { name: "Basmati Rice (5kg)",       cat: "Staples",       price: 245 },
    { name: "Wheat Flour (10kg)",        cat: "Staples",       price: 320 },
    { name: "Toor Dal (1kg)",            cat: "Staples",       price: 140 },
    { name: "Refined Oil (1L)",          cat: "Cooking",       price: 155 },
    { name: "Sugar (1kg)",               cat: "Staples",       price: 42  },
    { name: "Brooke Bond Tea (250g)",    cat: "Beverages",     price: 285 },
    { name: "Nescafe Coffee (100g)",     cat: "Beverages",     price: 520 },
    { name: "Parle-G Biscuits (800g)",   cat: "Snacks",        price: 55  },
    { name: "Sunfeast Dark Fantasy",     cat: "Snacks",        price: 85  },
    { name: "Amul Butter (500g)",        cat: "Dairy",         price: 280 },
    { name: "Lux Soap (3-pack)",         cat: "Personal Care", price: 90  },
    { name: "Head & Shoulders (200ml)",  cat: "Personal Care", price: 345 },
    { name: "Colgate Toothpaste (150g)", cat: "Personal Care", price: 110 },
    { name: "Lay's Chips (26g)",         cat: "Snacks",        price: 20  },
    { name: "Haldiram Namkeen (200g)",   cat: "Snacks",        price: 50  },
    { name: "Maggi Noodles (70g)",       cat: "Snacks",        price: 14  },
    { name: "Real Fruit Juice (1L)",     cat: "Beverages",     price: 115 },
    { name: "Coca-Cola (500ml)",         cat: "Beverages",     price: 40  },
    { name: "Dettol Handwash (200ml)",   cat: "Personal Care", price: 130 },
    { name: "Salt (1kg)",                cat: "Staples",       price: 18  },
  ];
  const customerNames = [
    "Ramesh Sharma", "Priya Patel", "Suresh Kumar", "Anita Singh", "Vikram Reddy",
    "Kavita Gupta", "Mohan Verma", "Sunita Joshi", "Arun Mehta", "Deepa Nair",
    "Rajesh Iyer", "Meena Agarwal",
  ];
  const channels = ["Retail", "Online", "Retail", "Retail", "Online"];

  const salesRows = [];
  for (let i = 0; i < 60; i++) {
    const d = new Date("2024-04-01");
    d.setDate(d.getDate() + Math.floor(i * 0.6));
    const date = d.toISOString().split("T")[0];
    const prod = salesProducts[i % salesProducts.length];
    const qty = 1 + (i % 6);
    const revenue = qty * prod.price;
    salesRows.push({
      invoiceId: `INV-${String(10001 + i).padStart(5, "0")}`,
      date,
      customer: customerNames[i % customerNames.length],
      product: prod.name,
      category: prod.cat,
      qty,
      unitPrice: String(prod.price),
      revenue: String(revenue),
      channel: channels[i % channels.length],
    });
  }
  await db.insert(salesTable).values(salesRows);

  console.log("Seeding stock movements...");
  await db.insert(stockMovementsTable).values([
    { productId: 1,  product: "Basmati Rice (5kg)",       warehouse: "Main Warehouse",  change: 200,  date: "2024-04-01" },
    { productId: 2,  product: "Wheat Flour (10kg)",        warehouse: "Main Warehouse",  change: 150,  date: "2024-04-02" },
    { productId: 4,  product: "Refined Oil (1L)",          warehouse: "West Warehouse",  change: -30,  date: "2024-04-03" },
    { productId: 3,  product: "Toor Dal (1kg)",            warehouse: "Main Warehouse",  change: -45,  date: "2024-04-04" },
    { productId: 11, product: "Amul Butter (500g)",        warehouse: "Cold Storage",    change: -20,  date: "2024-04-05" },
    { productId: 7,  product: "Brooke Bond Tea (250g)",    warehouse: "Main Warehouse",  change: 100,  date: "2024-04-06" },
    { productId: 17, product: "Dettol Handwash (200ml)",   warehouse: "Main Warehouse",  change: -18,  date: "2024-04-07" },
    { productId: 8,  product: "Nescafe Coffee (100g)",     warehouse: "East Warehouse",  change: 50,   date: "2024-04-08" },
  ]);

  console.log("Grocery shop seed complete!");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
