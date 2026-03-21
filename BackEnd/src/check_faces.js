require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("./Model/Student");

async function checkFaces() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ DB Connected");

        const totalStudents = await Student.countDocuments();
        const studentsWithFace = await Student.countDocuments({ faceEmbedding: { $exists: true, $not: { $size: 0 } } });

        console.log(`Total Students: ${totalStudents}`);
        console.log(`Students with Locked Face Data: ${studentsWithFace}`);

        if (totalStudents > 0 && studentsWithFace === 0) {
            console.log("⚠️ It appears all face embeddings are missing.");
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
}

checkFaces();
