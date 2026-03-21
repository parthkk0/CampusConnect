const mongoose = require('mongoose');
const fs = require('fs');
async function test() {
    await mongoose.connect('mongodb://parthkadam1941_db_user:parth123@ac-ibcufcn-shard-00-00.zjcfrlf.mongodb.net:27017,ac-ibcufcn-shard-00-01.zjcfrlf.mongodb.net:27017,ac-ibcufcn-shard-00-02.zjcfrlf.mongodb.net:27017/?ssl=true&replicaSet=atlas-f0gr84-shard-0&authSource=admin&retryWrites=true&w=majority');

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
