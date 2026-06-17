# MongoDB Atlas Deployment Guide

This guide is designed for developers who have no prior database deployment experience. It walks you through setting up a free MongoDB Atlas cluster, finding your connection string, creating the database collections, adding performance indexes, and linking MongoDB Atlas to your Render deployment.

---

## Step 1: Create a MongoDB Atlas Account and Cluster
1. Open your browser and navigate to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Register for a free account.
3. Once logged in, click **Create a Deployment** (or **Build a Database**).
4. Select the **M0 Shared (Free)** tier.
5. Choose your Cloud Provider (e.g., **AWS**) and a Region close to you (e.g., **Mumbai - ap-south-1** or **us-east-1**).
6. Click **Create** (this will spin up a free production-ready cluster).

---

## Step 2: Configure Database Access Security
You must set up a user and define who is allowed to connect to the database.

### 1. Create a Database User
1. When prompted for security setup, choose **Username and Password**.
2. Enter a username (e.g., `admin`).
3. Enter a strong password or click **Autogenerate Secure Password**.
4. **IMPORTANT**: Copy the username and password and keep them in a safe place. You will need them for the connection URL.
5. Click **Create Database User**.

### 2. Configure IP Access List (Network Access)
1. Under "Where would you like to connect from?", choose **My Local Environment**.
2. To allow Render's servers to connect without restrictions (since Render uses dynamic IPs on the free tier), add the IP Address `0.0.0.0/0` (this allows connections from anywhere).
   * *Note: The database is still protected by your strong username and password credentials.*
3. Click **Add IP Address** / **Add Entry**.
4. Click **Finish and Close**, then go to your Database Dashboard.

---

## Step 3: Copy Your MongoDB Connection String
1. On the Database Clusters dashboard, find your cluster and click the **Connect** button.
2. In the modal that opens, select **Drivers** (under "Connect to your application").
3. Set your Driver to **Node.js** and Version to **5.5 or later** (or the latest version).
4. Look for the connection string box. It will look like this:
   ```text
   mongodb+srv://admin:<db_password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
5. **Copy** this connection string.
6. Replace `<db_password>` with the database user password you created in Step 2.
7. Change the database name in the connection string by inserting `business_analytics` before the `?` character. For example:
   ```text
   mongodb+srv://admin:MySecurePassword123@cluster0.abcde.mongodb.net/business_analytics?retryWrites=true&w=majority&appName=Cluster0
   ```
8. Save this final URL as your `MONGODB_URI` environment variable.

---

## Step 4: Create Collections and Performance Indexes
When the Node.js backend starts, Mongoose will **automatically** connect, create the required database, create the collections, and build the default indexes. You do not need to execute raw database commands.

### Collections created automatically:
* `users`
* `products`
* `sales`
* `customers`
* `stockmovements`
* `settings`
* `datasetmetadatas`

### Indexes created automatically for production performance:
* Unique index on `users.email`
* Index on `products.legacyId`, `products.sku`, `products.name`, `products.category`
* Compound Index on `products` `{ category: 1, warehouse: 1 }`
* Index on `sales.invoiceId`, `sales.date`, `sales.customer`, `sales.product`, `sales.category`
* Compound Index on `sales` `{ date: -1, product: 1 }`
* Compound Index on `sales` `{ date: -1, category: 1 }`

---

## Step 5: How to Link MongoDB Atlas with Render
When deploying your Node.js backend on Render, you must configure the environment variables:

1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click on your deployed **business-analytics-backend** Web Service.
3. In the left sidebar, click **Environment**.
4. Under the **Environment Variables** section, click **Add Environment Variable**.
5. Add the following keys and values:
   * **Key**: `MONGODB_URI`
   * **Value**: *Paste the connection string you created in Step 3 (the one containing your password and the `business_analytics` database name).*
   * **Key**: `JWT_SECRET`
   * **Value**: *Provide a secure random string (e.g., `f8e8156db74cf16a048a1d13b28b7e28`).*
6. Click **Save Changes**.
7. Render will automatically redeploy the service, connect to MongoDB Atlas, and seed the default user credentials (`admin@businessanalytics.com` / `admin123`).
