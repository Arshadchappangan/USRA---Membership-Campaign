const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const Member = require('../models/Member');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'usra-membership-2026',
    format: 'jpg',
    transformation: [{ width: 400, height: 500, crop: 'fill' }],
  },
});

// Multer config — used for the combined create+photo endpoint
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = path.join(__dirname, '../uploads');
//     if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`);
//   }
// });

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) cb(null, true);
  else cb(new Error('Only image files are allowed!'), false);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

// Validation rules — blood group is optional
const memberValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('dob').notEmpty().withMessage('Date of birth is required').isDate(),
  body('gender').notEmpty().withMessage('Gender is required'),
  body('father').trim().notEmpty().withMessage("Father's name is required"),
  body('mother').trim().notEmpty().withMessage("Mother's name is required"),
  body('place').trim().notEmpty().withMessage('Place is required'),
  body('bloodGroup')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'])
    .withMessage('Invalid blood group'),
  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter valid Indian phone number'),
  body('email')
    .optional({ checkFalsy: true })   // 👈 THIS FIXES EVERYTHING
    .isEmail()
    .withMessage('Enter valid email')
    .normalizeEmail()
];

// POST /api/members — Create member WITH photo in one shot (called from ConfirmPage)
router.post('/', upload.single('photo'), memberValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        const filePath = path.join(__dirname, '../uploads', req.file.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Profile photo is required' });
    }

    const memberId = `USRA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const memberPayload = {
      memberId,
      name: req.body.name,
      dob: req.body.dob,
      gender: req.body.gender,
      father: req.body.father,
      mother: req.body.mother,
      place: req.body.place,
      photo: req.file.path,
    };


    if (req.body.phone && req.body.phone.trim() !== '') {
      memberPayload.phone = req.body.phone;
    }

    if (req.body.email && req.body.email.trim() !== '') {
      memberPayload.email = req.body.email;
    }

    if (req.body.bloodGroup && req.body.bloodGroup.trim() !== '') {
      memberPayload.bloodGroup = req.body.bloodGroup;
    }

    const member = new Member(memberPayload);
    await member.save();

    res.status(201).json({
      success: true,
      message: 'Member registered successfully',
      data: {
        memberId: member.memberId,
        _id: member._id,
        photoUrl: req.file.path,
      }
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && req.file.filename) {
      const filePath = path.join(__dirname, '../uploads', req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    console.error('Create member error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
});

// GET /api/members/:id - Get member by MongoDB ID
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/members/by-memberid/:memberId
router.get('/by-memberid/:memberId', async (req, res) => {
  try {
    const member = await Member.findOne({ memberId: req.params.memberId });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const members = await Member.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalMembers = await Member.countDocuments();

    res.json({
      success: true,
      data: members,
      pagination: {
        total: totalMembers,
        page,
        limit,
        totalPages: Math.ceil(totalMembers / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
