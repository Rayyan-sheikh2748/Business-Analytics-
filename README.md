# Business Analytics - MERN Stack

A full-stack Business Analytics Dashboard built with **MongoDB**, **Express**, **React**, and **Node.js**. The app includes dashboards, sales analytics, inventory tracking, customer insights, reports, CSV imports, and forecasting features.

## Features

- **Dashboard** - KPI cards, revenue charts, category breakdowns, recent orders, inventory status, and AI-style insights
- **Sales** - CRUD operations, filtering, pagination, CSV import, and CSV export
- **Inventory** - Product management, stock levels, low-stock alerts, stock movements, CSV import, and CSV export
- **Forecasting** - Demand forecast, model comparison, heatmap, product forecast, and investment recommendations
- **Reports** - Report views with CSV export and print/save-as-PDF support
- **Customers** - Customer records, segments, revenue ranking, location analytics, and trends
- **Settings** - Business profile, preferences, notifications, and data clearing

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 6, Tailwind CSS 4, Framer Motion, Recharts, TanStack Query |
| Backend | Node.js, Express 4, Mongoose |
| Database | MongoDB |
| Validation | Zod |
| File Uploads | Multer |

## Project Structure

```text
Business-Analytics-MERN/
|-- client/                 # React frontend
|   |-- public/              # Static assets
|   `-- src/
|       |-- components/      # Layout, cards, UI components
|       |-- contexts/        # Auth context
|       |-- hooks/           # Shared React hooks
|       |-- lib/             # API client and helpers
|       `-- pages/           # Dashboard, Sales, Inventory, etc.
|-- lib/                     # Shared API/database packages
|-- scripts/                 # Workspace scripts
|-- server/                  # Express backend
|   `-- src/
|       |-- config/          # Environment and database config
|       |-- controllers/     # Route handlers
|       |-- middleware/      # Auth, validation, error handling
|       |-- ml/              # Forecasting helper
|       |-- models/          # Mongoose schemas
|       |-- routes/          # API routes
|       |-- seeds/           # Sample datasets and seed scripts
|       |-- services/        # Business logic
|       `-- utils/           # CSV, preprocessing, schema helpers
`-- README.md
```

## Prerequisites

- **Node.js 20+**
- **MongoDB 6+**, or a MongoDB Atlas connection string
- **npm** for the client/server folders

The workspace also contains `pnpm` files for shared packages, but the app can be run from the `server` and `client` folders with `npm`.

## Local Setup

### 1. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Create Environment File

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/business_analytics
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/business_analytics
```

If local MongoDB is unavailable, the backend can fall back to an in-memory MongoDB during development. Data stored in the in-memory database is lost when the server stops.

### 3. Seed Sample Data

Run a seed command from the `server` folder:

```bash
cd server

# Default grocery dataset
npm run seed

# Other sample datasets
npm run seed:grocery
npm run seed:electronics
npm run seed:bakery
npm run seed:retail
```

Each seed command clears the existing analytics data first, then inserts the selected sample dataset.

Available seed datasets:

| Dataset | Business |
| --- | --- |
| `grocery` | Sharma General Store |
| `electronics` | TechZone Electronics |
| `bakery` | Golden Crust Bakery |
| `retail` | Urban Retail Hub |

### 4. Start Backend

```bash
cd server
npm run server
```

Backend API: `http://localhost:5000`

### 5. Start Frontend

Open a second terminal:

```bash
cd client
npm run dev
```

Frontend app: `http://localhost:5173`

## Commands Reference

| Location | Command | Description |
| --- | --- | --- |
| `server/` | `npm run server` | Start backend in watch mode |
| `server/` | `npm start` | Start backend normally |
| `server/` | `npm run seed` | Seed default grocery dataset |
| `server/` | `npm run seed:grocery` | Seed grocery dataset |
| `server/` | `npm run seed:electronics` | Seed electronics dataset |
| `server/` | `npm run seed:bakery` | Seed bakery dataset |
| `server/` | `npm run seed:retail` | Seed retail dataset |
| `server/` | `npm run clear-db` | Clear database data |
| `client/` | `npm run dev` | Start Vite dev server |
| `client/` | `npm run build` | Build frontend for production |
| `client/` | `npm run preview` | Preview production build |
| `client/` | `npm run typecheck` | Run TypeScript checks |

