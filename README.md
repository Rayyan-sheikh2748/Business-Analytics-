# Business Analytics — MERN Stack

A production-ready Business Analytics Dashboard built with **MongoDB**, **Express**, **React**, and **Node.js**.

## Features

- **Dashboard** — KPI cards, revenue charts, category breakdown, recent orders, inventory status, AI insights
- **Sales** — Full CRUD, CSV export/import, filters, pagination
- **Inventory** — Product management, low-stock alerts, stock movements
- **Forecasting** — Demand forecasting, model comparison, heatmap
- **Reports** — Generate and export CSV/PDF reports
- **Customers** — Segments (VIP/Premium/Regular/New), location analytics
- **Settings** — Business profile, notifications, theme preferences

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 6, TailwindCSS 4, Framer Motion, Recharts, TanStack Query |
| Backend | Express 4, Node.js, Mongoose |
| Database | MongoDB |
| Validation | Zod |

## Project Structure

```
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── components/     # Layout, StatCard, UI primitives
│       ├── pages/          # Dashboard, Sales, Inventory, etc.
│       └── lib/api-client/ # API hooks (React Query)
├── server/                 # Express + MongoDB backend
│   └── src/
│       ├── config/         # DB & env configuration
│       ├── controllers/    # Route handlers
│       ├── models/         # Mongoose schemas
│       ├── routes/         # API routes
│       ├── middleware/     # Error handling, validation
│       ├── services/       # Business logic
│       ├── seeds/          # Multi-dataset seed scripts
│       └── utils/          # Helpers
└── README.md
```

---

## Local Setup (VS Code)

### Prerequisites

- **Node.js 20+** — [nodejs.org](https://nodejs.org)
- **MongoDB 6+** — [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)  
  Or use [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)

### 1. Clone & Install

```bash
git clone https://github.com/Rayyan-sheikh2748/Business-Analytics-.git
cd Business-Analytics-

# Backend
cd server
npm install

# Frontend (new terminal)
cd ../client
npm install
```

### 2. Environment Variables

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/business_analytics
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

For **MongoDB Atlas**, replace `MONGODB_URI` with your connection string:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/business_analytics
```

> If MongoDB is not installed locally, the server automatically falls back to an in-memory database for development.

### 3. Seed the Database

```bash
cd server

# Grocery shop (default)
npm run seed

# Other datasets
npm run seed:electronics
npm run seed:bakery
npm run seed:retail
```

### 4. Start Backend (Terminal 1)

```bash
cd server
npm run server
```

API runs at **http://localhost:5000**

### 5. Start Frontend (Terminal 2)

```bash
cd client
npm run dev
```

Open **http://localhost:5173**

---

## Commands Reference

| Location | Command | Description |
|----------|---------|-------------|
| `server/` | `npm run server` | Start dev server with hot reload |
| `server/` | `npm start` | Start production server |
| `server/` | `npm run seed` | Seed grocery dataset |
| `server/` | `npm run seed:electronics` | Seed electronics shop data |
| `server/` | `npm run seed:bakery` | Seed bakery shop data |
| `server/` | `npm run seed:retail` | Seed retail analytics data |
| `client/` | `npm run dev` | Start Vite dev server |
| `client/` | `npm run build` | Production build |
| `client/` | `npm run preview` | Preview production build |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/healthz` | Health check |
| GET | `/api/dashboard/stats` | Dashboard KPIs |
| GET | `/api/sales` | Paginated sales list |
| POST | `/api/sales` | Create sale |
| GET | `/api/inventory` | Paginated inventory |
| GET | `/api/customers` | Paginated customers |
| GET | `/api/reports` | Report data |
| GET | `/api/forecasting/forecast` | Demand forecast |
| GET/PUT | `/api/settings` | App settings |

Full API documentation is available in the codebase under `server/src/routes/`.

---

## MongoDB Setup

### Option A: Local MongoDB (Windows)

1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install and start the MongoDB service
3. Verify: `mongosh` connects successfully
4. Use `MONGODB_URI=mongodb://127.0.0.1:27017/business_analytics`

### Option B: MongoDB Atlas (Cloud)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user and whitelist your IP (or `0.0.0.0/0` for dev)
3. Copy the connection string into `server/.env`

### Option C: No MongoDB Installed

The server auto-falls back to an in-memory MongoDB when local connection fails.  
Data is lost on restart — use for quick testing only.

---

## Port Configuration

| Service | Default Port | Config |
|---------|-------------|--------|
| Frontend | 5173 | `client/vite.config.ts` or `PORT` env |
| Backend | 5000 | `server/.env` → `PORT` |
| MongoDB | 27017 | `server/.env` → `MONGODB_URI` |

---

## Troubleshooting

**Frontend shows no data**
- Ensure backend is running on port 5000
- Check http://localhost:5000/api/healthz returns `{"status":"ok"}`
- Run `npm run seed` in the server folder

**MongoDB connection fails**
- Verify MongoDB service is running: `services.msc` → MongoDB
- Check `MONGODB_URI` in `server/.env`
- Try Atlas connection string if local install fails

**Port already in use**
- Change `PORT` in `server/.env` and update `VITE_API_URL` in client if needed

**Build errors in client**
- Delete `client/node_modules` and run `npm install` again
- Ensure Node.js 20+ is installed

**CORS errors**
- Set `CLIENT_URL=http://localhost:5173` in `server/.env`

---

## Design System

- **Primary accent:** `#a0aecd`
- **Primary dark:** `#000000`
- **Typography:** DM Sans
- **Animations:** Framer Motion (page transitions, stat cards, hover effects)

---

## License

MIT
