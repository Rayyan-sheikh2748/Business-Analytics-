# Business Analytics Dashboard — Run Guide

Premium UI redesign is in the **`client/`** folder. Backend API is in **`server/`**.

## Prerequisites

- Node.js 18+ (22 recommended)
- MongoDB running locally **or** set `MONGODB_URI` in `server/.env`

## Quick start (two terminals)

### Terminal 1 — API (port 5000)

```bash
cd server
npm install
npm run server
```

Optional: seed sample data

```bash
npm run seed
```

### Terminal 2 — Frontend (port 5173)

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** (Vite may use 5174 if 5173 is busy).

The client proxies `/api` to `http://localhost:5000` (see `client/vite.config.ts`).

## Production build

```bash
cd client
npm run build
npm run preview
```

## Environment

Create `server/.env` (optional):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/business_analytics
CLIENT_URL=http://localhost:5173
```

## Zip package

A source zip without `node_modules` can be created from the project root:

```powershell
tar -a -cf Business-Analytics-MERN-Premium-UI.zip --exclude=node_modules --exclude=dist --exclude=.git -C .. Business-Analytics-MERN
```

After extracting, run `npm install` in both `server` and `client`.
