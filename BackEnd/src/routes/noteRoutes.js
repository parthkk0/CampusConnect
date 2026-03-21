const express = require("express");
const router = express.Router();
const Note = require("../Model/Note");
const Subject = require("../Model/Subject");
const Course = require("../Model/Course");

// GET NOTES BY SUBJECT
router.get("/by-subject/:subjectId", async (req, res) => {
    try {
        const notes = await Note.find({ subjectId: req.params.subjectId })
            .select('-fileUrl') // Don't send file content in list
            .sort({ createdAt: -1 });

        res.json({ success: true, notes });
    } catch (error) {
        console.error("Get notes by subject error:", error);
        res.status(500).json({ error: "Failed to fetch notes" });
    }
});

// GET SINGLE NOTE (with file content for download)
router.get("/:id", async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ error: "Note not found" });
        }
        res.json({ success: true, note });
    } catch (error) {
        console.error("Get note error:", error);
        res.status(500).json({ error: "Failed to fetch note" });
    }
});

// GET ALL NOTES FOR STUDENT (based on course and semester)
router.get("/for-student/:course/:semester", async (req, res) => {
    try {
        const { course, semester } = req.params;
        console.log(`\n📚 NOTES REQUEST: course="${course}", semester="${semester}"`);

        // Find the course (case-insensitive match)
        const courseRegex = new RegExp(`^${course.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
        const courseDoc = await Course.findOne({
            $or: [{ name: courseRegex }, { code: courseRegex }]
        });

        if (!courseDoc) {
            console.log(`❌ Course NOT FOUND for: "${course}"`);
            // List all courses for debugging
            const allCourses = await Course.find({}, 'name code');
            console.log(`   Available courses:`, allCourses.map(c => `${c.name} (${c.code})`));
            return res.status(404).json({ error: "Course not found" });
        }
        console.log(`✅ Course found: ${courseDoc.name} (${courseDoc.code}), ID: ${courseDoc._id}`);

        // Find all subjects for this course and semester
        const subjects = await Subject.find({
            courseId: courseDoc._id,
            semester: parseInt(semester)
        });
        console.log(`📖 Subjects found for semester ${semester}: ${subjects.length}`);
        subjects.forEach(s => console.log(`   - ${s.name} (${s.code}) [Year ${s.year}, Sem ${s.semester}]`));

        const subjectIds = subjects.map(s => s._id);

        // Get notes for these subjects (without file content for performance)
        const notes = await Note.find({ subjectId: { $in: subjectIds } })
            .populate('subjectId', 'name code')
            .select('-fileUrl')
            .sort({ createdAt: -1 });
        console.log(`📝 Notes found: ${notes.length}`);
        notes.forEach(n => console.log(`   - "${n.title}" for subject ${n.subjectId?.name}`));

        // Group notes by subject
        const notesBySubject = {};
        subjects.forEach(sub => {
            notesBySubject[sub._id] = {
                subject: sub,
                notes: []
            };
        });

        notes.forEach(note => {
            if (notesBySubject[note.subjectId._id]) {
                notesBySubject[note.subjectId._id].notes.push(note);
            }
        });

        res.json({
            success: true,
            courseName: courseDoc.name,
            semester: parseInt(semester),
            subjects: Object.values(notesBySubject)
        });
    } catch (error) {
        console.error("Get notes for student error:", error);
        res.status(500).json({ error: "Failed to fetch notes" });
    }
});

// UPLOAD NOTE (Admin)
router.post("/", async (req, res) => {
    try {
        const { title, description, subjectId, fileType, fileUrl, fileName, uploadedBy } = req.body;

        if (!title || !subjectId || !fileUrl || !fileName || !uploadedBy) {
            return res.status(400).json({ error: "Title, subject, file, and uploadedBy are required" });
        }

        // Verify subject exists
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ error: "Subject not found" });
        }

        const note = new Note({
            title,
            description: description || '',
            subjectId,
            fileType: fileType || 'pdf',
            fileUrl,
            fileName,
            uploadedBy
        });

        await note.save();
        res.json({ success: true, message: "Note uploaded successfully", note: { ...note.toObject(), fileUrl: undefined } });

    } catch (error) {
        console.error("Upload note error:", error);
        res.status(500).json({ error: error.message || "Failed to upload note" });
    }
});

// DELETE NOTE (Admin)
router.delete("/:id", async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ error: "Note not found" });
        }

        await Note.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Note deleted successfully" });

    } catch (error) {
        console.error("Delete note error:", error);
        res.status(500).json({ error: "Failed to delete note" });
    }
});

module.exports = router;
