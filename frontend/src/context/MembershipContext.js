import React, { createContext, useContext, useState, useCallback } from 'react';

const MembershipContext = createContext();

export const MembershipProvider = ({ children }) => {
  // Form data — lives only in memory until confirmation
  const [memberData, setMemberData] = useState({
    name: '', dob: '', gender: '', father: '', mother: '',
    place: '', bloodGroup: '', phone: '', email: '',
  });

  // Photo blob — stored in memory, sent to server only at confirmation
  const [photoBlob, setPhotoBlob] = useState(null);       // File/Blob object
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null); // local object URL for display

  // Set only AFTER successful DB save on ConfirmPage
  const [memberId, setMemberId] = useState(null);       // MongoDB _id
  const [memberDbId, setMemberDbId] = useState(null);   // USRA-xxx ID
  const [photoUrl, setPhotoUrl] = useState(null);       // server path

  // Payment result
  const [paymentData, setPaymentData] = useState(null);

  const updateMemberData = useCallback((data) => {
    setMemberData(prev => ({ ...prev, ...data }));
  }, []);

  const resetAll = useCallback(() => {
    setMemberData({ name: '', dob: '', gender: '', father: '', mother: '', place: '', bloodGroup: '', phone: '', email: '' });
    setPhotoBlob(null);
    setPhotoPreviewUrl(null);
    setMemberId(null);
    setMemberDbId(null);
    setPhotoUrl(null);
    setPaymentData(null);
  }, []);

  return (
    <MembershipContext.Provider value={{
      memberData, updateMemberData,
      photoBlob, setPhotoBlob,
      photoPreviewUrl, setPhotoPreviewUrl,
      memberId, setMemberId,
      memberDbId, setMemberDbId,
      photoUrl, setPhotoUrl,
      paymentData, setPaymentData,
      resetAll,
    }}>
      {children}
    </MembershipContext.Provider>
  );
};

export const useMembership = () => {
  const context = useContext(MembershipContext);
  if (!context) throw new Error('useMembership must be used within MembershipProvider');
  return context;
};
