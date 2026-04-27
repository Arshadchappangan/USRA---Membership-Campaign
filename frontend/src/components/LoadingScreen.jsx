// src/components/LoadingScreen.jsx

import usraLogo from '../assets/USRA-removebg.png';

export const LoadingScreen = ({ message = 'Loading' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
      style={{ background: 'var(--bg-hero, linear-gradient(135deg, #f0f7ff 0%, #fdf4ff 50%, #fff0f7 100%))' }}>

      {/* Decorative blobs (match your LandingPage) */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 animate-spin-slow"
        style={{ background: 'radial-gradient(circle, #4EAEE5, transparent)' }} />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 animate-spin-slow"
        style={{ background: 'radial-gradient(circle, #E91E8C, transparent)', animationDirection: 'reverse' }} />

      {/* Spinning logo */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
          style={{
            borderTopColor: '#4EAEE5',
            borderRightColor: '#9B59B6',
            animationDuration: '1.1s',
            animationTimingFunction: 'cubic-bezier(0.6,0.2,0.4,0.8)'
          }} />
        {/* Middle ring */}
        <div className="absolute inset-[10px] rounded-full border-[3px] border-transparent animate-spin"
          style={{
            borderBottomColor: '#E91E8C',
            borderLeftColor: '#4EAEE5',
            animationDuration: '1.6s',
            animationDirection: 'reverse',
            animationTimingFunction: 'cubic-bezier(0.4,0.2,0.6,0.8)'
          }} />
        {/* Inner ring */}
        <div className="absolute inset-[20px] rounded-full border-2 border-transparent animate-spin"
          style={{
            borderTopColor: '#9B59B6',
            borderRightColor: '#E91E8C',
            animationDuration: '2s',
            animationTimingFunction: 'linear'
          }} />
        {/* Logo pulse */}
        <img
          src={usraLogo}
          alt="USRA"
          className="relative w-16 h-16 object-contain animate-pulse"
          style={{ animationDuration: '2s' }}
        />
      </div>

      {/* Brand text */}
      <div className="text-center">
        <h1 className="text-2xl font-black tracking-[0.3em] gradient-text mb-1">USRA</h1>
        <p className="text-xs text-gray-400 font-medium tracking-wide">
          United Service for Relational Amalgamation
        </p>
      </div>

      {/* Loading label + animated dots */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-sm text-gray-400 font-medium">{message}</span>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{
                background: ['#4EAEE5', '#9B59B6', '#E91E8C'][i],
                animationDelay: `${i * 0.18}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Subtle tagline */}
      <p className="text-xs text-gray-300 absolute bottom-8 tracking-wider">
        Membership Campaign 2026
      </p>
    </div>
  );
};