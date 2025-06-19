const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log("✅ MongoDB Connected Successfully");
})
.catch((err) => {
  console.error("❌ MongoDB Connection Error:", err);
  process.exit(1);
});

// Mental Health Data API
app.get("/api/mental-health", async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database not connected");
    }

    const data = await mongoose.connection
      .collection("mental_health_data")
      .find({})
      .limit(100)
      .toArray();
    
    if (!data || data.length === 0) {
      return res.status(404).json({ 
        error: "No mental health data found",
        message: "The database is empty or the collection doesn't exist"
      });
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching mental health data:", error);
    res.status(500).json({ 
      error: "Failed to fetch mental health data",
      message: error.message
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🔍 Health check available at http://localhost:${PORT}/api/health`);
}); 