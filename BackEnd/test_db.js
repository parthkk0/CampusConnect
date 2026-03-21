const mongoose = require('mongoose');
const fs = require('fs');
async function test() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error('Missing MONGO_URI environment variable');
    }
    await mongoose.connect(mongoUri);

    const student = await mongoose.connection.collection('students').findOne({ course: "BSC IT" });
    const course = await mongoose.connection.collection('courses').findOne({ name: "BSC IT" });
    let subjects = [];
    if (course) {
        subjects = await mongoose.connection.collection('subjects').find({ courseId: course._id }).toArray();
    }
    const allNotes = await mongoose.connection.collection('notes').find({}, { projection: { fileUrl: 0 } }).toArray();

    fs.writeFileSync('db_dump.json', JSON.stringify({ student, course, subjects, allNotes }, null, 2), 'utf-8');
    process.exit(0);
}
test();
