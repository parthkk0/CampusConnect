const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Admin = require("../Model/Admin");
const Student = require("../Model/Student");

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "campus_connect_secret_key";

// Middleware to check if admin is authenticated
function isAuthenticated(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized - No token provided" });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Unauthorized - Invalid or expired token" });
    }
}

// ADMIN LOGIN
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password required" });
        }

        // Find admin
        const admin = await Admin.findOne({ username: username.toLowerCase() });

        if (!admin) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id, username: admin.username, role: admin.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            admin: {
                username: admin.username,
                role: admin.role
            }
        });

    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ 
            error: "Login failed", 
            details: error.message 
        });
    }
});

// ADMIN LOGOUT
router.post("/logout", isAuthenticated, (req, res) => {
    // With JWT, logout is usually handled by frontend (deleting the token)
    res.json({ success: true, message: "Logged out successfully" });
});

// ADD SINGLE STUDENT (Pre-register)
router.post("/students/add", isAuthenticated, async (req, res) => {
    try {
        const { roll, name, email, course, year, courseFee } = req.body;

        // Validate required fields
        if (!roll || !name || !email) {
            return res.status(400).json({ error: "Roll, name, and email are required" });
        }

        // Check if student already exists
        const existing = await Student.findOne({
            $or: [{ roll }, { email }]
        });

        if (existing) {
            return res.status(400).json({ error: "Student with this roll or email already exists" });
        }

        // Create pre-registered student
        const student = new Student({
            roll,
            name,
            email,
            course,
            year: year || "1st",
            courseFee: courseFee || 0,
            isPreRegistered: true,
            preRegisteredBy: req.admin.id,
            preRegisteredAt: new Date(),
            approvalStatus: 'pending'
        });

        await student.save();

        res.status(201).json({
            success: true,
            message: "Student pre-registered successfully",
            student: {
                roll: student.roll,
                name: student.name,
                email: student.email,
                course: student.course,
                year: student.year,
                courseFee: student.courseFee
            }
        });

    } catch (error) {
        console.error("Add student error:", error);
        res.status(500).json({ error: "Failed to add student" });
    }
});

// BULK ADD STUDENTS (CSV)
router.post("/students/bulk-add", isAuthenticated, async (req, res) => {
    try {
        const { students } = req.body; // Array of student objects

        if (!Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ error: "Students array is required" });
        }

        const results = {
            success: [],
            failed: []
        };

        for (const studentData of students) {
            try {
                const { roll, name, email, course, year, courseFee } = studentData;

                if (!roll || !name || !email) {
                    results.failed.push({
                        roll: roll || 'unknown',
                        error: "Missing required fields"
                    });
                    continue;
                }

                // Check if already exists
                const existing = await Student.findOne({
                    $or: [{ roll }, { email }]
                });

                if (existing) {
                    results.failed.push({
                        roll,
                        error: "Already exists"
                    });
                    continue;
                }

                // Create student
                const student = new Student({
                    roll,
                    name,
                    email,
                    course,
                    year: year || "1st",
                    courseFee: courseFee || 0,
                    isPreRegistered: true,
                    preRegisteredBy: req.admin.id,
                    preRegisteredAt: new Date(),
                    approvalStatus: 'pending'
                });

                await student.save();
                results.success.push({ roll, name });

            } catch (err) {
                results.failed.push({
                    roll: studentData.roll || 'unknown',
                    error: err.message
                });
            }
        }

        res.json({
            success: true,
            message: `Added ${results.success.length} students, ${results.failed.length} failed`,
            results
        });

    } catch (error) {
        console.error("Bulk add error:", error);
        res.status(500).json({ error: "Bulk add failed" });
    }
});

// GET ALL PRE-REGISTERED STUDENTS
router.get("/students", isAuthenticated, async (req, res) => {
    try {
        const { status, course, search } = req.query;

        let query = { isPreRegistered: true };

        if (status) {
            query.approvalStatus = status;
        }

        if (course) {
            query.course = course;
        }

        if (search) {
            query.$or = [
                { roll: new RegExp(search, 'i') },
                { name: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ];
        }

        const students = await Student.find(query)
            .select('-faceEmbedding -__v')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error("Get students error:", error);
        res.status(500).json({ error: "Failed to fetch students" });
    }
});

// UPDATE STUDENT
router.put("/students/:id", isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, course, year, courseFee } = req.body;

        const student = await Student.findById(id);

        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Update fields
        if (name) student.name = name;
        if (email) student.email = email;
        if (course) student.course = course;
        if (year) student.year = year;

        if (courseFee !== undefined) student.courseFee = courseFee;

        await student.save();

        res.json({
            success: true,
            message: "Student updated successfully",
            student
        });

    } catch (error) {
        console.error("Update student error:", error);
        res.status(500).json({ error: "Failed to update student" });
    }
});

// DELETE STUDENT
router.delete("/students/:id", isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;

        const student = await Student.findByIdAndDelete(id);

        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.json({
            success: true,
            message: "Student deleted successfully"
        });

    } catch (error) {
        console.error("Delete student error:", error);
        res.status(500).json({ error: "Failed to delete student" });
    }
});

// CREATE DEFAULT ADMIN (for testing - remove in production)
router.post("/create-default", async (req, res) => {
    try {
        const existing = await Admin.findOne({ username: 'admin' });

        if (existing) {
            return res.json({ message: "Default admin already exists" });
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);

        const admin = new Admin({
            username: 'admin',
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();

        res.json({
            success: true,
            message: "Default admin created (username: admin, password: admin123)"
        });

    } catch (error) {
        console.error("Create admin error:", error);
        res.status(500).json({ error: "Failed to create admin" });
    }
});

// RESET STUDENT FACE - Force re-registration
router.delete("/students/:id/face", isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id);

        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        student.faceEmbedding = [];
        student.faceRegisteredAt = null;
        student.photoUrl = null;
        await student.save();

        res.json({
            success: true,
            message: `Face data cleared for ${student.roll}. Student must re-register.`
        });
    } catch (error) {
        console.error("Reset face error:", error);
        res.status(500).json({ error: "Failed to reset face data" });
    }
});

module.exports = router;
