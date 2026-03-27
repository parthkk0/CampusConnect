const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('./src/Model/Student');
require('dotenv').config();

const MONGO_URI = "mongodb+srv://parthkadam1941_db_user:lOmSPqul5Fy80tt0@cluster0.zjcfrlf.mongodb.net/?retryWrites=true&w=majority";

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    const existing = await Student.findOne({ roll: "1" });
    if (existing) {
      console.log("Test student already exists. Updating password...");
      existing.password = await bcrypt.hash("User@123", 10);
      existing.approvalStatus = "approved";
      existing.isPreRegistered = true;
      await existing.save();
    } else {
      console.log("Creating new test student...");
      const hashedPassword = await bcrypt.hash("User@123", 10);
      const newStudent = new Student({
        roll: "1",
        name: "Test Student (Recruiter)",
        email: "test_recruiter@campusconnect.com",
        password: hashedPassword,
        course: "Computer Science",
        year: "3",
        isPreRegistered: true,
        approvalStatus: "approved",
        walletBalance: 500
      });
      await newStudent.save();
    }

    console.log("✅ Seed successful!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
};

seed();