## Main API Endpoints

All endpoints are served under `/api`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/healthz` | Health check |
| `POST` | `/auth/login` | Login |
| `POST` | `/auth/register` | Register user |
| `GET` | `/auth/me` | Get current authenticated user |
| `GET` | `/dashboard/stats` | Dashboard KPIs |
| `GET` | `/dashboard/revenue-overview` | Revenue overview chart data |
| `GET` | `/dashboard/sales-by-category` | Sales by category |
| `GET` | `/dashboard/recent-orders` | Recent orders |
| `GET` | `/dashboard/inventory-status` | Inventory summary |
| `GET` | `/dashboard/ai-insights` | Insight cards |
| `GET` | `/sales` | List sales |
| `POST` | `/sales` | Create sale |
| `PUT` | `/sales/:id` | Update sale |
| `DELETE` | `/sales/:id` | Delete sale |
| `POST` | `/sales/upload` | Upload sales CSV |
| `GET` | `/inventory` | List inventory |
| `POST` | `/inventory` | Create product |
| `PUT` | `/inventory/:id` | Update product |
| `DELETE` | `/inventory/:id` | Delete product |
| `POST` | `/inventory/upload` | Upload inventory CSV |
| `GET` | `/customers` | List customers |
| `POST` | `/customers` | Create customer |
| `PUT` | `/customers/:id` | Update customer |
| `DELETE` | `/customers/:id` | Delete customer |
| `GET` | `/reports` | Report data |
| `GET` | `/forecasting/forecast` | Demand forecast |
| `GET` | `/forecasting/model-comparison` | Forecasting model comparison |
| `GET` | `/forecasting/investment-recommendations` | Investment recommendations |
| `GET` | `/settings` | Get app settings |
| `PUT` | `/settings` | Update app settings |
| `POST` | `/settings/clear-data` | Clear uploaded analytics data |

More route details are available in `server/src/routes/`.

## CSV Uploads

The app supports CSV upload for:

- Sales data: `POST /api/sales/upload`
- Inventory data: `POST /api/inventory/upload`

The backend detects useful fields such as dates, revenue, quantity, category, customer, product, stock, threshold, warehouse, and SKU where possible.

## MongoDB Setup

### Option A: Local MongoDB

1. Install MongoDB Community Server.
2. Start the MongoDB service.
3. Check that `mongosh` connects successfully.
4. Use this connection string:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/business_analytics
```

### Option B: MongoDB Atlas

1. Create a free MongoDB Atlas cluster.
2. Create a database user.
3. Allow your current IP address.
4. Copy the Atlas connection string into `server/.env`.

### Option C: In-Memory Development Database

If MongoDB is not available locally, the server attempts to use an in-memory MongoDB instance for development. This is useful for quick testing, but the data is temporary.

## Port Configuration

| Service | Default Port | Config |
| --- | --- | --- |
| Frontend | `5173` | `client/vite.config.ts` or `PORT` |
| Backend | `5000` | `server/.env` -> `PORT` |
| MongoDB | `27017` | `server/.env` -> `MONGODB_URI` |

If the backend port changes, update the frontend API target with `VITE_API_URL`.

## Troubleshooting

### Frontend Shows No Data

- Make sure the backend is running on `http://localhost:5000`.
- Open `http://localhost:5000/api/healthz` and check for a healthy response.
- Run `npm run seed` from the `server` folder.

### MongoDB Connection Fails

- Check that MongoDB is installed and running.
- Check `MONGODB_URI` in `server/.env`.
- Try a MongoDB Atlas connection string if local MongoDB is not working.

### Port Already in Use

- Change `PORT` in `server/.env` for the backend.
- Change `PORT` or `VITE_API_URL` for the frontend if needed.

### Client Build Errors

- Make sure Node.js 20+ is installed.
- Delete `client/node_modules`, then run `npm install` again inside `client`.

### CORS Errors

- Set this in `server/.env`:

```env
CLIENT_URL=http://localhost:5173
```

## Notes

- The seed data is stored in `server/src/seeds/datasets.js`.
- The main seed runner is `server/src/seeds/index.js`.
- `server/src/seeds/test-forecasting.js` is mainly for validating forecasting behavior.
- The frontend production build is generated in `client/dist/`.

## License

MIT
