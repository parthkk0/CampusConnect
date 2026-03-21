const express = require("express");
const router = express.Router();
const Announcement = require("../Model/Announcement");

// GET ALL ANNOUNCEMENTS (Public - for students)
router.get("/", async (req, res) => {
    try {
        const announcements = await Announcement.find({}).sort({ createdAt: -1 });
        res.json({ success: true, announcements });
    } catch (error) {
        console.error("Get announcements error:", error);
        res.status(500).json({ error: "Failed to fetch announcements" });
    }
});

// POST NEW ANNOUNCEMENT (Admin only)
router.post("/", async (req, res) => {
    try {
        const { title, content, attachmentType, attachmentUrl, attachmentName, postedBy } = req.body;

        if (!title || !postedBy) {
            return res.status(400).json({ error: "Title and postedBy are required" });
        }

        const newAnnouncement = new Announcement({
            title,
            content: content || '',
            attachmentType: attachmentType || 'none',
            attachmentUrl: attachmentUrl || '',
            attachmentName: attachmentName || '',
            postedBy
        });

        await newAnnouncement.save();
        res.json({ success: true, message: "Announcement posted successfully", announcement: newAnnouncement });

    } catch (error) {
        console.error("Post announcement error:", error);
        res.status(500).json({ error: "Failed to post announcement" });
    }
});

// DELETE ANNOUNCEMENT (Admin only)
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return res.status(404).json({ error: "Announcement not found" });
        }

        await Announcement.findByIdAndDelete(id);
        res.json({ success: true, message: "Announcement deleted successfully" });

    } catch (error) {
        console.error("Delete announcement error:", error);
        res.status(500).json({ error: "Failed to delete announcement" });
    }
});

module.exports = router;
