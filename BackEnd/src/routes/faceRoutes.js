const express = require("express");
const router = express.Router();
const axios = require("axios");
const Student = require("../Model/Student");

const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || "http://127.0.0.1:8000";
const FACE_SERVICE_TIMEOUT = 30000; // 30 second timeout for face service calls
const FACE_SERVICE_RETRY_COUNT = 3;
const FACE_SERVICE_RETRY_DELAY = 2000; // 2 seconds between retries

// Helper: wait for ms
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper: make requests to face service with timeout, retry, and error handling
async function callFaceService(endpoint, data) {
  let lastError = null;

  for (let attempt = 1; attempt <= FACE_SERVICE_RETRY_COUNT; attempt++) {
    try {
      const response = await axios.post(
        `${FACE_SERVICE_URL}${endpoint}`,
        data,
        { timeout: FACE_SERVICE_TIMEOUT, maxContentLength: 50 * 1024 * 1024 }
      );
      return response;
    } catch (error) {
      lastError = error;
      const isConnectionError = error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET';
      const isTimeout = error.code === 'ECONNABORTED';

      if (isConnectionError && attempt < FACE_SERVICE_RETRY_COUNT) {
        console.log(`⏳ FaceService not ready (attempt ${attempt}/${FACE_SERVICE_RETRY_COUNT}), retrying in ${FACE_SERVICE_RETRY_DELAY / 1000}s...`);
        await delay(FACE_SERVICE_RETRY_DELAY);
        continue;
      }

      if (isConnectionError) {
        throw new Error("Face Recognition Service is not running. Please start the FaceService (python app.py in FaceService folder).");
      }
      if (isTimeout) {
        throw new Error("Face Recognition Service timed out. Please try again.");
      }
      throw error;
    }
  }
  throw lastError;
}

// Startup health check - checks if FaceService is available
async function checkFaceServiceHealth() {
  for (let i = 0; i < 6; i++) {
    try {
      const res = await axios.get(`${FACE_SERVICE_URL}/health`, { timeout: 3000 });
      if (res.data.status === "healthy") {
        console.log("✅ FaceService is connected and healthy");
        return;
      }
    } catch (e) {
      // ignore
    }
    if (i < 5) {
      console.log(`⏳ Waiting for FaceService... (attempt ${i + 1}/6)`);
      await delay(5000);
    }
  }
  console.log("⚠️ FaceService not available yet. Face features will retry on first use.");
}

// Run health check on startup (non-blocking)
checkFaceServiceHealth();

// REGISTER FACE - Store face embedding in student record
router.post("/register", async (req, res) => {
  try {
    const { studentId, image } = req.body;

    if (!studentId || !image) {
      return res.status(400).json({
        error: "Missing studentId or image"
      });
    }

    // Find student
    const student = await Student.findOne({ roll: studentId });
    if (!student) {
      return res.status(404).json({
        error: "Student not found"
      });
    }

    // Call Face Service to generate embedding
    const faceServiceResponse = await callFaceService("/register-face", { userId: studentId, image });

    const { embedding } = faceServiceResponse.data;

    // Store embedding and profile photo in student record
    student.faceEmbedding = embedding;
    student.faceRegisteredAt = new Date();
    student.photoUrl = image; // Save captured face image as profile picture
    await student.save();

    res.json({
      success: true,
      message: "Face registered successfully",
      studentId: student.roll,
      studentName: student.name,
      photoUrl: student.photoUrl
    });

  } catch (error) {
    console.error("Face registration error:", error.message);

    if (error.response?.data?.error) {
      return res.status(400).json({
        error: error.response.data.error
      });
    }

    // Check for connection errors
    if (error.message.includes("Face Recognition Service")) {
      return res.status(503).json({ error: error.message });
    }

    res.status(500).json({
      error: error.message || "Face registration failed"
    });
  }
});

// VERIFY FACE - Compare live face with stored embedding
router.post("/verify", async (req, res) => {
  try {
    const { studentId, liveImage } = req.body;

    if (!studentId || !liveImage) {
      return res.status(400).json({
        error: "Missing studentId or liveImage"
      });
    }

    // Find student
    const student = await Student.findOne({ roll: studentId });
    if (!student) {
      return res.status(404).json({
        error: "Student not found"
      });
    }

    // Check if face is registered
    if (!student.faceEmbedding || student.faceEmbedding.length === 0) {
      return res.status(400).json({
        error: "No face registered for this student. Please register first."
      });
    }

    // Call Face Service to verify
    // Passes studentId so FaceService can audit-log each attempt per user
    const faceServiceResponse = await callFaceService("/verify-face", {
      storedEmbedding: student.faceEmbedding,
      liveImage,
      studentId
    });

    const { matched, match_score } = faceServiceResponse.data;

    if (matched) {
      res.json({
        success: true,
        matched: true,
        match_score: match_score ?? null,
        message: "Face verified successfully",
        student: {
          roll: student.roll,
          name: student.name,
          email: student.email,
          course: student.course,
          year: student.year,
          photoUrl: student.photoUrl
        }
      });
    } else {
      res.json({
        success: true,
        matched: false,
        match_score: match_score ?? null,
        message: "Face verification failed - face does not match"
      });
    }

  } catch (error) {
    console.error("Face verification error:", error.message);

    if (error.response?.data?.error) {
      return res.status(400).json({
        error: error.response.data.error
      });
    }

    // Check for connection errors
    if (error.message.includes("Face Recognition Service")) {
      return res.status(503).json({ error: error.message });
    }

    res.status(500).json({
      error: error.message || "Face verification failed"
    });
  }
});

// Check if student has registered face
router.get("/status/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findOne({ roll: studentId });
    if (!student) {
      return res.status(404).json({
        error: "Student not found"
      });
    }

    const hasFace = student.faceEmbedding && student.faceEmbedding.length > 0;

    res.json({
      success: true,
      studentId: student.roll,
      hasFaceRegistered: hasFace,
      faceRegisteredAt: student.faceRegisteredAt || null
    });

  } catch (error) {
    console.error("Face status check error:", error.message);
    res.status(500).json({
      error: error.message || "Failed to check face status"
    });
  }
});

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Face route working" });
});

module.exports = router;

