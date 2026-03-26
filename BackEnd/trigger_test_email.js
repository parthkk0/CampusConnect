require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Student = require('./src/Model/Student');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    let student = await Student.findOne({ roll: 'TEST001' });
    if (!student) {
        student = new Student({
            roll: 'TEST001',
            name: 'Test Account',
            email: 'campusconnect6209@gmail.com',
            course: 'Testing',
            year: 1,
            approvalStatus: 'approved'
        });
        await student.save();
    } else {
        student.email = 'campusconnect6209@gmail.com';
        await student.save();
    }
    
    console.log("Registered test student TEST001 linked to campusconnect6209@gmail.com");

    try {
        const response = await axios.post('http://localhost:5000/api/students/forgot-password/send-otp', {
            roll: 'TEST001'
        });
        console.log("Backend API Response:", response.data.message);
        console.log("\n✅ SUCCESS! Google accepted the App Password and delivered the email!");
    } catch (err) {
        console.error("❌ FAILED:", err.response ? err.response.data : err.message);
    }
    
    process.exit(0);
}).catch(console.error);
