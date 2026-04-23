import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiDownload, FiShare2, FiCheck, FiHome, FiCopy, FiCreditCard
} from 'react-icons/fi';
import { useMembership } from '../context/MembershipContext';
import StepIndicator from '../components/StepIndicator';
import usraLogo from '../assets/usra-logo.png';
import posterTemplate from '../assets/poster-template.png';
import QRCode from 'qrcode';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

// ─── Membership Card Generator ────────────────────────────────────────────────
const generateMembershipCard = async ({ memberData, memberId, photoPreviewUrl }) => {
  const CARD_W = 1012;  // CR-80 card at 300 DPI (3.375" × 2.125")
  const CARD_H = 638;

  // ── Front canvas ──────────────────────────────────────────────────────────
  const frontCanvas = document.createElement('canvas');
  frontCanvas.width = CARD_W;
  frontCanvas.height = CARD_H;
  const fc = frontCanvas.getContext('2d');

  const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  // Background
  fc.fillStyle = '#1A2340';
  fc.fillRect(0, 0, CARD_W, CARD_H);

  // Decorative circles
  const grad1 = fc.createRadialGradient(850, 80, 0, 850, 80, 280);
  grad1.addColorStop(0, 'rgba(78,174,229,0.18)');
  grad1.addColorStop(1, 'rgba(78,174,229,0)');
  fc.fillStyle = grad1;
  fc.fillRect(0, 0, CARD_W, CARD_H);

  const grad2 = fc.createRadialGradient(950, 500, 0, 950, 500, 220);
  grad2.addColorStop(0, 'rgba(155,89,182,0.18)');
  grad2.addColorStop(1, 'rgba(155,89,182,0)');
  fc.fillStyle = grad2;
  fc.fillRect(0, 0, CARD_W, CARD_H);

  // Top accent bar
  const topBar = fc.createLinearGradient(0, 0, CARD_W, 0);
  topBar.addColorStop(0, '#4EAEE5');
  topBar.addColorStop(0.5, '#9B59B6');
  topBar.addColorStop(1, '#E91E8C');
  fc.fillStyle = topBar;
  fc.fillRect(0, 0, CARD_W, 14);

  // Bottom accent bar
  const botBar = fc.createLinearGradient(0, 0, CARD_W, 0);
  botBar.addColorStop(0, '#E91E8C');
  botBar.addColorStop(0.5, '#9B59B6');
  botBar.addColorStop(1, '#4EAEE5');
  fc.fillStyle = botBar;
  fc.fillRect(0, CARD_H - 14, CARD_W, 14);

  // Logo area (rounded rect bg)
  fc.save();
  fc.beginPath();
  fc.roundRect(48, 52, 88, 88, 16);
  fc.fillStyle = 'rgba(78,174,229,0.18)';
  fc.fill();
  fc.restore();

  // Try to load USRA logo
  try {
    const logo = await loadImage(usraLogo);
    fc.save();
    fc.beginPath();
    fc.roundRect(52, 56, 80, 80, 12);
    fc.clip();
    fc.drawImage(logo, 52, 56, 80, 80);
    fc.restore();
  } catch {
    // Fallback: draw "U" letter
    fc.font = 'bold 52px Arial';
    fc.fillStyle = '#4EAEE5';
    fc.textAlign = 'center';
    fc.fillText('U', 92, 110);
  }

  // USRA Title
  fc.textAlign = 'left';
  fc.font = 'bold 36px Arial';
  fc.fillStyle = '#ffffff';
  fc.fillText('USRA', 156, 88);

  fc.font = '20px Arial';
  fc.fillStyle = '#8baac8';
  fc.fillText('United Service for Relational Amalgamation', 156, 116);

  fc.font = '18px Arial';
  fc.fillStyle = '#4EAEE5';
  fc.fillText('MEMBERSHIP CARD', 156, 140);


  // ── Member Name ──────────────────────────────────────────────────────────
  fc.font = 'bold 42px Arial';
  fc.fillStyle = '#ffffff';
  fc.fillText(memberData.name.toUpperCase(), 52, 250);

  const relation = memberData.gender === 'Male' ? 'S/O' : 'D/O';
  fc.font = '28px Arial';
  fc.fillStyle = '#8baac8';
  fc.fillText(`${relation} ${memberData.father} & ${memberData.mother}`, 52, 292);

  fc.font = '26px Arial';
  fc.fillStyle = '#6b8ca8';
  fc.fillText(memberData.place, 52, 328);

  // ── Member ID ────────────────────────────────────────────────────────────
  fc.font = '20px Arial';
  fc.fillStyle = '#8baac8';
  fc.letterSpacing = '2px';
  fc.fillText('MEMBER ID', 52, 500);

  fc.font = 'bold 32px Arial';
  fc.fillStyle = '#4EAEE5';
  fc.fillText(memberId, 52, 540);

  // Valid
  fc.textAlign = 'right';
  fc.font = '20px Arial';
  fc.fillStyle = '#8baac8';
  fc.fillText('ISSUED ON', CARD_W - 110, 500);
  fc.font = 'bold 28px Arial';
  fc.fillStyle = '#ffffff';
  fc.fillText('MAY 2026', CARD_W - 110, 534);

  // ── Profile Photo ────────────────────────────────────────────────────────
  const photoX = CARD_W - 220;
  const photoY = 150;
  const photoR = 130;

  fc.save();
  fc.beginPath();
  fc.arc(photoX, photoY + photoR, photoR, 0, Math.PI * 2);
  fc.fillStyle = '#2a3a5e';
  fc.fill();

  if (photoPreviewUrl) {
    try {
      const photo = await loadImage(photoPreviewUrl);
      fc.save();
      fc.beginPath();
      fc.arc(photoX, photoY + photoR, photoR - 4, 0, Math.PI * 2);
      fc.clip();
      // cover-fit
      const iAR = photo.naturalWidth / photo.naturalHeight;
      let sx, sy, sw, sh;
      const d = (photoR - 4) * 2;
      if (iAR > 1) { sh = photo.naturalHeight; sw = sh; sx = (photo.naturalWidth - sw) / 2; sy = 0; }
      else { sw = photo.naturalWidth; sh = sw; sx = 0; sy = (photo.naturalHeight - sh) / 2; }
      fc.drawImage(photo, sx, sy, sw, sh, photoX - photoR + 4, photoY + 4, d, d);
      fc.restore();
    } catch { /* keep placeholder */ }
  }

  // Photo ring
  fc.beginPath();
  fc.arc(photoX, photoY + photoR, photoR, 0, Math.PI * 2);
  fc.strokeStyle = '#4EAEE5';
  fc.lineWidth = 5;
  fc.stroke();
  fc.restore();


  // ── Back canvas ──────────────────────────────────────────────────────────
  const backCanvas = document.createElement('canvas');
  backCanvas.width = CARD_W;
  backCanvas.height = CARD_H;
  const bc = backCanvas.getContext('2d');

  bc.fillStyle = '#1A2340';
  bc.fillRect(0, 0, CARD_W, CARD_H);

  const bg2 = bc.createRadialGradient(200, 500, 0, 200, 500, 300);
  bg2.addColorStop(0, 'rgba(233,30,140,0.14)');
  bg2.addColorStop(1, 'rgba(233,30,140,0)');
  bc.fillStyle = bg2;
  bc.fillRect(0, 0, CARD_W, CARD_H);

  // Top bar
  bc.fillStyle = topBar;
  bc.fillRect(0, 0, CARD_W, 14);
  // Bottom bar
  bc.fillStyle = botBar;
  bc.fillRect(0, CARD_H - 14, CARD_W, 14);




  // ── Real QR Code ─────────────────────────────────────────────────────────

// Build the QR payload — pack whatever data you want verified
const qrPayload = JSON.stringify({
  id:     memberId,
  name:   memberData.name,
  place:  memberData.place,
  year:   2026,
  org:    'USRA',
});

const qrDataUrl = await QRCode.toDataURL(qrPayload, {
  width: 180,          // pixel size of the output image
  margin: 1,           // quiet zone in modules (1 is fine for cards)
  color: {
    dark:  '#4EAEE5',  // module color — matches your brand blue
    light: '#2a3a5e',  // background — matches the card dark bg
  },
  errorCorrectionLevel: 'M', // M = ~15% damage tolerance, good for print
});

const qrImg = await loadImage(qrDataUrl);
const qrX = 52, qrY = 320, qrSize = 180;

// Rounded clip so it fits the card aesthetic
bc.save();
bc.beginPath();
bc.roundRect(qrX, qrY, qrSize, qrSize, 10);
bc.clip();
bc.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
bc.restore();

  // ── Back info text ────────────────────────────────────────────────────────
  bc.textAlign = 'left';
  bc.font = 'bold 30px Arial';
  bc.fillStyle = '#ffffff';
  bc.fillText('USRA CAMPAIGN 2026', 260, 354);

  bc.font = '22px Arial';
  bc.fillStyle = '#8baac8';
  const lines = [
    `Member: ${memberData.name}`,
    `ID: ${memberId}`,
    `Valid: April 15 – 30, 2026`,
    `usra.org.in  •  For support contact your local USRA office`,
    `This card is the property of USRA. If found, please return.`,
  ];
  lines.forEach((line, i) => {
    bc.fillText(line, 260, 395 + i * 38);
  });

  // ── Combine front + back into a single tall image ─────────────────────────
  const finalCanvas = document.createElement('canvas');
  const GAP = 40;
  finalCanvas.width = CARD_W;
  finalCanvas.height = CARD_H * 2 + GAP + 80; // extra 80 for label text
  const fc2 = finalCanvas.getContext('2d');

  fc2.fillStyle = '#f0f0f0';
  fc2.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

  // Labels
  fc2.font = 'bold 28px Arial';
  fc2.fillStyle = '#444';
  fc2.textAlign = 'center';
  fc2.fillText('FRONT', CARD_W / 2, 36);
  fc2.drawImage(frontCanvas, 0, 50);

  fc2.fillText('BACK', CARD_W / 2, CARD_H + 50 + 36);
  fc2.drawImage(backCanvas, 0, CARD_H + 50 + 50);

  return finalCanvas.toDataURL('image/png', 1.0);
};
// ──────────────────────────────────────────────────────────────────────────────

