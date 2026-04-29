// ─── backend/routes/auth.js ───────────────────────────────────────────────────
// Express route: POST /api/auth/login
// Validates memberId + dob, returns JWT

const express = require("express");
const jwt     = require("jsonwebtoken");
const Member  = require("../models/Member"); // your Mongoose model

const router  = express.Router();
const SECRET  = process.env.JWT_SECRET || "usra_dev_secret_change_in_prod";
const EXPIRY  = "7d";

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {

    const { memberId, dob } = req.body;

    if (!memberId || !dob) {
      return res.status(400).json({ message: "Member ID and date of birth are required." });
    }

    // Find by memberId (case-insensitive)
    const member = await Member.findOne({
      memberId: memberId.toUpperCase().trim(),
    });

    if (!member) {
      return res.status(401).json({ message: "Invalid Member ID or date of birth." });
    }

    // Compare DOB — stored as Date, incoming as "YYYY-MM-DD"
    const storedDob   = new Date(member.dob).toISOString().split("T")[0];
    const incomingDob = new Date(dob).toISOString().split("T")[0];

    if (storedDob !== incomingDob) {
      return res.status(401).json({ message: "Invalid Member ID or date of birth." });
    }

    // Build safe user payload (never include sensitive fields)
    const payload = {
      _id:      member._id,
      name:     member.name,
      memberId: member.memberId,
      role:     member.role || "member",
      gender:   member.gender,
    };

    const token = jwt.sign(payload, SECRET, { expiresIn: EXPIRY });

    return res.json({ user: payload, token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

module.exports = router;


// ─── backend/middleware/auth.js ───────────────────────────────────────────────



function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorised" });
  }
  try {
    req.user = jwt.verify(header.slice(7), SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function requireSelfOrAdmin(req, res, next) {
  const { id } = req.params; // MongoDB _id of the member being edited
  if (req.user.role === "admin" || req.user._id.toString() === id) return next();
  return res.status(403).json({ message: "You can only update your own profile." });
}

module.exports = { requireAuth, requireSelfOrAdmin };


// ─── backend/routes/members.js (relevant lines) ──────────────────────────────
// Add this to your existing members router:

// const { requireAuth, requireSelfOrAdmin } = require("../middleware/auth");

// PATCH /api/members/:id  — protected, self or admin only
// router.patch("/:id", requireAuth, requireSelfOrAdmin, async (req, res) => {
//   try {
//     const ALLOWED = [
//       "phone","place","houseName","dob","guardianName","guardianPhone",
//       "maritalStatus","spouseName","spousePhone","spouseJob","children",
//       "highestQualification","educations","employmentType","sector",
//       "organisation","jobTitle","jobLocation","annualIncome","experiences",
//       "skills","bio",
//     ];
//     const update = {};
//     ALLOWED.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
//     const updated = await Member.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
//     if (!updated) return res.status(404).json({ message: "Member not found." });
//     res.json({ data: updated });
//   } catch (err) {
//     res.status(500).json({ message: "Update failed." });
//   }
// });


// ─── Member ID generator utility ─────────────────────────────────────────────
// Call this when creating a new member to get the next USRA-XXXX id

// async function generateMemberId() {
//   const last = await Member.findOne({}, { memberId: 1 })
//     .sort({ createdAt: -1 })
//     .lean();
//   if (!last?.memberId) return "USRA-0001";
//   const num = parseInt(last.memberId.split("-")[1], 10);
//   return `USRA-${String(num + 1).padStart(4, "0")}`;
// }