require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./src/Model/Admin');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await Admin.findOneAndUpdate({ username: 'admin' }, { password: hashedPassword });
    console.log("Admin password reset to 'admin123'");
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
