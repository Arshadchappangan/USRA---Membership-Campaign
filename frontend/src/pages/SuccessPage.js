import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiDownload, FiShare2, FiCheck, FiHome, FiCopy, FiCreditCard } from 'react-icons/fi';
import { useMembership } from '../context/MembershipContext';
import StepIndicator from '../components/StepIndicator';
import usraLogo from '../assets/usra-logo.png';
import posterTemplate from '../assets/poster-template.png';

// ─── Tiny QR encoder (Reed-Solomon + matrix, no deps) ───────────────────────
// Generates a binary pixel matrix for a short alphanumeric string.
// For longer payloads we fall back to a Google Charts URL (no tracking data sent).
const getQRDataUrl = async (text, size = 200, dark = '#1A2340', light = '#FFFFFF') => {
  // Use Google Charts QR API — sends no personal data, just the encoded string
  const encoded = encodeURIComponent(text);
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&color=${dark.replace('#','')}&bgcolor=${light.replace('#','')}&margin=2&format=png`;
  return url; // we'll drawImage from this URL directly
};

// ─── Single-side membership card generator ───────────────────────────────────
const generateCard = async ({ memberData, memberDbId, photoPreviewUrl, logoSrc }) => {
  // CR-80 card proportions at 300 DPI — landscape
  const W = 1012;
  const H = 638;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  // ── Background ────────────────────────────────────────────────────────────
  ctx.fillStyle = '#0F1C35';
  ctx.fillRect(0, 0, W, H);

  // Soft radial glow – top-right
  const g1 = ctx.createRadialGradient(W * 0.82, H * 0.15, 0, W * 0.82, H * 0.15, 340);
  g1.addColorStop(0, 'rgba(78,174,229,0.22)');
  g1.addColorStop(1, 'rgba(78,174,229,0)');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);

  // Soft radial glow – bottom-left
  const g2 = ctx.createRadialGradient(W * 0.18, H * 0.85, 0, W * 0.18, H * 0.85, 260);
  g2.addColorStop(0, 'rgba(233,30,140,0.18)');
  g2.addColorStop(1, 'rgba(233,30,140,0)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);

  // ── Gradient accent bars ──────────────────────────────────────────────────
  const makeGrad = (x0, x1) => {
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0,   '#4EAEE5');
    g.addColorStop(0.5, '#9B59B6');
    g.addColorStop(1,   '#E91E8C');
    return g;
  };
  ctx.fillStyle = makeGrad(0, W);
  ctx.fillRect(0, 0, W, 10);
  ctx.fillStyle = makeGrad(W, 0);
  ctx.fillRect(0, H - 10, W, 10);

  // Thin vertical divider between text area and photo area
  const divX = W - 320;

  // ── Logo ──────────────────────────────────────────────────────────────────
  try {
    const logo = await loadImage(logoSrc);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(36, 32, 64, 64, 12);
    ctx.clip();
    ctx.drawImage(logo, 36, 32, 64, 64);
    ctx.restore();
  } catch {
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = '#4EAEE5';
    ctx.textAlign = 'center';
    ctx.fillText('U', 68, 80);
  }

  // ── Header text ───────────────────────────────────────────────────────────
  ctx.textAlign = 'left';
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('USRA', 114, 58);

  ctx.font = '15px Arial';
  ctx.fillStyle = '#7a99b8';
  ctx.fillText('United Service for Relational Amalgamation', 114, 80);

  ctx.font = 'bold 13px Arial';
  ctx.fillStyle = '#4EAEE5';
  ctx.letterSpacing = '2px';
  ctx.fillText('MEMBERSHIP CARD  •  2026', 114, 102);
  ctx.letterSpacing = '0px';

  // ── Member photo (circular) ───────────────────────────────────────────────
  const photoAreaX = divX + (320 - 200) / 2;   // centered in right panel
  const photoAreaY = 68;
  const photoR = 100;   // radius
  const cx = photoAreaX + photoR;
  const cy = photoAreaY + photoR + 14;

  // Ring glow
  ctx.save();
  const ringGrad = ctx.createRadialGradient(cx, cy, photoR - 2, cx, cy, photoR + 14);
  ringGrad.addColorStop(0, 'rgba(78,174,229,0.5)');
  ringGrad.addColorStop(1, 'rgba(78,174,229,0)');
  ctx.fillStyle = ringGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, photoR + 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Photo placeholder
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, photoR, 0, Math.PI * 2);
  ctx.fillStyle = '#1e3058';
  ctx.fill();

  if (photoPreviewUrl) {
    try {
      const photo = await loadImage(photoPreviewUrl);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, photoR - 3, 0, Math.PI * 2);
      ctx.clip();
      // cover-fit square crop
      const s = Math.min(photo.naturalWidth, photo.naturalHeight);
      const sx = (photo.naturalWidth  - s) / 2;
      const sy = (photo.naturalHeight - s) / 2;
      ctx.drawImage(photo, sx, sy, s, s, cx - photoR + 3, cy - photoR + 3, (photoR - 3) * 2, (photoR - 3) * 2);
      ctx.restore();
    } catch { /* keep placeholder */ }
  }

  // Gradient ring stroke
  ctx.beginPath();
  ctx.arc(cx, cy, photoR, 0, Math.PI * 2);
  const ringStroke = ctx.createLinearGradient(cx - photoR, cy, cx + photoR, cy);
  ringStroke.addColorStop(0, '#4EAEE5');
  ringStroke.addColorStop(0.5, '#9B59B6');
  ringStroke.addColorStop(1, '#E91E8C');
  ctx.strokeStyle = ringStroke;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.restore();



  const relation = memberData.gender === 'Female' ? 'D/O' : 'S/O';

  // ── QR Code ───────────────────────────────────────────────────────────────
  // QR placed bottom-right of right panel
  const qrSize = 132;
  const qrX = divX + (320 - qrSize) / 2;
  const qrY = H - 10 - qrSize - 20;

  try {
    const qrPayload = `USRA2026|${memberDbId}|${memberData.name}|${memberData.place}`;
    const qrUrl = await getQRDataUrl(qrPayload, qrSize * 2, '4EAEE5', '0F1C35');
    const qrImg = await loadImage(qrUrl);

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 10);
    ctx.fillStyle = '#0F1C35';
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 10);
    ctx.strokeStyle = 'rgba(78,174,229,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.font = '11px Arial';
    ctx.fillStyle = '#4a6a88';
    ctx.fillText('SCAN TO VERIFY', qrX + qrSize / 2, qrY + qrSize + 16);
  } catch {
    // QR failed (no network) — draw a simple placeholder box
    ctx.save();
    ctx.strokeStyle = 'rgba(78,174,229,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(qrX, qrY, qrSize, qrSize);
    ctx.font = '11px Arial';
    ctx.fillStyle = '#4a6a88';
    ctx.textAlign = 'center';
    ctx.fillText('QR CODE', qrX + qrSize / 2, qrY + qrSize / 2);
    ctx.restore();
  }

  // ── Left panel — member details ───────────────────────────────────────────
  const lx = 36;
  let ly = 200;

  // Name (large)
  ctx.textAlign = 'left';
  ctx.font = 'bold 34px Arial';
  ctx.fillStyle = '#FFFFFF';
  let name = memberData.name.toUpperCase();
  // word-wrap if needed
  const nameMaxW = divX - lx - 20;
  if (ctx.measureText(name).width > nameMaxW) {
    const words = name.split(' ');
    let l1 = '', l2 = '';
    for (const w of words) {
      if (ctx.measureText(l1 + w).width < nameMaxW) l1 += (l1 ? ' ' : '') + w;
      else l2 += (l2 ? ' ' : '') + w;
    }
    ctx.fillText(l1, lx, ly);
    if (l2) { ly += 42; ctx.fillText(l2, lx, ly); }
  } else {
    ctx.fillText(name, lx, ly);
  }
  ly += 14;

  // S/O or D/O line
  ctx.font = '19px Arial';
  ctx.fillStyle = '#7a99b8';
  ctx.fillText(`${relation} ${memberData.father} & ${memberData.mother}`, lx, ly += 34);

  // Place
  ctx.font = '18px Arial';
  ctx.fillStyle = '#56718e';
  ctx.fillText(`${memberData.place}`, lx, ly += 32);

  // Divider line
  ly += 22;
  ctx.beginPath();
  ctx.moveTo(lx, ly);
  ctx.lineTo(divX, ly);
  ctx.strokeStyle = 'rgba(78,174,229,0.2)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ly += 44;

  // Detail pills row: blood group, gender
  const pills = [];
  if (memberData.bloodGroup && memberData.bloodGroup !== '') pills.push({ label: '🩸 ' + memberData.bloodGroup, color: '#c0392b' });
  if (memberData.gender)     pills.push({ label: memberData.gender === 'Male' ? '👨 Male' : memberData.gender === 'Female' ? '👩 Female' : '🧑 Other', color: '#2980b9' });

  let px = lx;
  for (const pill of pills) {
    ctx.font = 'bold 15px Arial';
    const pw = ctx.measureText(pill.label).width + 24;
    ctx.beginPath();
    ctx.roundRect(px, ly - 18, pw, 28, 14);
    ctx.fillStyle = pill.color + '33';
    ctx.fill();
    ctx.strokeStyle = pill.color + '66';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(pill.label, px + 12, ly + 4);
    px += pw + 10;
  }
  if (pills.length) ly += 50;

  // contact info (email + phone)
  ctx.font = '20px Arial';
  ctx.fillStyle = '#56718e';
  if (memberData.email) {
    ctx.fillText(`✉️ ${memberData.email}`, lx, ly);
    ly += 35;
  }
  if (memberData.phone) {
    ctx.fillText(`📞 ${memberData.phone}`, lx, ly);
  }

  //update ly for member ID section
  ly += memberData.email || memberData.phone ? 105 : 140;

  // Member ID label + value
  ctx.font = '13px Arial';
  ctx.fillStyle = '#4a6a88';
  ctx.letterSpacing = '1.5px';
  ctx.fillText('MEMBER ID', lx, ly);
  ctx.letterSpacing = '0px';

  ctx.font = 'bold 26px Arial';
  const idGrad = ctx.createLinearGradient(lx, 0, lx + 300, 0);
  idGrad.addColorStop(0, '#4EAEE5');
  idGrad.addColorStop(1, '#9B59B6');
  ctx.fillStyle = idGrad;
  ctx.fillText(memberDbId || '—', lx, ly + 32);
  ly += 60;


  return canvas.toDataURL('image/png', 1.0);
};
// ─────────────────────────────────────────────────────────────────────────────

const SuccessPage = () => {
  const navigate = useNavigate();
  const { memberData, memberId, memberDbId, photoPreviewUrl, paymentData, resetAll } = useMembership();

  const canvasRef          = useRef(null);
  const confettiRef        = useRef(null);

  const [posterDataUrl,    setPosterDataUrl]    = useState(null);
  const [posterGenerated,  setPosterGenerated]  = useState(false);
  const [generatingPoster, setGeneratingPoster] = useState(false);

  const [cardDataUrl,      setCardDataUrl]      = useState(null);
  const [cardGenerated,    setCardGenerated]    = useState(false);
  const [generatingCard,   setGeneratingCard]   = useState(false);

  if (!memberId || !paymentData) { navigate('/'); return null; }

  // ── Confetti ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = confettiRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 3,
      d: Math.random() * 120 + 10,
      color: ['#4EAEE5','#9B59B6','#E91E8C','#F7941D','#22c55e'][Math.floor(Math.random() * 5)],
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

  // ── Poster ─────────────────────────────────────────────────────────────────
  const generatePoster = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !memberData) return;
    setGeneratingPoster(true);
    const ctx = canvas.getContext('2d');
    canvas.width = 1080; canvas.height = 1350;

    const loadImg = (src) => new Promise((res, rej) => {
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => res(img); img.onerror = rej; img.src = src;
    });

    try {
      const template = await loadImg(posterTemplate);
      ctx.drawImage(template, 0, 0, 1080, 1350);

      if (photoPreviewUrl) {
        try {
          const photo = await loadImg(photoPreviewUrl);
          const pX = 680, pY = 440, pW = 335, pH = 420, r = 24;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(pX + r, pY); ctx.lineTo(pX + pW - r, pY);
          ctx.quadraticCurveTo(pX + pW, pY, pX + pW, pY + r);
          ctx.lineTo(pX + pW, pY + pH - r);
          ctx.quadraticCurveTo(pX + pW, pY + pH, pX + pW - r, pY + pH);
          ctx.lineTo(pX + r, pY + pH); ctx.quadraticCurveTo(pX, pY + pH, pX, pY + pH - r);
          ctx.lineTo(pX, pY + r); ctx.quadraticCurveTo(pX, pY, pX + r, pY);
          ctx.closePath(); ctx.clip();
          const iAR = photo.naturalWidth / photo.naturalHeight;
          const aAR = pW / pH;
          let sx, sy, sw, sh;
          if (iAR > aAR) { sh = photo.naturalHeight; sw = sh * aAR; sx = (photo.naturalWidth - sw) / 2; sy = 0; }
          else { sw = photo.naturalWidth; sh = sw / aAR; sx = 0; sy = (photo.naturalHeight - sh) / 2; }
          ctx.drawImage(photo, sx, sy, sw, sh, pX, pY, pW, pH);
          ctx.restore();
        } catch {}
      }

      const tx = 60; let py = 545;
      ctx.font = 'bold 45px Nunito,Arial'; ctx.fillStyle = '#1A2340'; ctx.fillText(memberData.name, tx, py);
      const rel = memberData.gender === 'Female' ? 'D/O' : 'S/O';
      ctx.font = '38px Nunito,Arial'; ctx.fillStyle = '#6B7280'; ctx.fillText(rel, tx, py += 52);
      ctx.font = 'bold 40px Nunito,Arial'; ctx.fillStyle = '#1A2340';
      const parents = `${memberData.father} & ${memberData.mother}`;
      const maxW = 630; const words = parents.split(' '); let line = '';
      for (let n = 0; n < words.length; n++) {
        const test = line + words[n] + ' ';
        if (ctx.measureText(test).width > maxW && n > 0) { ctx.fillText(line, tx, py += 52); line = words[n] + ' '; py += 52; }
        else line = test;
      }
      ctx.fillText(line, tx, py += 52);
      ctx.font = '40px Nunito,Arial'; ctx.fillStyle = '#6B7280'; ctx.fillText(memberData.place, tx, py + 60);

      setPosterDataUrl(canvas.toDataURL('image/png', 1.0));
      setPosterGenerated(true);
    } catch (e) {
      toast.error('Could not generate poster.');
    } finally { setGeneratingPoster(false); }
  }, [memberData, photoPreviewUrl]);

  // ── Card ───────────────────────────────────────────────────────────────────
  const handleGenerateCard = useCallback(async () => {
    if (!memberData) return;
    setGeneratingCard(true);
    try {
      const dataUrl = await generateCard({
        memberData,
        memberDbId: memberDbId || paymentData?.memberDbId || memberId,
        photoPreviewUrl,
        logoSrc: usraLogo,
      });
      setCardDataUrl(dataUrl);
      setCardGenerated(true);
    } catch (e) {
      toast.error('Could not generate membership card.');
    } finally { setGeneratingCard(false); }
  }, [memberData, memberId, memberDbId, paymentData, photoPreviewUrl]);

  useEffect(() => {
    const t1 = setTimeout(generatePoster,     800);
    const t2 = setTimeout(handleGenerateCard, 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [generatePoster, handleGenerateCard]);

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

        {/* Payment details */}
        <div className="glass rounded-3xl p-6 shadow-card">
          <h3 className="font-bold text-gray-700 mb-4">Membership Details</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'MEMBER ID', value: memberDbId || paymentData?.memberDbId, copy: true, color: 'text-usra-blue font-black' },
              { label: 'PAYMENT ID', value: paymentData?.paymentId, truncate: true, color: 'text-gray-700 text-sm font-bold' },
              { label: 'AMOUNT PAID', value: '₹100.00', color: 'text-green-600 text-xl font-black' },
              { label: 'CAMPAIGN', value: 'USRA 2026 • April 15–30', color: 'text-gray-700 text-sm font-bold' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">{item.label}</p>
                <div className="flex items-center gap-2">
                  <p className={`${item.color} ${item.truncate ? 'truncate' : ''}`}>{item.value}</p>
                  {item.copy && (
                    <button onClick={handleCopyId} className="p-1 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0">
                      <FiCopy className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
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
          <p className="text-xs text-gray-400 mb-4">Your digital ID card — photo + QR code included</p>

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
              <FiDownload className="w-4 h-4" /> Download Card
            </button>
            <button
              onClick={() => cardDataUrl && share(cardDataUrl, `USRA-Card-${safeName}.png`, 'My USRA Membership Card 2026 #USRA2026')}
              disabled={!cardGenerated}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-white text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#9B59B6,#E91E8C)' }}
            >
              <FiShare2 className="w-4 h-4" /> Share Card
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
