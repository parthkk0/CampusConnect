const express = require("express");
const router = express.Router();
const LostFound = require("../Model/Lost&Found");

// GET ALL ITEMS
router.get("/", async (req, res) => {
    try {
        const { type } = req.query; // ?type=lost or ?type=found
        const filter = type ? { type, status: 'open' } : { status: 'open' };

        const items = await LostFound.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, items });
    } catch (error) {
        console.error("Get items error:", error);
        res.status(500).json({ error: "Failed to fetch items" });
    }
});

// REPORT ITEM
router.post("/", async (req, res) => {
    try {
        const { type, title, description, image, location, date, contactPhone, reportedBy } = req.body;

        if (!type || !title || !location || !date) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newItem = new LostFound({
            type,
            title,
            description,
            image,
            location,
            date,
            contactPhone,
            reportedBy
        });

        await newItem.save();
        res.json({ success: true, message: "Item reported successfully", item: newItem });

    } catch (error) {
        console.error("Report item error:", error);
        res.status(500).json({ error: "Failed to report item" });
    }
});

// MARK AS RESOLVED
router.put("/:id/resolve", async (req, res) => {
    try {
        const { id } = req.params;
        const { userRoll } = req.body; // Expect userRoll to verify ownership

        const item = await LostFound.findById(id);
        if (!item) return res.status(404).json({ error: "Item not found" });

        // Verify Ownership
        if (item.reportedBy !== userRoll) {
            return res.status(403).json({ error: "Unauthorized: You can only resolve items you reported" });
        }

        item.status = 'resolved';
        await item.save();

        res.json({ success: true, message: "Item marked as resolved" });
    } catch (error) {
        console.error("Resolve item error:", error);
        res.status(500).json({ error: "Failed to resolve item" });
    }
});

// CLAIM ITEM (React)
router.post("/:id/claim", async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId, name } = req.body;

        const item = await LostFound.findById(id);
        if (!item) return res.status(404).json({ error: "Item not found" });

        // Check if already claimed by this student
        const alreadyClaimed = item.claims.some(c => c.studentId === studentId);
        if (alreadyClaimed) {
            return res.status(400).json({ error: "You have already claimed this item" });
        }

        item.claims.push({ studentId, name });
        await item.save();

        res.json({ success: true, message: "Claim submitted", claims: item.claims });
    } catch (error) {
        console.error("Claim error:", error);
        res.status(500).json({ error: "Failed to submit claim" });
    }
});

// DELETE ITEM
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { userRoll } = req.query; // Secure delete using query + check

        const item = await LostFound.findById(id);
        if (!item) return res.status(404).json({ error: "Item not found" });

        // Verify Ownership
        if (item.reportedBy !== userRoll) {
            return res.status(403).json({ error: "Unauthorized: You can only delete items you reported" });
        }

        await LostFound.findByIdAndDelete(id);
        res.json({ success: true, message: "Item deleted" });
    } catch (error) {
        console.error("Delete item error:", error);
        res.status(500).json({ error: "Failed to delete item" });
    }
});

// ===== ADMIN ROUTES =====

// ADMIN: GET ALL ITEMS (including resolved)
router.get("/admin/all", async (req, res) => {
    try {
        const items = await LostFound.find({}).sort({ createdAt: -1 });
        res.json({ success: true, items });
    } catch (error) {
        console.error("Admin get all items error:", error);
        res.status(500).json({ error: "Failed to fetch items" });
    }
});

// ADMIN: DELETE ANY ITEM (no ownership check)
router.delete("/admin/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const item = await LostFound.findById(id);
        if (!item) return res.status(404).json({ error: "Item not found" });

        await LostFound.findByIdAndDelete(id);
        res.json({ success: true, message: "Item deleted by admin" });
    } catch (error) {
        console.error("Admin delete item error:", error);
        res.status(500).json({ error: "Failed to delete item" });
    }
});

module.exports = router;

