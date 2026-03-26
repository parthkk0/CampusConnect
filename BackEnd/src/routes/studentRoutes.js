const express = require("express");
const router = express.Router();
const axios = require("axios");
const Student = require("../Model/Student");
const Admin = require("../Model/Admin");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Configure nodemailer (replace with your actual email credentials or use environment variables)
let transporter;
async function initMailer() {
    if (process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('example.com')) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } else {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, 
                pass: testAccount.pass, 
            },
        });
        console.log("📨 Ethereal Email Ready: " + testAccount.user);
    }
}
initMailer();

const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || "http://127.0.0.1:8000";

// CHECK if roll number is pre-registered (validation before signup)
router.post("/validate-roll", async (req, res) => {
    try {
        const { roll } = req.body;

        if (!roll) {
            return res.status(400).json({ error: "Roll number is required" });
        }

        const student = await Student.findOne({
            roll,
            isPreRegistered: true
        });

        if (!student) {
            return res.status(404).json({
                error: "Roll number not found. Please contact administration."
            });
        }

        if (student.approvalStatus === 'approved') {
            return res.status(400).json({
                error: "This roll number has already completed signup."
            });
        }

        // Return pre-registered data for auto-fill
        res.json({
            success: true,
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
        console.error("Validate roll error:", error.message);
        res.status(500).json({ error: "Validation failed" });
    }
});

// GET student by ID
router.get("/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findOne({ roll: studentId });
        if (!student) {
            return res.status(404).json({
                error: "Student not found"
            });
        }

        res.json({
            success: true,
            student: {
                roll: student.roll,
                name: student.name,
                email: student.email,
                course: student.course,
                year: student.year,
                photoUrl: student.photoUrl,
                hasFaceRegistered: student.faceEmbedding && student.faceEmbedding.length > 0,
                createdAt: student.createdAt
            }
        });

    } catch (error) {
        console.error("Get student error:", error.message);
        res.status(500).json({
            error: error.message || "Failed to get student"
        });
    }
});

// SIGNUP - Create student account with face registration
router.post("/signup", async (req, res) => {
    try {
        const { roll, name, email, course, year, photoUrl, faceImage, password } = req.body;

        // Validate required fields
        if (!roll || !email || !password) {
            return res.status(400).json({
                error: "Roll number, email, and password are required"
            });
        }

        // Check if student is pre-registered by admin
        const preRegistered = await Student.findOne({
            roll,
            isPreRegistered: true
        });

        if (!preRegistered) {
            return res.status(403).json({
                error: "Roll number not found. Please contact administration to register."
            });
        }

        // Verify email matches pre-registered email
        if (preRegistered.email.toLowerCase() !== email.toLowerCase()) {
            return res.status(403).json({
                error: "Email does not match our records. Please use your registered email."
            });
        }

        // Check if student has already completed signup
        if (preRegistered.approvalStatus === 'approved') {
            return res.status(400).json({
                error: "You have already completed signup for this roll number."
            });
        }

        // Update student with provided data and face
        if (name) preRegistered.name = name;
        if (course) preRegistered.course = course;
        if (year) preRegistered.year = year;
        if (photoUrl) preRegistered.photoUrl = photoUrl;

        // Hash and store password securely
        const hashedPassword = await bcrypt.hash(password, 10);
        preRegistered.password = hashedPassword;

        // If face image provided, register face
        if (faceImage) {
            preRegistered.photoUrl = faceImage; // Save captured face image as profile picture
            try {
                const faceServiceResponse = await axios.post(
                    `${FACE_SERVICE_URL}/register-face`,
                    { userId: roll, image: faceImage },
                    { timeout: 30000 }
                );

                const { embedding } = faceServiceResponse.data;
                preRegistered.faceEmbedding = embedding;
                preRegistered.faceRegisteredAt = new Date();
            } catch (faceError) {
                console.error("Face registration during signup failed:", faceError.message);

                // Check if Face Service is not running (connection refused)
                if (faceError.code === 'ECONNREFUSED' || faceError.code === 'ECONNRESET') {
                    return res.status(503).json({
                        error: "Face Recognition Service is starting up. Please wait ~15 seconds and try again. (Or if it isn't running, start it using python app.py in FaceService folder)"
                    });
                }

                // Get actual error message from Face Service response if available
                const actualError = faceError.response?.data?.error || faceError.message;
                return res.status(400).json({
                    error: `Face registration failed: ${actualError}`
                });
            }
        }

        // Mark as approved after successful signup
        preRegistered.approvalStatus = 'approved';
        await preRegistered.save();

        res.status(201).json({
            success: true,
            message: "Signup completed successfully",
            student: {
                roll: preRegistered.roll,
                name: preRegistered.name,
                email: preRegistered.email,
                course: preRegistered.course,
                year: preRegistered.year,
                courseFee: preRegistered.courseFee,
                photoUrl: preRegistered.photoUrl,
                hasFaceRegistered: preRegistered.faceEmbedding && preRegistered.faceEmbedding.length > 0
            }
        });

    } catch (error) {
        console.error("Signup error:", error.message);
        res.status(500).json({
            error: error.message || "Student registration failed"
        });
    }
});

