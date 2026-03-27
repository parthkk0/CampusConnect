const mongoose = require('mongoose');
const Student = require('./src/Model/Student');
require('dotenv').config();

const MONGO_URI = "mongodb+srv://parthkadam1941_db_user:lOmSPqul5Fy80tt0@cluster0.zjcfrlf.mongodb.net/?retryWrites=true&w=majority";

const check = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    // Find all students for debugging (limit to 10)
    const students = await Student.find({}, 'roll name email isPreRegistered approvalStatus').limit(10);
    console.log("Current Students in DB:");
    console.table(students.map(s => ({
        roll: s.roll,
        name: s.name,
        isPre: s.isPreRegistered,
        status: s.approvalStatus
    })));

    process.exit(0);
  } catch (err) {
    console.error("❌ Failed:", err);
    process.exit(1);
  }
};

check();
