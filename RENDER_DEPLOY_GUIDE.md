# Render Deployment Guide — Business Analytics Dashboard

This guide walks you through deploying all 3 services (ML Service, Backend, Frontend) on Render, step by step.

> **Order matters!** Deploy in this order: ML Service → Backend → Frontend

---

## Prerequisites

- A [Render account](https://render.com) (free tier works)
- A [MongoDB Atlas cluster](./MONGODB_ATLAS_GUIDE.md) with connection string ready
- This repository pushed to a GitHub/GitLab repository

---

## Step 1: Push Code to GitHub

1. Go to [github.com/new](https://github.com/new) and create a new repository (e.g. `business-analytics`).
2. In your terminal, run:
   ```bash
   cd <project-root>
   git init
   git add .
   git commit -m "Production deployment ready"
   git remote add origin https://github.com/YOUR_USERNAME/business-analytics.git
   git push -u origin main
   ```

---

## Step 2: Deploy the Python ML Service

1. Go to [Render Dashboard](https://dashboard.render.com) → Click **New +** → **Web Service**.
2. Connect your GitHub account and select your repository.
3. Configure the service:
   - **Name**: `business-analytics-ml-service`
   - **Root Directory**: `ml-service`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
4. Click **Create Web Service**.
5. Wait for the deploy to finish (takes 3–5 min).
6. Once deployed, copy the URL. It will look like:
   ```
   https://business-analytics-ml-service.onrender.com
   ```
7. **Test it**: Open `https://business-analytics-ml-service.onrender.com/health` in your browser. You should see:
   ```json
   {"status": "healthy", "service": "Business Analytics ML Service"}
   ```

---

## Step 3: Deploy the Node.js Backend

1. Go to [Render Dashboard](https://dashboard.render.com) → Click **New +** → **Web Service**.
2. Select the same repository.
3. Configure the service:
   - **Name**: `business-analytics-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
4. Add **Environment Variables** (click "Advanced" → "Add Environment Variable"):

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `MONGODB_URI` | `mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/business_analytics?retryWrites=true&w=majority` |
   | `JWT_SECRET` | Any random string, e.g. `f8e8156db74cf16a048a1d13b28b7e28` |
   | `ML_API_URL` | The ML Service URL from Step 2, e.g. `https://business-analytics-ml-service.onrender.com` |
   | `CLIENT_URL` | Leave empty for now, fill after Step 4 |

5. Click **Create Web Service**.
6. Wait for the deploy to finish.
7. Copy the backend URL. It will look like:
   ```
   https://business-analytics-backend.onrender.com
   ```
8. **Test it**: Open `https://business-analytics-backend.onrender.com/api/health` in your browser.

---

## Step 4: Deploy the React Frontend (Static Site)

1. Go to [Render Dashboard](https://dashboard.render.com) → Click **New +** → **Static Site**.
2. Select the same repository.
3. Configure the site:
   - **Name**: `business-analytics-frontend`
   - **Root Directory**: *(leave empty — use repo root)*
   - **Build Command**: `npm install -g pnpm && pnpm install && cd client && npx vite build`
   - **Publish Directory**: `client/dist`
4. Add **Environment Variable**:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | The Backend URL from Step 3, e.g. `https://business-analytics-backend.onrender.com` |

5. Under **Redirects/Rewrites**, add a rule to support client-side routing:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`

6. Click **Create Static Site**.
7. Wait for the deploy to finish.
8. Copy the frontend URL. It will look like:
   ```
   https://business-analytics-frontend.onrender.com
   ```

---

## Step 5: Update Backend CLIENT_URL

1. Go back to the **business-analytics-backend** service on Render.
2. Click **Environment** in the sidebar.
3. Set `CLIENT_URL` to your frontend URL from Step 4 (e.g. `https://business-analytics-frontend.onrender.com`).
4. Click **Save Changes** — Render will auto-redeploy.

---

## Step 6: Verify Everything Works

1. Open the **Frontend URL** in your browser.
2. Login with default credentials:
   - **Admin**: `admin@businessanalytics.com` / `admin123`
   - **User**: `user@businessanalytics.com` / `user123`
3. Test each feature:
   - ✅ Dashboard loads with stats
   - ✅ Sales page — upload CSV, create/edit/delete sales
   - ✅ Inventory page — upload CSV, manage products
   - ✅ Forecasting page — generate ARIMA/Random Forest forecasts
   - ✅ Reports page — view analytics reports
   - ✅ Customers page — view/manage customers
   - ✅ Settings page — configure application settings

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Frontend shows blank page | Check VITE_API_URL is set correctly. Ensure rewrite rule is added. |
| "Network Error" on login | Verify backend is deployed and VITE_API_URL points to correct URL. |
| ML forecast shows fallback data | Verify ML_API_URL is set on backend. Check ML service logs on Render. |
| MongoDB connection fails | Verify MONGODB_URI. Ensure Atlas IP whitelist includes `0.0.0.0/0`. |
| Free tier cold starts | Render free tier spins down after 15 min of inactivity. First request takes ~30s. |

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@businessanalytics.com` | `admin123` |
| User | `user@businessanalytics.com` | `user123` |

These are auto-seeded when the backend starts with an empty database.
