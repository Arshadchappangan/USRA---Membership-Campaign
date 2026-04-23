import React from 'react';
import { useNavigate } from 'react-router-dom';
import usraLogo from '../assets/USRA-removebg.png';

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center px-4 text-center">
      <img src={usraLogo} alt="USRA" className="w-24 h-24 object-contain mb-6 animate-float" />
      <h1 className="text-8xl font-black gradient-text mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
      <button onClick={() => navigate('/')} className="btn-primary">
        Go Back Home
      </button>
    </div>
  );
};

export default NotFoundPage;
