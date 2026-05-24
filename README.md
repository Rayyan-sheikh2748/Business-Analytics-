# Sharma General Store — Business Analytics Dashboard

A full-stack Business Analytics Dashboard for a grocery store, built with React + Vite (frontend) and Express + PostgreSQL + Drizzle ORM (backend).

## Pages
1. **Dashboard** — KPI cards, revenue chart, sales by category, recent orders, inventory status
2. **Sales** — Full CRUD (Add/Edit/Delete), CSV export/import, filters, pagination
3. **Inventory** — Product management, low-stock alerts, stock movements, warehouse filters
4. **Forecasting** — AI-powered demand forecasting, model comparison, heatmap
5. **Reports** — Generate/export CSV and PDF reports, email & schedule reports
6. **Customers** — Customer management, segments (VIP/Premium/Regular/New), location chart
7. **Settings** — General, Profile, Notifications, Security (password change), Billing, Audit Logs

## Tech Stack
- **Frontend**: React 19, Vite 7, TailwindCSS 4, Recharts, Wouter, TanStack Query
- **Backend**: Express 5, Node.js 24, TypeScript 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod
- **Package Manager**: pnpm (workspaces monorepo)

---

## Local Setup (VS Code)

### Prerequisites
- **Node.js 20+** — https://nodejs.org
- **pnpm 9+** — Run: `npm install -g pnpm`
- **PostgreSQL 14+** — https://www.postgresql.org/download/

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Create Environment File

Create a `.env` file in the **project root**:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/grocery_analytics
SESSION_SECRET=change-this-to-a-long-random-string
```

> Replace `postgres`, `yourpassword`, and `localhost:5432` with your actual PostgreSQL credentials.

### 3. Create the Database

In your PostgreSQL client (psql or pgAdmin):

```sql
CREATE DATABASE grocery_analytics;
```

### 4. Push Schema to Database

```bash
pnpm --filter @workspace/db run push
```

This creates all tables: `products`, `sales`, `customers`, `settings`, `stock_movements`.

### 5. Seed with Grocery Shop Data

```bash
pnpm --filter @workspace/scripts run seed
```

This inserts:
- 20 grocery products (Basmati Rice, Tea, Maggi, Colgate, etc.)
- 15 customers with Indian names and cities
- 60 sales transactions across April-May 2024
- 8 stock movement records
- 1 settings record for "Sharma General Store"

### 6. Start the Backend (Terminal 1)

```bash
pnpm --filter @workspace/api-server run dev
```

The API server starts on **http://localhost:8080**

### 7. Start the Frontend (Terminal 2)

```bash
pnpm --filter @workspace/business-analytics run dev
```

The frontend starts on **http://localhost:5173**

Open http://localhost:5173 in your browser.

---

## VS Code Recommended Setup

Install these extensions for best experience:
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **Thunder Client** or **REST Client** for API testing

### VS Code Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "API Server",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["--filter", "@workspace/api-server", "run", "dev"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    }
  ]
}
```

---

## API Endpoints

### Sales
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/sales/stats | Total revenue, units, transactions |
| GET | /api/sales/trend | Daily revenue trend (30 days) |
| GET | /api/sales/by-category | Revenue breakdown by category |
| GET | /api/sales/top-products | Top 5 products by revenue |
| GET | /api/sales?page=1&limit=10&search=&category=&channel= | Paginated sales list |
| POST | /api/sales | Create new sale |
| PUT | /api/sales/:id | Update sale |
| DELETE | /api/sales/:id | Delete sale |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/inventory/stats | Total products, stock, value |
| GET | /api/inventory/stock-status | In Stock / Low Stock / Out of Stock counts |
| GET | /api/inventory/low-stock-alerts | Products below threshold |
| GET | /api/inventory/recent-movements | Last 5 stock movements |
| GET | /api/inventory | Paginated product list |
| POST | /api/inventory | Add new product |
| PUT | /api/inventory/:id | Update product |
| DELETE | /api/inventory/:id | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/customers/stats | Total customers, revenue, orders |
| GET | /api/customers/by-segment | Segment breakdown |
| GET | /api/customers/top-by-revenue | Top 5 customers |
| GET | /api/customers/by-location | Customers by city |
| GET | /api/customers | Paginated customer list |
| POST | /api/customers | Add new customer |
| PUT | /api/customers/:id | Update customer |
| DELETE | /api/customers/:id | Delete customer |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/stats | Dashboard KPI cards |
| GET | /api/settings | Get app settings |
| PUT | /api/settings | Update settings |
| GET | /api/reports/stats | Report summary stats |
| GET | /api/reports | Paginated report data |

---

## Project Structure

```
.
├── artifacts/
│   ├── api-server/          # Express backend
│   │   └── src/
│   │       ├── index.ts     # App entry, middleware
│   │       └── routes/      # sales, inventory, customers, reports, etc.
│   └── business-analytics/  # React frontend
│       └── src/
│           ├── pages/       # 7 pages
│           ├── components/  # Layout, StatCard, etc.
│           └── lib/         # format helpers
├── lib/
│   ├── db/                  # Drizzle ORM + schema
│   ├── api-spec/            # OpenAPI spec (source of truth)
│   ├── api-zod/             # Generated Zod validation schemas
│   └── api-client-react/    # Generated React Query hooks
├── scripts/
│   └── src/seed.ts          # Grocery shop seed data
├── pnpm-workspace.yaml
└── README.md
```

---

## Common Issues

**Port conflict**: If port 8080 or 5173 is busy, edit the `PORT` in the respective package's config.

**Database connection fails**: Double-check your `DATABASE_URL` in `.env`. Make sure PostgreSQL is running.

**`drizzle-kit push` fails**: Make sure the database `grocery_analytics` exists first.

**Frontend shows no data**: Ensure the API server is running on port 8080. Open http://localhost:8080/api/healthz to verify.

**TypeScript errors**: Run `pnpm run typecheck` to see all errors. Most are harmless type narrowing issues.
