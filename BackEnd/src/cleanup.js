require("dotenv").config();
const mongoose = require("mongoose");
const LostFound = require("./Model/Lost&Found");

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ DB Connected");

        // Find and delete
        const result = await LostFound.deleteMany({ title: { $regex: 'watch', $options: 'i' } });
        console.log(`🗑️ Deleted ${result.deletedCount} items with 'watch' in title.`);

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
}

cleanup();
