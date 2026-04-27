import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import toast from 'react-hot-toast';
import { FiUpload, FiCamera, FiCheck, FiArrowLeft, FiArrowRight, FiRotateCw, FiZoomIn, FiZoomOut } from 'react-icons/fi';
import { useMembership } from '../context/MembershipContext';
import StepIndicator from '../components/StepIndicator';
import usraLogo from '../assets/usra-logo.png';

const PhotoPage = () => {
  const navigate = useNavigate();
  const { memberData, setPhotoBlob, setPhotoPreviewUrl, photoPreviewUrl } = useMembership();
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedPreview, setCroppedPreview] = useState(photoPreviewUrl || null);
  const [hasCropped, setHasCropped] = useState(!!photoPreviewUrl);
  const cropperRef = useRef(null);
  const fileInputRef = useRef(null);

  // Redirect if no form data filled
  useEffect(() => {
    if (!memberData?.name) {
      navigate('/register');
    }
  }, [memberData, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be smaller than 5MB'); return; }
    const reader = new FileReader();
    reader.onload = (e) => { setImageSrc(e.target.result); setCroppedPreview(null); setHasCropped(false); };
    reader.readAsDataURL(file);
  };

  const handleCrop = useCallback(() => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    const canvas = cropper.getCroppedCanvas({ width: 400, height: 500, imageSmoothingQuality: 'high' });
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      setCroppedPreview(url);
      setHasCropped(true);
      // Store blob and preview URL in context — no upload yet
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      setPhotoBlob(file);
      setPhotoPreviewUrl(url);
      toast.success('Photo cropped!');
    }, 'image/jpeg', 0.92);
  }, [setPhotoBlob, setPhotoPreviewUrl]);

  const handleContinue = () => {
    if (!hasCropped) { toast.error('Please crop your photo first'); return; }
    navigate('/confirm');
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="sticky top-0 z-20 glass border-b border-white/30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/register')} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <img src={usraLogo} alt="USRA" className="w-8 h-8 object-contain" />
          <div>
            <h1 className="text-base font-black text-gray-800">Upload Photo</h1>
            <p className="text-xs text-gray-500">Step 2 of 4</p>
          </div>
        </div>
        <StepIndicator currentStep={2} />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-800 mb-2">
            Your <span className="gradient-text">Photo</span>
          </h2>
          <p className="text-gray-500">Upload and crop your photo</p>
          <p className="text-xs text-gray-400 mt-1">Portrait format (4:5 ratio)</p>
        </div>

        {/* Member greeting */}
        {memberData?.name && (
          <div className="glass rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-card">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ background: 'linear-gradient(135deg, #4EAEE5, #9B59B6)' }}>
              {memberData.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-800">{memberData.name}</p>
              <p className="text-xs text-gray-500">{memberData.place}</p>
            </div>
          </div>
        )}

        {/* If already has a cropped photo from context and no new image chosen, show it */}
        {!imageSrc && croppedPreview && (
          <div className="glass rounded-3xl p-6 shadow-card mb-5 animate-fade-in">
            <h3 className="font-bold text-gray-700 mb-4 text-center">Current Photo</h3>
            <div className="flex justify-center mb-4">
              <img src={croppedPreview} alt="Cropped" className="w-40 h-52 object-cover rounded-2xl shadow-lg border-4 border-white" />
            </div>
            <button
              onClick={() => { setCroppedPreview(null); setHasCropped(false); }}
              className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-usra-blue hover:text-usra-blue transition-all text-sm"
            >
              Change Photo
            </button>
          </div>
        )}

        {!imageSrc && !croppedPreview && (
          <div className="glass rounded-3xl p-8 shadow-card mb-5">
            <div
              className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-usra-blue transition-all duration-300 hover:bg-blue-50/30 group"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-usra-blue'); }}
              onDragLeave={(e) => e.currentTarget.classList.remove('border-usra-blue')}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-usra-blue');
                const file = e.dataTransfer.files?.[0];
                if (file) { const r = new FileReader(); r.onload = (ev) => setImageSrc(ev.target.result); r.readAsDataURL(file); }
              }}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ background: 'linear-gradient(135deg, rgba(78,174,229,0.15), rgba(155,89,182,0.15))' }}>
                  <FiCamera className="w-10 h-10 text-usra-blue" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-700 mb-1">Click to upload photo</p>
                  <p className="text-sm text-gray-400">or drag and drop here</p>
                  <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP • Max 5MB</p>
                </div>
                <button type="button" className="btn-primary flex items-center gap-2" style={{ padding: '12px 24px' }}>
                  <FiUpload className="w-4 h-4" /> Choose Photo
                </button>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        )}

        {imageSrc && (
          <div className="space-y-4">
            <div className="glass rounded-3xl p-4 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-700">Adjust Your Photo</h3>
                <button onClick={() => { setImageSrc(null); setCroppedPreview(null); setHasCropped(false); }}
                  className="text-sm text-red-500 hover:text-red-600 font-semibold">
                  Change Photo
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden bg-gray-900">
                <Cropper
                  ref={cropperRef}
                  src={imageSrc}
                  style={{ height: 350, width: '100%' }}
                  aspectRatio={4 / 5}
                  viewMode={1}
                  guides={true}
                  background={false}
                  responsive={true}
                  autoCropArea={0.8}
                />
              </div>

              <div className="flex items-center justify-center gap-3 mt-3">
                {[
                  { label: 'Rotate ←', onClick: () => cropperRef.current?.cropper.rotate(-90), icon: <FiRotateCw className="w-4 h-4 scale-x-[-1]" /> },
                  { label: 'Rotate →', onClick: () => cropperRef.current?.cropper.rotate(90), icon: <FiRotateCw className="w-4 h-4" /> },
                  { label: 'Zoom In', onClick: () => cropperRef.current?.cropper.zoom(0.1), icon: <FiZoomIn className="w-4 h-4" /> },
                  { label: 'Zoom Out', onClick: () => cropperRef.current?.cropper.zoom(-0.1), icon: <FiZoomOut className="w-4 h-4" /> },
                ].map((btn) => (
                  <button key={btn.label} onClick={btn.onClick} title={btn.label}
                    className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700">
                    {btn.icon}
                  </button>
                ))}
              </div>

              <button onClick={handleCrop}
                className="mt-4 w-full py-3 rounded-xl font-bold text-usra-purple border-2 border-usra-purple hover:bg-usra-purple hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                <FiCheck className="w-5 h-5" /> Preview Crop
              </button>
            </div>

            {croppedPreview && (
              <div className="glass rounded-3xl p-6 shadow-card animate-fade-in">
                <h3 className="font-bold text-gray-700 mb-4 text-center">Cropped Preview</h3>
                <div className="flex justify-center">
                  <img src={croppedPreview} alt="Cropped" className="w-40 h-52 object-cover rounded-2xl shadow-lg border-4 border-white" />
                </div>
                <p className="text-center text-sm text-gray-500 mt-3">This is how your photo will appear on the poster</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={!hasCropped}
          className="btn-primary w-full flex items-center justify-center gap-3 text-lg mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Review
          <FiArrowRight className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
};

export default PhotoPage;
