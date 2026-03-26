const express = require("express");
const router = express.Router();
const Course = require("../Model/Course");

// GET ALL COURSES
router.get("/", async (req, res) => {
    try {
        const courses = await Course.find({ isActive: true }).sort({ name: 1 });
        res.json({ success: true, courses });
    } catch (error) {
        console.error("Get courses error:", error);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
});

// GET SINGLE COURSE
router.get("/:id", async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }
        res.json({ success: true, course });
    } catch (error) {
        console.error("Get course error:", error);
        res.status(500).json({ error: "Failed to fetch course" });
    }
});

// CREATE COURSE (Admin)
router.post("/", async (req, res) => {
    try {
        const { name, code, description, totalYears } = req.body;

        if (!name || !code || !totalYears) {
            return res.status(400).json({ error: "Name, code, and totalYears are required" });
        }

        // Check if code already exists
        const existing = await Course.findOne({ code: code.toUpperCase() });
        if (existing) {
            return res.status(400).json({ error: "Course code already exists" });
        }

        const course = new Course({
            name,
            code: code.toUpperCase(),
            description: description || '',
            totalYears
        });

        await course.save();
        res.json({ success: true, message: "Course created successfully", course });

    } catch (error) {
        console.error("Create course error:", error);
        res.status(500).json({ error: error.message || "Failed to create course" });
    }
});

// UPDATE COURSE (Admin)
router.put("/:id", async (req, res) => {
    try {
        const { name, description, totalYears, isActive } = req.body;

        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        if (name) course.name = name;
        if (description !== undefined) course.description = description;
        if (totalYears) course.totalYears = totalYears;

        if (isActive !== undefined) course.isActive = isActive;

        await course.save();
        res.json({ success: true, message: "Course updated successfully", course });

    } catch (error) {
        console.error("Update course error:", error);
        res.status(500).json({ error: "Failed to update course" });
    }
});

// DELETE COURSE (Admin)
router.delete("/:id", async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        await Course.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Course deleted successfully" });

    } catch (error) {
        console.error("Delete course error:", error);
        res.status(500).json({ error: "Failed to delete course" });
    }
});

module.exports = router;
