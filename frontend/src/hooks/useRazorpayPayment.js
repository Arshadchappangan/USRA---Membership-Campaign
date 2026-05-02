import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { paymentAPI } from '../utils/api';
import { useMembership } from '../context/MembershipContext';

const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID;

/**
 * useRazorpayPayment
 *
 * Handles the full Razorpay payment lifecycle:
 *   1. Create an order via your backend
 *   2. Open the Razorpay modal
 *   3. Verify the payment after success
 *   4. Mark as failed on cancellation / failure
 *
 * @returns {{
 *   openPayment: (mongoId: string) => Promise<void>,
 *   paymentStatus: 'idle' | 'paying' | 'success' | 'failed',
 *   isPaymentLoading: boolean,
 * }}
 */
export const useRazorpayPayment = () => {
  const navigate = useNavigate();
  const { setPaymentData } = useMembership();

  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle | paying | success | failed

  const openPayment = useCallback(async (mongoId) => {
    if (!mongoId) {
      toast.error('Member ID is missing. Cannot initiate payment.');
      return;
    }

    setPaymentStatus('paying');

    try {
      // 1️⃣ Create order on backend
      const orderRes = await paymentAPI.createOrder(mongoId);
      const { orderId, amount, currency, memberName, memberEmail, memberPhone } = orderRes.data;

      // 2️⃣ Razorpay options
      const options = {
        key: RAZORPAY_KEY,
        amount,
        currency,
        name: 'USRA',
        description: 'Membership Campaign 2026',
        order_id: orderId,

        // 3️⃣ On successful payment → verify with backend
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
              setPaymentStatus('success');
              toast.success('Payment successful! 🎉');
              navigate('/success');
            } else {
              throw new Error('Verification returned unsuccessful');
            }
          } catch (err) {
            setPaymentStatus('failed');
            toast.error('Payment verification failed. Please contact support.');
          }
        },

        prefill: {
          name: memberName,
          email: memberEmail,
          contact: memberPhone ? `+91${memberPhone}` : '',
        },

        theme: { color: '#4EAEE5' },

        modal: {
          // 4️⃣ User dismissed the modal
          ondismiss: async () => {
            await paymentAPI.markFailed(mongoId).catch(() => {});
            setPaymentStatus('failed');
            toast.error('Payment cancelled.');
            navigate('/', { replace: true });
          },
        },
      };

      const rzp = new window.Razorpay(options);

      // 5️⃣ Hard payment failure (network / bank decline)
      rzp.on('payment.failed', async () => {
        await paymentAPI.markFailed(mongoId).catch(() => {});
        setPaymentStatus('failed');
        toast.error('Payment failed. Please try again.');
        navigate('/', { replace: true });
      });

      rzp.open();
    } catch (error) {
      setPaymentStatus('failed');
      toast.error(error.message || 'Failed to initiate payment.');
    }
  }, [navigate, setPaymentData]);

  return {
    openPayment,
    paymentStatus,
    isPaymentLoading: paymentStatus === 'paying',
  };
};