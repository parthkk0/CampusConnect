require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// Default route
app.get("/", (req, res) => {
  res.send("Backend is live");
});

// MongoDB Connection
const MONGO_URI_BYPASS = "mongodb://parthkadam1941_db_user:parth123@ac-ibcufcn-shard-00-00.zjcfrlf.mongodb.net:27017,ac-ibcufcn-shard-00-01.zjcfrlf.mongodb.net:27017,ac-ibcufcn-shard-00-02.zjcfrlf.mongodb.net:27017/?ssl=true&replicaSet=atlas-f0gr84-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose
  .connect(process.env.MONGO_URI || MONGO_URI_BYPASS)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    console.log("🔄 Retrying MongoDB connection in 5 seconds...");
    setTimeout(() => {
      mongoose.connect(process.env.MONGO_URI || MONGO_URI_BYPASS)
        .then(() => console.log("✅ MongoDB Connected on retry"))
        .catch((retryErr) => console.error("❌ MongoDB retry failed:", retryErr.message));
    }, 5000);
  })



// Routes
const paymentRoutes = require("./routes/payment");
const faceRoutes = require("./routes/faceRoutes");
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const lostFoundRoutes = require("./routes/lostFoundRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const courseRoutes = require("./routes/courseRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const noteRoutes = require("./routes/noteRoutes");

app.use("/api/pay", paymentRoutes);
app.use("/api/face", faceRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/lost-found", lostFoundRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/notes", noteRoutes);

// Global error handler - catches any unhandled errors in routes
app.use((err, req, res, next) => {
  console.error("💥 Unhandled Error:", err.message);
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error", details: err.message });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection:', reason);
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
