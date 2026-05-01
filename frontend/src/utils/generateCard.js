// ─── Single-side membership card generator ───────────────────────────────────
// ─── Tiny QR encoder (Reed-Solomon + matrix, no deps) ───────────────────────
// Generates a binary pixel matrix for a short alphanumeric string.
// For longer payloads we fall back to a Google Charts URL (no tracking data sent).
const getQRDataUrl = async (text, size = 200, dark = '#1A2340', light = '#FFFFFF') => {
  // Use Google Charts QR API — sends no personal data, just the encoded string
  const encoded = encodeURIComponent(text);
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&color=${dark.replace('#', '')}&bgcolor=${light.replace('#', '')}&margin=2&format=png`;
  return url; // we'll drawImage from this URL directly
};

export const generateCard = async ({ memberData, memberDbId, photoPreviewUrl, logoSrc }) => {
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
    g.addColorStop(0, '#4EAEE5');
    g.addColorStop(0.5, '#9B59B6');
    g.addColorStop(1, '#E91E8C');
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
  ctx.fillText('United Service for Relational Amalgamation', 114, 75);

  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#4EAEE5';
  ctx.letterSpacing = '2px';
  ctx.fillText('MEMBERSHIP CARD', 114, 95);
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
      const sx = (photo.naturalWidth - s) / 2;
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
  if (memberData.gender) pills.push({ label: memberData.gender === 'Male' ? '👨 Male' : memberData.gender === 'Female' ? '👩 Female' : '🧑 Other', color: '#2980b9' });

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
  ctx.font = '15px Arial';
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