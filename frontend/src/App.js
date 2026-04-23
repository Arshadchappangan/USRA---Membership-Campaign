import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MembershipProvider } from './context/MembershipContext';

import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import PhotoPage from './pages/PhotoPage';
import ConfirmPage from './pages/ConfirmPage';
import SuccessPage from './pages/SuccessPage';
import MembersPage from './pages/MembersPage';
import NotFoundPage from './pages/NotFoundPage';

// Load Razorpay script globally
const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Scroll to top on route change
const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);
  return null;
};

const AppContent = () => {
  useEffect(() => {
    loadRazorpay().then((loaded) => {
      if (!loaded) console.warn('Razorpay SDK failed to load');
    });
  }, []);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/photo" element={<PhotoPage />} />
        <Route path="/confirm" element={<ConfirmPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <MembershipProvider>
        <AppContent />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '16px',
              background: '#1A1A2E',
              color: '#fff',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: '600',
              padding: '14px 20px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </MembershipProvider>
    </BrowserRouter>
  );
}

export default App;
