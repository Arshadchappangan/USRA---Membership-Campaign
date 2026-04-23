const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  memberId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender :{
    type: String,
    required: [true, 'Gender is required'],
    enum: { values: ['Male', 'Female', 'Other'], message: 'Invalid gender' }
  },
  father: {
    type: String,
    required: [true, "Father's name is required"],
    trim: true
  },
  mother: {
    type: String,
    required: [true, "Mother's name is required"],
    trim: true
  },
  place: {
    type: String,
    required: [true, 'Place is required'],
    trim: true
  },
  bloodGroup: {
    type: String,
    required: false,
    default: null,
    enum: { values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown', null], message: 'Invalid blood group' }
  },
  phone: {
    type: String,
    required: false,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
  },
  email: {
    type: String,
    required: false,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  photo: {
    type: String,
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  razorpayOrderId: {
    type: String,
    default: null
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  razorpaySignature: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    default: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Member', memberSchema);