const SuccessPage = () => {
  const navigate = useNavigate();
  const { memberData, memberId, memberDbId, photoPreviewUrl, paymentData, resetAll } = useMembership();
  const canvasRef = useRef(null);
  const [posterGenerated, setPosterGenerated] = useState(false);
  const [generatingPoster, setGeneratingPoster] = useState(false);
  const [posterDataUrl, setPosterDataUrl] = useState(null);

  // Card state
  const [cardDataUrl, setCardDataUrl] = useState(null);
  const [generatingCard, setGeneratingCard] = useState(false);
  const [cardGenerated, setCardGenerated] = useState(false);

  const confettiRef = useRef(null);

  if (!memberId || !paymentData) {
    navigate('/');
    return null;
  }

  // Confetti animation
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
      tilt: Math.floor(Math.random() * 10) - 10,
      tiltAngle: 0,
      tiltAngleIncrement: (Math.random() * 0.07) + 0.05,
      opacity: 1,
    }));

    let angle = 0;
    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      angle += 0.01;
      particles.forEach((p, i) => {
        p.tiltAngle += p.tiltAngleIncrement;
        p.y += (Math.cos(angle + p.d) + 1.2) * 1.5;
        p.x += Math.sin(angle) * 1.5;
        p.tilt = Math.sin(p.tiltAngle) * 15;
        p.opacity -= 0.003;
        if (p.opacity <= 0) {
          particles[i] = { ...p, y: -10, x: Math.random() * canvas.width, opacity: 1 };
        }
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();
    const timeout = setTimeout(() => cancelAnimationFrame(animId), 6000);
    return () => { cancelAnimationFrame(animId); clearTimeout(timeout); };
  }, []);

  // Generate poster
  const generatePoster = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !memberData) return;
    setGeneratingPoster(true);
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1350;

    const loadImage = (src) => new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

    try {
      const template = await loadImage(posterTemplate);
      ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

      if (photoPreviewUrl) {
        try {
          const photo = await loadImage(photoPreviewUrl);
          const photoX = 680, photoY = 440, photoH = 420, photoW = 335;
          ctx.save();
          ctx.beginPath();
          const radius = 24;
          ctx.moveTo(photoX + radius, photoY);
          ctx.lineTo(photoX + photoW - radius, photoY);
          ctx.quadraticCurveTo(photoX + photoW, photoY, photoX + photoW, photoY + radius);
          ctx.lineTo(photoX + photoW, photoY + photoH - radius);
          ctx.quadraticCurveTo(photoX + photoW, photoY + photoH, photoX + photoW - radius, photoY + photoH);
          ctx.lineTo(photoX + radius, photoY + photoH);
          ctx.quadraticCurveTo(photoX, photoY + photoH, photoX, photoY + photoH - radius);
          ctx.lineTo(photoX, photoY + radius);
          ctx.quadraticCurveTo(photoX, photoY, photoX + radius, photoY);
          ctx.closePath();
          ctx.clip();
          const imgAspect = photo.naturalWidth / photo.naturalHeight;
          const areaAspect = photoW / photoH;
          let sx, sy, sw, sh;
          if (imgAspect > areaAspect) { sh = photo.naturalHeight; sw = sh * areaAspect; sx = (photo.naturalWidth - sw) / 2; sy = 0; }
          else { sw = photo.naturalWidth; sh = sw / areaAspect; sx = 0; sy = (photo.naturalHeight - sh) / 2; }
          ctx.drawImage(photo, sx, sy, sw, sh, photoX, photoY, photoW, photoH);
          ctx.strokeStyle = '#1A2340';
          ctx.lineWidth = 6;
          ctx.stroke();
          ctx.restore();
        } catch (e) { console.warn('Photo load error:', e); }
      }

      const textX = 60;
      let py = 545;
      ctx.save();
      ctx.font = 'bold 45px Nunito, Arial';
      ctx.fillStyle = '#1A2340';
      ctx.fillText(memberData.name, textX, py);
      ctx.restore();

      ctx.save();
      ctx.font = '38px Nunito, Arial';
      ctx.fillStyle = '#6B7280';
      ctx.fillText(`${memberData.gender === 'Male' ? 'S/O' : 'D/O'}`, textX, py += 52);
      ctx.restore();

      ctx.save();
      ctx.font = 'bold 40px Nunito, Arial';
      ctx.fillStyle = '#1A2340';
      const parentsText = `${memberData.father} & ${memberData.mother}`;
      const maxWidth = 630;
      const words = parentsText.split(' ');
      let line = '';
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
          ctx.fillText(line, textX, py += 52);
          line = words[n] + ' ';
          py += 52;
        } else { line = testLine; }
      }
      ctx.fillText(line, textX, py += 52);
      ctx.restore();

      ctx.save();
      ctx.font = '40px Nunito, Arial';
      ctx.fillStyle = '#6B7280';
      ctx.fillText(memberData.place, textX, py + 60);
      ctx.restore();

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      setPosterDataUrl(dataUrl);
      setPosterGenerated(true);
    } catch (err) {
      console.error('Poster generation error:', err);
      toast.error('Could not generate poster.');
    } finally {
      setGeneratingPoster(false);
    }
  }, [memberData, photoPreviewUrl]);

  // Generate membership card
  const generateCard = useCallback(async () => {
    if (!memberData) return;
    setGeneratingCard(true);
    try {
      const dataUrl = await generateMembershipCard({
        memberData,
        memberId: memberDbId || paymentData?.memberDbId || memberId,
        photoPreviewUrl,
      });
      setCardDataUrl(dataUrl);
      setCardGenerated(true);
    } catch (err) {
      console.error('Card generation error:', err);
      toast.error('Could not generate membership card.');
    } finally {
      setGeneratingCard(false);
    }
  }, [memberData, memberId, memberDbId, paymentData, photoPreviewUrl]);

  useEffect(() => {
    const t1 = setTimeout(generatePoster, 800);
    const t2 = setTimeout(generateCard, 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [generatePoster, generateCard]);

  const handleDownload = () => {
    if (!posterDataUrl) { toast.error('Poster is still generating...'); return; }
    const link = document.createElement('a');
    link.download = `USRA-Membership-${memberData?.name?.replace(/\s+/g, '-')}-2026.png`;
    link.href = posterDataUrl;
    link.click();
    toast.success('Poster downloaded!');
  };

  const handleDownloadCard = () => {
    if (!cardDataUrl) { toast.error('Card is still generating...'); return; }
    const link = document.createElement('a');
    link.download = `USRA-MemberCard-${memberData?.name?.replace(/\s+/g, '-')}-2026.png`;
    link.href = cardDataUrl;
    link.click();
    toast.success('Membership card downloaded!');
  };

  const handleShare = async () => {
    if (!posterDataUrl) { toast.error('Poster is still generating...'); return; }
    try {
      const res = await fetch(posterDataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'USRA-Membership-2026.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'USRA Membership Campaign 2026',
          text: `I joined the USRA Membership Campaign 2026! #USRA #MembershipCampaign2026`,
          files: [file],
        });
        toast.success('Shared successfully!');
      } else {
        handleDownload();
        toast.success('Downloaded for sharing!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') handleDownload();
    }
  };

  const handleShareCard = async () => {
    if (!cardDataUrl) { toast.error('Card is still generating...'); return; }
    try {
      const res = await fetch(cardDataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'USRA-MemberCard-2026.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'USRA Membership Card 2026',
          text: `My USRA Membership Card 2026 #USRA #MembershipCampaign2026`,
          files: [file],
        });
        toast.success('Card shared!');
      } else {
        handleDownloadCard();
      }
    } catch (err) {
      if (err.name !== 'AbortError') handleDownloadCard();
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(memberDbId || paymentData?.memberDbId || '');
    toast.success('Member ID copied!');
  };

  const handleNewRegistration = () => {
    resetAll();
    navigate('/');
  };

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
          style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 border-4 border-white/40">
              <FiCheck className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
            <h2 className="text-3xl font-black mb-2">Payment Successful!</h2>
            <p className="text-green-100">Welcome to USRA Family, {memberData?.name}!</p>
          </div>
        </div>

        {/* Member details */}
        <div className="glass rounded-3xl p-6 shadow-card">
          <h3 className="font-bold text-gray-700 mb-4">Membership Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Member ID</p>
              <div className="flex items-center gap-2">
                <p className="font-black text-usra-blue">{memberDbId || paymentData?.memberDbId}</p>
                <button onClick={handleCopyId} className="p-1 rounded-lg hover:bg-gray-200 transition-colors">
                  <FiCopy className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Payment ID</p>
              <p className="font-bold text-gray-700 text-sm truncate">{paymentData?.paymentId}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Amount Paid</p>
              <p className="font-black text-green-600 text-xl">₹100.00</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Campaign</p>
              <p className="font-bold text-gray-700 text-sm">USRA 2026 • April 15–30</p>
            </div>
          </div>
        </div>

        {/* Hidden canvas for poster */}
        <canvas ref={canvasRef} className="hidden" />

        {/* ── MEMBERSHIP CARD SECTION ── */}
        <div className="glass rounded-3xl p-6 shadow-card">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <FiCreditCard className="w-5 h-5 text-usra-blue" />
            Premium Membership Card
            {generatingCard && (
              <span className="text-xs text-usra-blue font-normal flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-usra-blue border-t-transparent rounded-full animate-spin" />
                Generating...
              </span>
            )}
            {cardGenerated && (
              <span className="text-xs text-green-600 font-normal flex items-center gap-1">
                <FiCheck className="w-3 h-3" /> Ready
              </span>
            )}
          </h3>

          <div className="rounded-2xl overflow-hidden shadow-lg bg-gray-100 mb-5">
            {cardDataUrl ? (
              <img src={cardDataUrl} alt="Membership Card" className="w-full" />
            ) : (
              <div className="aspect-[4/5] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-usra-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Generating your membership card...</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownloadCard}
              disabled={!cardGenerated}
              className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #1A2340, #4EAEE5)' }}
            >
              <FiDownload className="w-5 h-5" />
              Download Card
            </button>
            <button
              onClick={handleShareCard}
              disabled={!cardGenerated}
              className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #9B59B6, #E91E8C)' }}
            >
              <FiShare2 className="w-5 h-5" />
              Share Card
            </button>
          </div>
          <p className="text-xs text-center text-gray-400 mt-3">
            Your digital membership card — save it to your gallery
          </p>
        </div>

        {/* Poster Section */}
        <div className="glass rounded-3xl p-6 shadow-card">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            Campaign Poster
            {generatingPoster && (
              <span className="text-xs text-usra-blue font-normal flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-usra-blue border-t-transparent rounded-full animate-spin" />
                Generating...
              </span>
            )}
            {posterGenerated && (
              <span className="text-xs text-green-600 font-normal flex items-center gap-1">
                <FiCheck className="w-3 h-3" /> Ready
              </span>
            )}
          </h3>

          <div className="rounded-2xl overflow-hidden shadow-lg bg-gray-100 mb-5">
            {posterDataUrl ? (
              <img src={posterDataUrl} alt="Campaign Poster" className="w-full" />
            ) : (
              <div className="aspect-[4/5] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-usra-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Generating your poster...</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownload}
              disabled={!posterGenerated}
              className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #4EAEE5, #9B59B6)' }}
            >
              <FiDownload className="w-5 h-5" />
              Download
            </button>
            <button
              onClick={handleShare}
              disabled={!posterGenerated}
              className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #E91E8C, #9B59B6)' }}
            >
              <FiShare2 className="w-5 h-5" />
              Share
            </button>
          </div>
          <p className="text-xs text-center text-gray-400 mt-3">
            Share on WhatsApp, Instagram, Facebook and more
          </p>
        </div>

        {/* What's next */}
        <div className="glass rounded-3xl p-6 shadow-card">
          <h3 className="font-bold text-gray-700 mb-4">What's Next?</h3>
          <div className="space-y-3">
            {[
              { icon: '💳', text: 'Save your digital membership card to your gallery' },
              { icon: '📱', text: 'Share your poster on social media with #USRA2026' },
              { icon: '👥', text: 'Encourage friends and family to join the campaign' },
              { icon: '📧', text: 'Check your email for membership confirmation' },
              { icon: '🏆', text: 'Stay tuned for USRA events and activities' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                <span className="text-xl">{item.icon}</span>
                <p className="text-sm text-gray-600 font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleNewRegistration}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold hover:border-usra-blue hover:text-usra-blue transition-all duration-300 bg-white/80"
        >
          <FiHome className="w-5 h-5" />
          Back to Home
        </button>

        <p className="text-center text-xs text-gray-400 pb-8">
          USRA — United Service for Relational Amalgamation • Campaign 2026
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;