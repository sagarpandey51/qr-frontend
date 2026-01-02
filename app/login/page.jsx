const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Load environment variables
dotenv.config();

const app = express();

// ========== ENVIRONMENT CONFIG ==========
const isProduction = process.env.NODE_ENV === "production";
const isVercel = process.env.VERCEL === "1";

console.log(`🚀 Environment: ${isProduction ? "Production" : "Development"}`);
console.log(`🌍 Platform: ${isVercel ? "Vercel" : "Local"}`);

// ========== CORS CONFIGURATION ==========
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://qr-attendance-frontend.vercel.app"
  ],
  credentials: true
}));


// Request logging middleware
app.use((req, res, next) => {
  console.log(`\n📨 ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  console.log(`📍 Origin: ${req.headers.origin || "No origin"}`);
  console.log(`🌐 Host: ${req.headers.host}`);
  
  if (req.method !== "GET" && req.body && Object.keys(req.body).length > 0) {
    console.log('📝 Body:', JSON.stringify(req.body, null, 2));
  }
  
  next();
});

// Body parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ========== DATABASE CONNECTION ==========
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error("❌ MONGODB_URI is not defined in environment variables");
      if (isVercel) {
        console.error("⚠️ Please add MONGODB_URI to your Vercel environment variables");
      }
      return;
    }
    
    console.log(`🔌 Connecting to MongoDB...`);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("✅ MongoDB connected successfully");
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.log("⚠️ Running without database connection");
  }
};

connectDB();

// ========== BASIC TEST ENDPOINTS ==========
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "QR Attendance API is running 🚀",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

app.get("/api/test", (req, res) => {
  console.log("✅ /api/test endpoint hit");
  res.json({
    success: true,
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
    headers: req.headers,
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbConnected = dbStatus === 1;
  
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: isVercel,
    database: {
      status: dbConnected ? "connected" : "disconnected",
      readyState: dbStatus
    },
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// ========== LOAD ROUTES ==========
console.log("\n📋 Loading routes...");

const routes = [
  { path: "./routes/auth", name: "auth", endpoint: "/api/auth" },
  { path: "./routes/qr", name: "qr", endpoint: "/api/qr" },
  { path: "./routes/attendance", name: "attendance", endpoint: "/api/attendance" },
  { path: "./routes/institution", name: "institution", endpoint: "/api/institution" },
  { path: "./routes/student", name: "student", endpoint: "/api/students" },
  { path: "./routes/teacher", name: "teacher", endpoint: "/api/teachers" }
];

routes.forEach(route => {
  try {
    if (fs.existsSync(`${route.path}.js`) || fs.existsSync(`${route.path}/index.js`)) {
      const routeModule = require(route.path);
      app.use(route.endpoint, routeModule);
      console.log(`✅ ${route.name} route mounted at ${route.endpoint}`);
    } else {
      console.warn(`⚠️ ${route.name} route file not found, creating fallback`);
      
      // Create fallback route
      const router = express.Router();
      
      // All methods fallback
      router.all("*", (req, res) => {
        res.status(501).json({
          success: false,
          message: `${route.name} route is not implemented`,
          endpoint: `${req.method} ${req.originalUrl}`,
          suggestion: "Check if route file exists in /routes directory"
        });
      });
      
      app.use(route.endpoint, router);
    }
  } catch (error) {
    console.error(`❌ Error loading ${route.name} route:`, error.message);
    
    // Create error route
    const router = express.Router();
    router.all("*", (req, res) => {
      res.status(500).json({
        success: false,
        error: `Error loading ${route.name} route`,
        message: error.message
      });
    });
    
    app.use(route.endpoint, router);
  }
});

// ========== TEST REGISTRATION ENDPOINTS ==========
app.post("/api/test-register", (req, res) => {
  console.log("📝 Test registration received");
  
  const { name, email, role = "student", institutionCode } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: "Name and email are required"
    });
  }
  
  res.status(201).json({
    success: true,
    message: "Test registration successful",
    data: {
      user: {
        id: "test_" + Date.now(),
        name,
        email,
        role,
        institutionCode: institutionCode || "TEST001",
        createdAt: new Date().toISOString()
      }
    }
  });
});

// ========== ERROR HANDLING ==========
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    requested: `${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      "GET /api",
      "GET /api/health",
      "GET /api/test",
      "POST /api/test-register"
    ]
  });
});

app.use((err, req, res, next) => {
  console.error("🚨 Error:", err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    error: "Internal server error",
    message: isProduction ? "Something went wrong" : err.message,
    stack: isProduction ? undefined : err.stack
  });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;

// For Vercel, we need to export the app
if (isVercel) {
  module.exports = app;
} else {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 ========== SERVER STARTED ==========`);
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Local: http://localhost:${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
    console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
    console.log(`====================================\n`);
  });
}