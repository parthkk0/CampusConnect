const express = require("express");
const router = express.Router();
const Notification = require("../Model/Notification");

// GET ALL NOTIFICATIONS
router.get("/", async (req, res) => {
    try {
        const notifications = await Notification.find({}).sort({ createdAt: -1 });
        res.json({ success: true, notifications });
    } catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

// MARK NOTIFICATION AS READ
router.patch("/:id/read", async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { isRead: true });
        res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
        console.error("Mark read error:", error);
        res.status(500).json({ error: "Failed to update notification" });
    }
});

// MARK ALL AS READ
router.patch("/read-all", async (req, res) => {
    try {
        await Notification.updateMany({ isRead: false }, { isRead: true });
        res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        console.error("Mark all read error:", error);
        res.status(500).json({ error: "Failed to update notifications" });
    }
});

// DELETE NOTIFICATION (Optional cleanup)
router.delete("/:id", async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Notification deleted" });
    } catch (error) {
        res.status(500).json({ error: "Delete failed" });
    }
});

module.exports = router;
