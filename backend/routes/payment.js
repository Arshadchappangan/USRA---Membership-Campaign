const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Member = require('../models/Member');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// POST /api/payment/create-order
router.post('/create-order', async (req, res) => {
  try {
    const { memberId } = req.body;
    if (!memberId) return res.status(400).json({ success: false, message: 'Member ID required' });

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    if (member.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Payment already completed' });
    }


    const options = {
      amount: 10000, // 100 INR in paise
      currency: 'INR',
      receipt: `receipt_${member.memberId}`,
      notes: {
        memberId: member._id.toString(),
        memberName: member.name,
        usraId: member.memberId
      }
    };

    const order = await razorpay.orders.create(options);
    
    member.razorpayOrderId = order.id;
    await member.save();

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        memberName: member.name,
        memberEmail: member.email,
        memberPhone: member.phone
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
});

// POST /api/payment/verify
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, memberId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !memberId) {
      return res.status(400).json({ success: false, message: 'Missing payment verification data' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed - Invalid signature' });
    }

    // Update member
    const member = await Member.findByIdAndUpdate(
      memberId,
      {
        paymentStatus: 'completed',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      },
      { new: true }
    );

    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        memberId: member._id,
        memberDbId: member.memberId,
        paymentId: razorpay_payment_id
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Payment verification error' });
  }
});

// POST /api/payment/failed
router.post('/failed', async (req, res) => {
  try {
    const { memberId } = req.body;
    await Member.findByIdAndUpdate(memberId, { paymentStatus: 'failed' });
    res.json({ success: true, message: 'Payment status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
