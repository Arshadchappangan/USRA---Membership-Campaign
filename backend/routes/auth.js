const express = require("express");
const jwt = require("jsonwebtoken");
const Member = require("../models/Member");

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "usra_dev_secret_change_in_prod";
const EXPIRY = "7d";

router.post("/login", async (req, res) => {
  try {
    const { memberId, dob } = req.body;

    if (!memberId || !dob) {
      return res.status(400).json({ message: "Member ID and date of birth are required." });
    }

    const member = await Member.findOne({
      memberId: memberId.toUpperCase().trim(),
    });

    if (!member) {
      return res.status(401).json({ message: "Invalid Member ID or date of birth." });
    }

    const storedDob = new Date(member.dob).toISOString().split("T")[0];
    const incomingDob = new Date(dob).toISOString().split("T")[0];

    if (storedDob !== incomingDob) {
      return res.status(401).json({ message: "Invalid Member ID or date of birth." });
    }

    const payload = {
      _id: member._id,
      name: member.name,
      memberId: member.memberId,
      role: member.role || "member",
      gender: member.gender,
    };

    const token = jwt.sign(payload, SECRET, { expiresIn: EXPIRY });

    res.json({ user: payload, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

module.exports = router; 