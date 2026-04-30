const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  level: { type: String, trim: true },
  field: { type: String, trim: true },
  institution: { type: String, trim: true },
  year: { type: String, trim: true },
}, { _id: false });

const experienceSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  organisation: { type: String, trim: true },
  from: { type: String, trim: true },
  to: { type: String, trim: true },
  description: { type: String, trim: true },
}, { _id: false });

const memberSchema = new mongoose.Schema({
  memberId: { type: String, unique: true, required: true },
  name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
  dob: { type: Date, required: [true, 'Date of birth is required'] },
  gender: { type: String, required: [true, 'Gender is required'], enum: ['Male', 'Female', 'Other'] },
  houseName: { type: String, trim: true },
  father: { type: String, required: [true, "Father's name is required"], trim: true },
  mother: { type: String, required: [true, "Mother's name is required"], trim: true },
  place: { type: String, required: [true, 'Place is required'], trim: true },
  maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'] },
  // "spouse" is the canonical field name — ProfilePage draft maps spouseName → spouse
  spouse: { type: String, trim: true, required: function () { return this.maritalStatus === 'Married'; } },
  spousePhone: { type: String, trim: true },
  spouseJob: { type: String, trim: true },
  children: { type: String, trim: true },
  bio: { type: String, trim: true, maxlength: 500 },
  bloodGroup: { type: String, default: null, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown', null] },
  phone: { type: String, match: [/^[6-9]\d{9}$/, 'Invalid phone number'] },
  email: { type: String, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
  photo: { type: String, default: null },
  // career
  employmentType: { type: String, enum: ['Employed', 'Self-Employed', 'Business', 'Student', 'Homemaker', 'Unemployed', 'Retired', ''], default: '' },
  sector: { type: String, trim: true },
  organisation: { type: String, trim: true },
  jobTitle: { type: String, trim: true },
  jobLocation: { type: String, trim: true },
  annualIncome: { type: Number, default: null },
  skills: { type: String, trim: true },
  // education
  highestQualification: { type: String, trim: true },
  educations: { type: [educationSchema], default: [] },
  // experience
  experiences: { type: [experienceSchema], default: [] },
  // payment
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
  razorpaySignature: { type: String, default: null },
  amount: { type: Number, default: 100 },
  // auth
  role: { type: String, enum: ['member', 'admin'], default: 'member' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Member', memberSchema);