import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiUser, FiCalendar, FiMapPin, FiPhone, FiMail,
  FiArrowLeft, FiEdit, FiCreditCard, FiCheck, FiLoader
} from 'react-icons/fi';
import { MdBloodtype } from 'react-icons/md';
import { useMembership } from '../context/MembershipContext';
import { membersAPI, paymentAPI } from '../utils/api';
import StepIndicator from '../components/StepIndicator';
import usraLogo from '../assets/usra-logo.png';
import { format } from 'date-fns';

const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID;

const DetailRow = ({ icon: Icon, label, value, color = 'text-usra-blue' }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className={`p-2 rounded-lg bg-gray-50 ${color} mt-0.5`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-gray-800 font-semibold mt-0.5 break-words">{value || '—'}</p>
    </div>
  </div>
);

const ConfirmPage = () => {
  const navigate = useNavigate();
  const {
    memberData, photoBlob, photoPreviewUrl,
    setMemberId, setMemberDbId, setPhotoUrl,
    setPaymentData
  } = useMembership();

  const [savingStatus, setSavingStatus] = useState('idle'); // idle | saving | saved | paying
  const [savedMemberId, setSavedMemberId] = useState(null); // internal MongoDB _id for payment

  // Redirect if data missing
  useEffect(() => {
    if (!memberData?.name) {
      navigate('/register');
    } else if (!photoBlob) {
      navigate('/photo');
    }
  }, [memberData, photoBlob, navigate]);

  const formattedDob = memberData?.dob
    ? (() => { try { return format(new Date(memberData.dob), 'dd MMMM yyyy'); } catch { return memberData.dob; } })()
    : '';

  // Step 1: Save member + photo to DB
  const saveToDatabase = async () => {
    setSavingStatus('saving');
    try {
      const formData = new FormData();
      formData.append('photo', photoBlob, 'photo.jpg');
      formData.append('name', memberData.name);
      formData.append('dob', memberData.dob);
      formData.append('gender', memberData.gender);
      formData.append('father', memberData.father);
      formData.append('mother', memberData.mother);
      formData.append('place', memberData.place);
      if (memberData.phone && memberData.phone.trim() !== '') {
        formData.append('phone', memberData.phone);
      }
      if (memberData.email && memberData.email.trim() !== '') {
        formData.append('email', memberData.email);
      }
      if (memberData.bloodGroup && memberData.bloodGroup.trim() !== '') {
        formData.append('bloodGroup', memberData.bloodGroup);
      }

      const res = await membersAPI.createWithPhoto(formData);
      const { _id, memberId: dbId, photoUrl: pUrl } = res.data;

      // Commit to context
      setMemberId(_id);
      setMemberDbId(dbId);
      setPhotoUrl(pUrl);
      setSavedMemberId(_id);
      setSavingStatus('saved');
      return _id;
    } catch (error) {
      setSavingStatus('idle');
      toast.error(error.message || 'Failed to save your details');
      return null;
    }
  };

  // Step 2: Open Razorpay
  const openPayment = async (mongoId) => {
    setSavingStatus('paying');
    try {
      const orderRes = await paymentAPI.createOrder(mongoId);
      const { orderId, amount, currency, memberName, memberEmail, memberPhone } = orderRes.data;

      const options = {
        key: RAZORPAY_KEY,
        amount,
        currency,
        name: 'USRA',
        description: 'Membership Campaign 2026',
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyRes = await paymentAPI.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              memberId: mongoId,
            });
            if (verifyRes.success) {
              setPaymentData({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                memberDbId: verifyRes.data.memberDbId,
              });
              toast.success('Payment successful! 🎉');
              navigate('/success');
            }
          } catch (err) {
            toast.error('Payment verification failed. Please contact support.');
            setSavingStatus('saved');
          }
        },
        prefill: { name: memberName, email: memberEmail, contact: `+91${memberPhone}` },
        theme: { color: '#4EAEE5' },
        modal: {
          ondismiss: async () => {
            await paymentAPI.markFailed(mongoId).catch(() => { });
            toast.error('Payment cancelled');
            setSavingStatus('saved'); // allow retry
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async () => {
        await paymentAPI.markFailed(mongoId).catch(() => { });
        toast.error('Payment failed. Please try again.');
        setSavingStatus('saved');
      });
      rzp.open();
    } catch (error) {
      toast.error(error.message || 'Failed to initiate payment');
      setSavingStatus('saved');
    }
  };

  // Main CTA handler
  const handleConfirmAndPay = async () => {
    // If already saved (e.g. after a cancelled payment), go straight to payment
    if (savingStatus === 'saved' && savedMemberId) {
      await openPayment(savedMemberId);
      return;
    }
    const mongoId = await saveToDatabase();
    if (mongoId) await openPayment(mongoId);
  };

  const isLoading = savingStatus === 'saving' || savingStatus === 'paying';

  const statusLabel = {
    idle: <><FiCreditCard className="w-5 h-5" /> Confirm & Pay ₹100</>,
    saving: <><div className="spinner" /> Saving your details...</>,
    saved: <><FiCreditCard className="w-5 h-5" /> Proceed to Pay ₹100</>,
    paying: <><div className="spinner" /> Opening Payment...</>,
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="sticky top-0 z-20 glass border-b border-white/30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/photo')} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <img src={usraLogo} alt="USRA" className="w-8 h-8 object-contain" />
          <div>
            <h1 className="text-base font-black text-gray-800">Review & Confirm</h1>
            <p className="text-xs text-gray-500">Step 3 of 4</p>
          </div>
        </div>
        <StepIndicator currentStep={3} />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-800 mb-2">
            Review & <span className="gradient-text">Confirm</span>
          </h2>
          <p className="text-gray-500">Everything looks right? Your data saves only when you tap confirm.</p>
        </div>


        {/* Photo + Name */}
        <div className="glass rounded-3xl p-6 shadow-card flex flex-col sm:flex-row items-center gap-5">
          {photoPreviewUrl && (
            <img
              src={photoPreviewUrl}
              alt="Profile"
              className="w-24 h-32 object-cover rounded-2xl shadow-lg border-4 border-white flex-shrink-0"
            />
          )}
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-black text-gray-800">{memberData?.name}</h3>
            <p className="text-gray-500 mt-1">{memberData?.place}</p>
          </div>
          <button
            onClick={() => navigate('/photo')}
            disabled={isLoading}
            className="sm:ml-auto p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-usra-blue transition-all disabled:opacity-40"
            title="Change photo"
          >
            <FiEdit className="w-5 h-5" />
          </button>
        </div>

        {/* Member details */}
        <div className="glass rounded-3xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-700">Member Information</h3>
            <button
              onClick={() => navigate('/register')}
              disabled={isLoading}
              className="flex items-center gap-1 text-sm text-usra-blue font-semibold hover:underline disabled:opacity-40"
            >
              <FiEdit className="w-4 h-4" /> Edit
            </button>
          </div>

          <DetailRow icon={FiUser} label="Full Name" value={memberData?.name} />
          <DetailRow icon={FiCalendar} label="Date of Birth" value={formattedDob} />
          <DetailRow icon={FiUser} label="Gender" value={memberData?.gender} />
          <DetailRow icon={FiUser} label="Father's Name" value={memberData?.father} />
          <DetailRow icon={FiUser} label="Mother's Name" value={memberData?.mother} />
          <DetailRow icon={FiMapPin} label="Place" value={memberData?.place} color="text-green-600" />
          {memberData?.bloodGroup && (
            <DetailRow
              icon={MdBloodtype}
              label="Blood Group"
              value={memberData?.bloodGroup}
              color="text-red-500"
            />
          )}
          {memberData?.phone && <DetailRow icon={FiPhone} label="Phone" value={`+91 ${memberData.phone}`} />}
          {memberData?.email && <DetailRow icon={FiMail} label="Email" value={memberData.email} />}
        </div>

        {/* Payment summary */}
        <div className="glass rounded-3xl p-6 shadow-card">
          <h3 className="font-bold text-gray-700 mb-4">Payment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">USRA Membership 2026</span>
              <span className="font-semibold text-gray-800">₹100.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Processing Fee</span>
              <span className="font-semibold text-green-600">FREE</span>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between">
              <span className="font-bold text-gray-800">Total Amount</span>
              <span className="text-2xl font-black gradient-text">₹100</span>
            </div>
          </div>
        </div>

        {/* Accepted methods */}
        <div className="glass rounded-2xl p-4 shadow-card">
          <p className="text-xs text-gray-500 text-center mb-3 font-semibold">ACCEPTED PAYMENT METHODS</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {['UPI', 'Cards', 'Net Banking', 'Wallets'].map((m) => (
              <span key={m} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg">{m}</span>
            ))}
          </div>
        </div>

        <button
          onClick={handleConfirmAndPay}
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-3 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {statusLabel[savingStatus]}
        </button>

        <p className="text-center text-xs text-gray-400 pb-8">
          By confirming, your details will be saved and ₹100 will be charged
        </p>
      </div>
    </div>
  );
};

export default ConfirmPage;