// GET student face status
router.get("/:studentId/face-status", async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findOne({ roll: studentId });
        if (!student) {
            return res.status(404).json({
                error: "Student not found"
            });
        }

        const hasFace = student.faceEmbedding && student.faceEmbedding.length > 0;

        res.json({
            success: true,
            studentId: student.roll,
            studentName: student.name,
            hasFaceRegistered: hasFace,
            faceRegisteredAt: student.faceRegisteredAt || null
        });

    } catch (error) {
        console.error("Face status check error:", error.message);
        res.status(500).json({
            error: error.message || "Failed to check face status"
        });
    }
});

// LOGIN - Student Login (Roll + Password)
router.post("/login", async (req, res) => {
    try {
        const { roll, password } = req.body;

        if (!roll || !password) {
            return res.status(400).json({ error: "Roll number and password are required" });
        }

        // Find student
        const student = await Student.findOne({ roll });
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Check if signup completed
        if (student.approvalStatus !== 'approved') {
            return res.status(403).json({ error: "Please complete registration first" });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Return student data (exclude password)
        res.json({
            success: true,
            student: {
                roll: student.roll,
                name: student.name,
                email: student.email,
                course: student.course,
                year: student.year,
                courseFee: student.courseFee,
                photoUrl: student.photoUrl,
                hasFaceRegistered: student.faceEmbedding && student.faceEmbedding.length > 0
            }
        });

    } catch (error) {
        console.error("Student login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

// SEND OTP - Generate and send OTP for password reset
router.post("/forgot-password/send-otp", async (req, res) => {
    try {
        const { roll } = req.body;

        if (!roll) {
            return res.status(400).json({ error: "Roll number is required" });
        }

        const student = await Student.findOne({ roll });
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP and expiry (10 minutes)
        student.resetPasswordOtp = otp;
        student.resetPasswordOtpExpires = Date.now() + 10 * 60 * 1000;
        await student.save();

        // Send Email
        const mailOptions = {
            from: process.env.EMAIL_USER || 'no-reply@campusconnect.com',
            to: student.email,
            subject: 'Campus Connect - Password Reset OTP',
            html: `
                <h3>Password Reset OTP</h3>
                <p>Hello ${student.name},</p>
                <p>Your OTP for resetting your Campus Connect password is: <strong style="font-size: 24px;">${otp}</strong></p>
                <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
                <p>If you did not request this, please ignore this email.</p>
            `
        };

        try {
            if (!transporter) await initMailer(); // Ensure it's loaded
            const info = await transporter.sendMail(mailOptions);
            const previewUrl = nodemailer.getTestMessageUrl(info);
            
            console.log(`Email sent successfully to ${student.email}`);
            
            if (previewUrl) {
                console.log(`Preview URL: ${previewUrl}`);
                return res.json({ 
                    success: true, 
                    message: `DEV EMAIL SENT! Click or copy this link to view the actual email inbox: ${previewUrl}\n\n(Intended for ${student.email})` 
                });
            } else {
                const temp = student.email.split('@');
                const username = temp[0];
                const domain = temp[1] || '';
                let masked = username;
                
                if (username.length >= 8) {
                    masked = username.slice(0, 3) + '****' + username.slice(-5);
                } else if (username.length > 2) {
                    masked = username.slice(0, 1) + '***' + username.slice(-1);
                }
                
                return res.json({ success: true, message: `OTP sent successfully to ${masked}@${domain}` });
            }
        } catch (mailError) {
            console.error("Email sending error:", mailError);
            console.log("=========================================");
            console.log(`MOCK EMAIL (Since credentials failed for ${student.email})`);
            console.log(`Subject: Campus Connect - Password Reset OTP`);
            console.log(`OTP: ${otp}`);
            console.log("=========================================");

            // Return success anyway, telling the user to check the backend console
            return res.json({
                success: true,
                message: `DEV MODE OTP: Since email failed, your OTP is ${otp} (intended for ${student.email})`
            });
        }

    } catch (error) {
        console.error("Send OTP error:", error);
        res.status(500).json({ error: "Failed to process OTP request: " + error.message });
    }
});

// RESET PASSWORD - Verify OTP & Update Password
router.post("/reset-password", async (req, res) => {
    try {
        console.log(`[RESET] Received Request Body:`, req.body);
        const { roll, newPassword, otp } = req.body;

        if (!roll || !newPassword || !otp) {
            console.log(`[RESET] Missing fields. roll: ${!!roll}, newPassword: ${!!newPassword}, otp: ${!!otp}`);
            return res.status(400).json({ error: "Roll number, OTP, and new password are required" });
        }

        // 1. Find Student by Roll Number (Explicitly select OTP fields since they are select: false)
        const student = await Student.findOne({ roll }).select('+resetPasswordOtp +resetPasswordOtpExpires');
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // 3. Verify OTP
        console.log(`[RESET] Verifying OTP for ${student.email}`);
        console.log(`[RESET] Backend OTP: '${student.resetPasswordOtp}', Expiry: ${student.resetPasswordOtpExpires}`);
        console.log(`[RESET] Provided OTP: '${otp}'`);

        if (!student.resetPasswordOtp || !student.resetPasswordOtpExpires) {
            console.log(`[RESET] Error: No OTP request found in DB.`);
            return res.status(400).json({ error: "No OTP request found. Please request a new OTP." });
        }

        if (student.resetPasswordOtpExpires < Date.now()) {
            console.log(`[RESET] Error: OTP expired.`);
            return res.status(400).json({ error: "OTP has expired. Please request a new OTP." });
        }

        if (student.resetPasswordOtp !== otp) {
            console.log(`[RESET] Error: OTP mismatch. Expected '${student.resetPasswordOtp}', got '${otp}'`);
            return res.status(400).json({ error: "Invalid OTP provided." });
        }

        // 4. Update Password & Clear OTP
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        student.password = hashedPassword;
        student.resetPasswordOtp = undefined;
        student.resetPasswordOtpExpires = undefined;
        await student.save();

        res.json({ success: true, message: "Password reset successful" });

    } catch (error) {
        console.error("Password reset error:", error);
        res.status(500).json({ error: "Reset failed: " + error.message });
    }
});

// ==================== E-ID ENDPOINTS ====================

// Helper function to get next midnight (12:00 AM)
function getNextMidnight() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
}

// GENERATE E-ID - Called after successful face verification
router.post("/:studentId/generate-eid", async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findOne({ roll: studentId });
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Check if student has face registered
        if (!student.faceEmbedding || student.faceEmbedding.length === 0) {
            return res.status(400).json({
                error: "Face not registered. Please complete signup first."
            });
        }

        const now = new Date();

        // Check if current E-ID is still valid
        if (student.eid && student.eid.isActive && student.eid.expiresAt > now) {
            // E-ID is still valid, return existing E-ID
            return res.json({
                success: true,
                message: "E-ID already active",
                eid: {
                    isActive: true,
                    generatedAt: student.eid.generatedAt,
                    expiresAt: student.eid.expiresAt,
                    qrCode: student.eid.qrCode
                },
                student: {
                    roll: student.roll,
                    name: student.name,
                    email: student.email,
                    course: student.course,
                    year: student.year,
                    courseFee: student.courseFee,
                    photoUrl: student.photoUrl
                }
            });
        }

        // Generate new E-ID (expired or doesn't exist)
        const expiresAt = getNextMidnight();

        student.eid = {
            isActive: true,
            generatedAt: now,
            expiresAt: expiresAt,
            qrCode: `EID-${student.roll}-${Date.now()}` // Simple QR code identifier
        };

        await student.save();

        res.json({
            success: true,
            message: "E-ID generated successfully",
            eid: {
                isActive: true,
                generatedAt: student.eid.generatedAt,
                expiresAt: student.eid.expiresAt,
                qrCode: student.eid.qrCode
            },
            student: {
                roll: student.roll,
                name: student.name,
                email: student.email,
                course: student.course,
                year: student.year,
                courseFee: student.courseFee,
                photoUrl: student.photoUrl
            }
        });

    } catch (error) {
        console.error("E-ID generation error:", error);
        res.status(500).json({ error: "Failed to generate E-ID" });
    }
});

// GET E-ID - Retrieve current E-ID status
router.get("/:studentId/eid", async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findOne({ roll: studentId });
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Check if E-ID exists
        if (!student.eid || !student.eid.generatedAt) {
            return res.json({
                success: true,
                hasEid: false,
                isActive: false,
                message: "No E-ID generated yet"
            });
        }

        const now = new Date();
        const isExpired = student.eid.expiresAt < now;

        // If expired, mark as inactive
        if (isExpired && student.eid.isActive) {
            student.eid.isActive = false;
            await student.save();
        }

        if (isExpired) {
            return res.json({
                success: true,
                hasEid: true,
                isActive: false,
                expired: true,
                message: "E-ID has expired. Please verify face to generate new E-ID.",
                expiredAt: student.eid.expiresAt
            });
        }

        // E-ID is active
        res.json({
            success: true,
            hasEid: true,
            isActive: true,
            eid: {
                generatedAt: student.eid.generatedAt,
                expiresAt: student.eid.expiresAt,
                qrCode: student.eid.qrCode
            },
            student: {
                roll: student.roll,
                name: student.name,
                email: student.email,
                course: student.course,
                year: student.year,
                courseFee: student.courseFee,
                photoUrl: student.photoUrl
            }
        });

    } catch (error) {
        console.error("E-ID retrieval error:", error);
        res.status(500).json({ error: "Failed to retrieve E-ID" });
    }
});

module.exports = router;
