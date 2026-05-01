import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiDownload, FiShare2, FiCheck, FiHome, FiCopy, FiCreditCard } from 'react-icons/fi';
import { useMembership } from '../context/MembershipContext';
import StepIndicator from '../components/StepIndicator';
import usraLogo from '../assets/usra-logo.png';
import posterTemplate from '../assets/poster-template.png';
import { generateCard } from '../utils/generateCard';
import { generatePoster } from '../utils/generatePoster';
import { usePosterGenerator } from '../hooks/usePosterGenerator';
import { useCardGenerator } from '../hooks/useCardGenerator';


// ─────────────────────────────────────────────────────────────────────────────

const SuccessPage = () => {
  const navigate = useNavigate();
  const { memberData, memberId, memberDbId, photoPreviewUrl, paymentData, resetAll } = useMembership();
  const {
    posterDataUrl,
    posterGenerated,
    generatingPoster,
    generatePoster,
  } = usePosterGenerator();

  const {
    cardDataUrl,
    cardGenerated,
    generatingCard,
    generateCard,
  } = useCardGenerator();

  const canvasRef = useRef(null);
  const confettiRef = useRef(null);


  if (!memberId || !paymentData) { navigate('/'); return null; }

  // ── Confetti ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = confettiRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 3,
      d: Math.random() * 120 + 10,
      color: ['#4EAEE5', '#9B59B6', '#E91E8C', '#F7941D', '#22c55e'][Math.floor(Math.random() * 5)],
      tiltAngle: 0,
      tiltAngleIncrement: Math.random() * 0.07 + 0.05,
      opacity: 1,
    }));

    let angle = 0, animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      angle += 0.01;
      particles.forEach((p, i) => {
        p.tiltAngle += p.tiltAngleIncrement;
        p.y += (Math.cos(angle + p.d) + 1.2) * 1.5;
        p.x += Math.sin(angle) * 1.5;
        p.opacity -= 0.003;
        if (p.opacity <= 0) particles[i] = { ...p, y: -10, x: Math.random() * canvas.width, opacity: 1 };
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.moveTo(p.x + Math.sin(p.tiltAngle) * 15 + p.r / 4, p.y);
        ctx.lineTo(p.x + Math.sin(p.tiltAngle) * 15, p.y + Math.sin(p.tiltAngle) * 15 + p.r / 4);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();
    const t = setTimeout(() => cancelAnimationFrame(animId), 6000);
    return () => { cancelAnimationFrame(animId); clearTimeout(t); };
  }, []);


  useEffect(() => {
    const t1 = setTimeout(() => {
      generatePoster({
        memberData,
        photoPreviewUrl,
        templateSrc: posterTemplate,
        canvas: canvasRef.current,
      });
    }, 800);

    const t2 = setTimeout(() => {
      generateCard({
        memberData,
        memberDbId: memberDbId || paymentData?.memberDbId || memberId,
        photoPreviewUrl,
        logoSrc: usraLogo,
      });
    }, 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [generatePoster, generateCard, memberData]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const download = (dataUrl, filename) => {
    const a = document.createElement('a'); a.download = filename; a.href = dataUrl; a.click();
  };
  const share = async (dataUrl, filename, text) => {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: 'USRA 2026', text, files: [file] });
        toast.success('Shared!');
      } else {
        download(dataUrl, filename);
        toast.success('Downloaded for sharing!');
      }
    } catch (e) { if (e.name !== 'AbortError') download(dataUrl, filename); }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(memberDbId || paymentData?.memberDbId || '');
    toast.success('Member ID copied!');
  };

  const safeName = (memberData?.name || 'member').replace(/\s+/g, '-');

  return (
    <div className="min-h-screen bg-gradient-hero relative">
      <canvas ref={confettiRef} className="fixed inset-0 pointer-events-none z-50" style={{ width: '100%', height: '100%' }} />

      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-white/30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <img src={usraLogo} alt="USRA" className="w-8 h-8 object-contain" />
          <div>
            <h1 className="text-base font-black text-gray-800">Payment Successful</h1>
            <p className="text-xs text-gray-500">Step 4 of 4</p>
          </div>
        </div>
        <StepIndicator currentStep={4} />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Success banner */}
        <div className="rounded-3xl p-8 text-center text-white overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 border-4 border-white/40">
              <FiCheck className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
            <h2 className="text-3xl font-black mb-2">Payment Successful!</h2>
            <p className="text-green-100 font-medium ml-font text-lg">ഞാനും പങ്കാളിയായി...</p>
            <p className="text-green-100 mt-1">Welcome to USRA Family, {memberData?.name}!</p>
          </div>
        </div>

        {/* Hidden poster canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* ── MEMBERSHIP CARD ─────────────────────────────────────────────── */}
        <div className="glass rounded-3xl p-6 shadow-card">
          <h3 className="font-bold text-gray-700 mb-1 flex items-center gap-2">
            <FiCreditCard className="w-5 h-5 text-usra-blue" />
            Membership Card
            {generatingCard && (
              <span className="text-xs text-usra-blue font-normal flex items-center gap-1 ml-1">
                <span className="w-3 h-3 border-2 border-usra-blue border-t-transparent rounded-full animate-spin inline-block" />
                Generating...
              </span>
            )}
            {cardGenerated && (
              <span className="text-xs text-green-600 font-normal flex items-center gap-1 ml-1">
                <FiCheck className="w-3 h-3" /> Ready
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-400 mb-4">Your digital ID card </p>

          {/* Card preview */}
          <div className="rounded-2xl overflow-hidden shadow-xl bg-[#0F1C35] mb-5">
            {cardDataUrl ? (
              <img src={cardDataUrl} alt="Membership Card" className="w-full" />
            ) : (
              <div className="aspect-[1012/638] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-blue-300 text-sm font-medium">Generating card...</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => cardDataUrl && download(cardDataUrl, `USRA-Card-${safeName}.png`)}
              disabled={!cardGenerated}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-white text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#0F1C35,#4EAEE5)' }}
            >
              <FiDownload className="w-4 h-4" /> Download
            </button>
            <button
              onClick={() => cardDataUrl && share(cardDataUrl, `USRA-Card-${safeName}.png`, 'My USRA Membership Card 2026 #USRA2026')}
              disabled={!cardGenerated}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-white text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#9B59B6,#E91E8C)' }}
            >
              <FiShare2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>

        {/* ── CAMPAIGN POSTER ──────────────────────────────────────────────── */}
        <div className="glass rounded-3xl p-6 shadow-card">
          <h3 className="font-bold text-gray-700 mb-1 flex items-center gap-2">
            Campaign Poster
            {generatingPoster && (
              <span className="text-xs text-usra-blue font-normal flex items-center gap-1 ml-1">
                <span className="w-3 h-3 border-2 border-usra-blue border-t-transparent rounded-full animate-spin inline-block" />
                Generating...
              </span>
            )}
            {posterGenerated && (
              <span className="text-xs text-green-600 font-normal flex items-center gap-1 ml-1">
                <FiCheck className="w-3 h-3" /> Ready
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-400 mb-4">Share on WhatsApp, Instagram, Facebook and more</p>

          <div className="rounded-2xl overflow-hidden shadow-lg bg-gray-100 mb-5">
            {posterDataUrl ? (
              <img src={posterDataUrl} alt="Campaign Poster" className="w-full" />
            ) : (
              <div className="aspect-[4/5] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-usra-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Generating poster...</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => posterDataUrl && download(posterDataUrl, `USRA-Poster-${safeName}.png`)}
              disabled={!posterGenerated}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-white text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#4EAEE5,#9B59B6)' }}
            >
              <FiDownload className="w-4 h-4" /> Download
            </button>
            <button
              onClick={() => posterDataUrl && share(posterDataUrl, `USRA-Poster-${safeName}.png`, 'I joined the USRA Membership Campaign 2026! ഞാനും പങ്കാളിയായി... #USRA2026')}
              disabled={!posterGenerated}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-white text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#E91E8C,#9B59B6)' }}
            >
              <FiShare2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>

        {/* What's next */}
        <div className="glass rounded-3xl p-6 shadow-card">
          <h3 className="font-bold text-gray-700 mb-4">What's Next?</h3>
          <div className="space-y-2.5">
            {[
              { icon: '💳', text: 'Save your digital membership card to your gallery' },
              { icon: '📱', text: 'Share your poster on social media with #USRA2026' },
              { icon: '👥', text: 'Invite friends and family to join the campaign' },
              { icon: '📧', text: 'Check your email for membership confirmation' },
              { icon: '🏆', text: 'Stay tuned for USRA events and activities' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                <span className="text-lg">{item.icon}</span>
                <p className="text-sm text-gray-600 font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => { resetAll(); navigate('/'); }}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold hover:border-usra-blue hover:text-usra-blue transition-all bg-white/80"
        >
          <FiHome className="w-5 h-5" /> Back to Home
        </button>

        <p className="text-center text-xs text-gray-400 pb-8">
          USRA — United Service for Relational Amalgamation • Campaign 2026
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;
