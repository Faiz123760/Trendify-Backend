import express from "express";
import fs from "fs";
import cors from "cors";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';
import connectDB from "./config/mongodb.js";
import orderRouter from "./routes/orderRoute.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import wishlistRouter from "./routes/wishlistRoute.js";
import dns from 'node:dns';

// Fix for Node.js 18+ DNS resolution issues with Atlas
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// Connect to Database
connectDB();
connectCloudinary();

// Middlewares
app.use(helmet({
    contentSecurityPolicy: false, // Set to false to allow external CDNs if needed, or configure specifically
}));
app.use(compression());
app.use(express.json());
app.use(cors());

// API endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/wishlist", wishlistRouter);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Trendify API is healthy" });
});

// Deployment Readiness: Serve Static Files in Production
// Assuming frontend and admin are built into their respective dist folders
if (process.env.NODE_ENV === 'production') {
    const adminPath = path.join(__dirname, '../Trendify-admin/dist');
    const frontendPath = path.join(__dirname, '../Trendify-frontend/dist');

    if (fs.existsSync(adminPath)) {
        app.use('/admin', express.static(adminPath));
    }
    
    if (fs.existsSync(frontendPath)) {
        app.use(express.static(frontendPath));
        app.get('/:path*', (req, res) => {
            if (req.url.startsWith('/api')) return; 
            res.sendFile(path.join(frontendPath, 'index.html'));
        });
    }
}

// Fallback for root path
app.get("/", (req, res) => {
    res.send("API Working");
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
