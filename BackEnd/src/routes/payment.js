const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Student = require("../Model/Student");
const Transaction = require("../Model/Transaction");

// Generate unique transaction ID
function generateTxnId() {
  return `WAL_${Date.now()}_${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

/**
 * Get Wallet Balance & History
 * GET /api/pay/wallet/:studentId
 */
router.get("/wallet/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ roll: studentId });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const history = await Transaction.find({ studentId }).sort({ timestamp: -1 });

    res.json({
      success: true,
      balance: student.walletBalance || 0,
      history
    });
  } catch (err) {
    console.error("fetch wallet error:", err);
    res.status(500).json({ error: "Failed to fetch wallet data" });
  }
});

/**
 * Add money to wallet (Simulation / Admin)
 * POST /api/pay/wallet/add
 * Body: { studentId, amount, description }
 */
router.post("/wallet/add", async (req, res) => {
  try {
    const { studentId, amount, description = "Wallet Top-up" } = req.body;

    if (!studentId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid request parameters" });
    }

    const student = await Student.findOne({ roll: studentId });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Update balance
    student.walletBalance = (student.walletBalance || 0) + Number(amount);
    await student.save();

    // Log transaction
    const txn = new Transaction({
      transactionId: generateTxnId(),
      studentId,
      type: "credit",
      amount: Number(amount),
      description
    });
    await txn.save();

    res.json({
      success: true,
      message: `₹${amount} added successfully!`,
      newBalance: student.walletBalance,
      transaction: txn
    });
  } catch (err) {
    console.error("add money error:", err);
    res.status(500).json({ error: "Failed to add money to wallet" });
  }
});

/**
 * Deduct money from wallet (E-ID Fine or others)
 * POST /api/pay/wallet/deduct
 * Body: { studentId, amount, description }
 */
router.post("/wallet/deduct", async (req, res) => {
  try {
    const { studentId, amount, description = "Payment Deduction" } = req.body;

    if (!studentId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid request parameters" });
    }

    const student = await Student.findOne({ roll: studentId });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const currentBalance = student.walletBalance || 0;

    if (currentBalance < amount) {
      return res.status(400).json({
        error: "Insufficient Balance",
        currentBalance,
        requiredAmount: amount
      });
    }

    // Atomic-like deduction
    student.walletBalance -= Number(amount);
    await student.save();

    // Log transaction
    const txn = new Transaction({
      transactionId: generateTxnId(),
      studentId,
      type: "debit",
      amount: Number(amount),
      description
    });
    await txn.save();

    res.json({
      success: true,
      message: "Payment successful",
      newBalance: student.walletBalance,
      transaction: txn
    });
  } catch (err) {
    console.error("deduct money error:", err);
    res.status(500).json({ error: "Failed to process payment" });
  }
});

module.exports = router;
