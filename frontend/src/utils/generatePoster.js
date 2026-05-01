export const generatePoster = async ({
    memberData,
    photoPreviewUrl,
    templateSrc,
    canvas,
}) => {
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1350;

    const loadImg = (src) =>
        new Promise((res, rej) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => res(img);
            img.onerror = rej;
            img.src = src;
        });

    try {
        const template = await loadImg(templateSrc);
        ctx.drawImage(template, 0, 0, 1080, 1350);

        if (photoPreviewUrl) {
            try {
                const photo = await loadImg(photoPreviewUrl);
                const pX = 80, pY = 500, pW = 268, pH = 336, r = 19;
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(pX + r, pY); ctx.lineTo(pX + pW - r, pY);
                ctx.quadraticCurveTo(pX + pW, pY, pX + pW, pY + r);
                ctx.lineTo(pX + pW, pY + pH - r);
                ctx.quadraticCurveTo(pX + pW, pY + pH, pX + pW - r, pY + pH);
                ctx.lineTo(pX + r, pY + pH); ctx.quadraticCurveTo(pX, pY + pH, pX, pY + pH - r);
                ctx.lineTo(pX, pY + r); ctx.quadraticCurveTo(pX, pY, pX + r, pY);
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(pX + r, pY); ctx.lineTo(pX + pW - r, pY);
                ctx.quadraticCurveTo(pX + pW, pY, pX + pW, pY + r);
                ctx.lineTo(pX + pW, pY + pH - r);
                ctx.quadraticCurveTo(pX + pW, pY + pH, pX + pW - r, pY + pH);
                ctx.lineTo(pX + r, pY + pH); ctx.quadraticCurveTo(pX, pY + pH, pX, pY + pH - r);
                ctx.lineTo(pX, pY + r); ctx.quadraticCurveTo(pX, pY, pX + r, pY);
                ctx.closePath();
                ctx.stroke();
                ctx.closePath(); ctx.clip();
                const iAR = photo.naturalWidth / photo.naturalHeight;
                const aAR = pW / pH;
                let sx, sy, sw, sh;
                if (iAR > aAR) { sh = photo.naturalHeight; sw = sh * aAR; sx = (photo.naturalWidth - sw) / 2; sy = 0; }
                else { sw = photo.naturalWidth; sh = sw / aAR; sx = 0; sy = (photo.naturalHeight - sh) / 2; }
                ctx.drawImage(photo, sx, sy, sw, sh, pX, pY, pW, pH);
                ctx.restore();
            } catch { }
        }

        const tx = 430; let py = 580;
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

        return canvas.toDataURL('image/png', 1.0);
    } catch (e) {
        console.error('Error generating poster:', e);
        throw new Error('Poster generation failed');
    }
};