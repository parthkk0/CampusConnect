const express = require("express");
const router = express.Router();
const Subject = require("../Model/Subject");
const Course = require("../Model/Course");

// GET ALL SUBJECTS (with optional filters)
router.get("/", async (req, res) => {
    try {
        const { courseId, year, semester } = req.query;
        let filter = {};

        if (courseId) filter.courseId = courseId;
        if (year) filter.year = parseInt(year);
        if (semester) filter.semester = parseInt(semester);

        const subjects = await Subject.find(filter)
            .populate('courseId', 'name code')
            .sort({ year: 1, semester: 1, name: 1 });

        res.json({ success: true, subjects });
    } catch (error) {
        console.error("Get subjects error:", error);
        res.status(500).json({ error: "Failed to fetch subjects" });
    }
});

// GET SUBJECTS BY COURSE
router.get("/by-course/:courseId", async (req, res) => {
    try {
        const subjects = await Subject.find({ courseId: req.params.courseId })
            .sort({ year: 1, semester: 1, name: 1 });

        // Group by year and semester
        const grouped = {};
        subjects.forEach(sub => {
            const key = `Year ${sub.year} - Sem ${sub.semester}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(sub);
        });

        res.json({ success: true, subjects, grouped });
    } catch (error) {
        console.error("Get subjects by course error:", error);
        res.status(500).json({ error: "Failed to fetch subjects" });
    }
});

// GET SUBJECTS FOR STUDENT (based on course, year, semester)
router.get("/for-student", async (req, res) => {
    try {
        const { course, year, semester } = req.query;

        if (!course || !semester) {
            return res.status(400).json({ error: "Course and semester are required" });
        }

        // Find the course by name or code
        const courseDoc = await Course.findOne({
            $or: [{ name: course }, { code: course }]
        });

        if (!courseDoc) {
            return res.status(404).json({ error: "Course not found" });
        }

        const subjects = await Subject.find({
            courseId: courseDoc._id,
            semester: parseInt(semester)
        }).sort({ name: 1 });

        res.json({ success: true, subjects, courseName: courseDoc.name });
    } catch (error) {
        console.error("Get subjects for student error:", error);
        res.status(500).json({ error: "Failed to fetch subjects" });
    }
});

// CREATE SUBJECT (Admin)
router.post("/", async (req, res) => {
    try {
        const { name, code, courseId, year, semester } = req.body;

        if (!name || !code || !courseId || !year || !semester) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Verify course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        // Check for duplicate
        const existing = await Subject.findOne({ code: code.toUpperCase(), courseId });
        if (existing) {
            return res.status(400).json({ error: "Subject code already exists for this course" });
        }

        const subject = new Subject({
            name,
            code: code.toUpperCase(),
            courseId,
            year: parseInt(year),
            semester: parseInt(semester)
        });

        await subject.save();
        res.json({ success: true, message: "Subject created successfully", subject });

    } catch (error) {
        console.error("Create subject error:", error);
        res.status(500).json({ error: "Failed to create subject" });
    }
});

// UPDATE SUBJECT (Admin)
router.put("/:id", async (req, res) => {
    try {
        const { name, year, semester } = req.body;

        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ error: "Subject not found" });
        }

        if (name) subject.name = name;
        if (year) subject.year = parseInt(year);
        if (semester) subject.semester = parseInt(semester);

        await subject.save();
        res.json({ success: true, message: "Subject updated successfully", subject });

    } catch (error) {
        console.error("Update subject error:", error);
        res.status(500).json({ error: "Failed to update subject" });
    }
});

// DELETE SUBJECT (Admin)
router.delete("/:id", async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ error: "Subject not found" });
        }

        await Subject.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Subject deleted successfully" });

    } catch (error) {
        console.error("Delete subject error:", error);
        res.status(500).json({ error: "Failed to delete subject" });
    }
});

module.exports = router;
