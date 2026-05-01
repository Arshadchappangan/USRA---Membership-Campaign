import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiUser, FiCalendar, FiLogIn, FiLoader, FiEye, FiEyeOff, FiAlertCircle, FiShield } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import logo from '../assets/USRA-removebg.png';

// ─── Floating label input ──────────────────────────────────────────────────────
function FloatInput({ id, label, value, onChange, type = "text", icon: Icon, error, autoFocus }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || !!value;

  return (
    <div className="relative">
      <div
        className="relative flex items-center rounded-2xl transition-all duration-200"
        style={{
          border: error
            ? "1.5px solid rgba(239,68,68,0.6)"
            : focused
            ? "1.5px solid #4EAEE5"
            : "1.5px solid rgba(78,174,229,0.2)",
          background: focused ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.7)",
          boxShadow: focused ? "0 0 0 4px rgba(78,174,229,0.1)" : "none",
        }}
      >
        {/* Icon */}
        <div className="flex items-center justify-center w-11 h-12 flex-shrink-0">
          <Icon size={16} style={{ color: focused ? "#4EAEE5" : "#9ca3af", transition: "color 0.2s" }} />
        </div>

        {/* Input */}
        <div className="relative flex-1 pr-3">
          <label
            htmlFor={id}
            className="absolute left-0 pointer-events-none font-semibold transition-all duration-200"
            style={{
              top: lifted ? "6px" : "50%",
              transform: lifted ? "none" : "translateY(-50%)",
              fontSize: lifted ? "10px" : "14px",
              color: error ? "#ef4444" : lifted ? "#4EAEE5" : "#9ca3af",
              letterSpacing: lifted ? "0.06em" : "normal",
              textTransform: lifted ? "uppercase" : "none",
            }}
          >
            {label}
          </label>
          <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus={autoFocus}
            className="w-full bg-transparent outline-none font-semibold text-gray-800 text-sm"
            style={{ paddingTop: lifted ? "18px" : "0", paddingBottom: lifted ? "4px" : "0", height: "48px" }}
          />
        </div>
      </div>
      {error && (
        <p className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-red-500 px-1">
          <FiAlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

// ─── Main LoginPage ────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate     = useNavigate();
  const location     = useLocation();
  const { login, user } = useAuth();
  const from         = location.state?.from?.pathname || "/";

  const [memberId, setMemberId] = useState("");
  const [dob,      setDob]      = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [fieldErr, setFieldErr] = useState({});
  const [success,  setSuccess]  = useState(false);
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    if (user) navigate(from, { replace: true });
  }, [user]);

  const validate = () => {
    const errs = {};
    if (!memberId.trim()) errs.memberId = "Member ID is required";
    else if (!/^USRA-\d{4}$/i.test(memberId.trim())) errs.memberId = "Format: USRA-0001";
    if (!dob) errs.dob = "Date of birth is required";
    setFieldErr(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;
    setError("");
    setLoading(true);
    try {
      const loggedIn = await login(memberId.trim().toUpperCase(), dob);
      setSuccess(true);
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 900);
    } catch (err) {
      const msg = err?.response?.data?.message || "Invalid Member ID or Date of Birth.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blob1    { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.05)} 66%{transform:translate(-20px,15px) scale(0.97)} }
        @keyframes blob2    { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-25px,20px) scale(1.03)} 66%{transform:translate(20px,-15px) scale(0.98)} }
        @keyframes checkIn  { from{transform:scale(0) rotate(-20deg);opacity:0} to{transform:scale(1) rotate(0deg);opacity:1} }
        .fade-up-1 { animation: fadeUp 0.5s ease both; animation-delay: 0.05s; }
        .fade-up-2 { animation: fadeUp 0.5s ease both; animation-delay: 0.12s; }
        .fade-up-3 { animation: fadeUp 0.5s ease both; animation-delay: 0.19s; }
        .fade-up-4 { animation: fadeUp 0.5s ease both; animation-delay: 0.26s; }
        .fade-up-5 { animation: fadeUp 0.5s ease both; animation-delay: 0.33s; }
        .blob1 { animation: blob1 8s ease-in-out infinite; }
        .blob2 { animation: blob2 10s ease-in-out infinite; }
        .check-anim { animation: checkIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>

      <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8"
        style={{ background: "linear-gradient(145deg, #f0f4ff 0%, #faf5ff 50%, #f0fff8 100%)" }}>

        {/* Decorative blobs */}
        <div className="fixed pointer-events-none" style={{ inset: 0, zIndex: 0 }}>
          <div className="blob1 absolute rounded-full opacity-30"
            style={{ width: 480, height: 480, top: "-120px", right: "-80px", background: "radial-gradient(circle, #4EAEE5 0%, transparent 70%)" }} />
          <div className="blob2 absolute rounded-full opacity-20"
            style={{ width: 420, height: 420, bottom: "-100px", left: "-60px", background: "radial-gradient(circle, #E91E8C 0%, transparent 70%)" }} />
          <div className="absolute rounded-full opacity-15"
            style={{ width: 300, height: 300, top: "40%", left: "55%", background: "radial-gradient(circle, #9B59B6 0%, transparent 70%)" }} />
        </div>

        {/* Card */}
        <div
          className="relative w-full z-10"
          style={{
            maxWidth: 440,
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        >
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(24px)",
              border: "1.5px solid rgba(78,174,229,0.18)",
              boxShadow: "0 24px 64px rgba(78,174,229,0.15), 0 0 0 1px rgba(255,255,255,0.6) inset",
            }}
          >
            {/* Top gradient bar */}
            <div className="h-1.5" style={{ background: "linear-gradient(90deg, #4EAEE5, #9B59B6, #E91E8C, #43B89C, #4EAEE5)", backgroundSize: "200% 100%", animation: "gradMove 4s linear infinite" }} />

            <div className="px-8 pt-8 pb-8">
              {/* Logo + brand */}
              <div className="fade-up-1 flex flex-col items-center mb-8">
                <div
                  className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                >
                  <img src={logo} alt="USRA Logo" style={{ width: "100%", height: "100%" }} />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">USRA Member Portal</h1>
                <p className="text-sm text-gray-400 font-medium mt-1">Sign in to access your profile</p>
              </div>

              {/* Success state */}
              {success ? (
                <div className="flex flex-col items-center py-6">
                  <div className="check-anim flex items-center justify-center w-16 h-16 rounded-full mb-4"
                    style={{ background: "linear-gradient(135deg, #43B89C, #4EAEE5)", boxShadow: "0 8px 24px rgba(67,184,156,0.4)" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="font-black text-gray-800 text-lg">Welcome back!</p>
                  <p className="text-sm text-gray-400 mt-1">Redirecting to your dashboard…</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="space-y-4">
                    {/* Member ID */}
                    <div className="fade-up-2">
                      <FloatInput
                        id="memberId"
                        label="Member ID"
                        value={memberId}
                        onChange={(v) => { setMemberId(v); setFieldErr((e) => ({ ...e, memberId: "" })); setError(""); }}
                        icon={FiUser}
                        error={fieldErr.memberId}
                        autoFocus
                      />
                      <p className="text-[11px] text-gray-400 mt-1.5 px-1 font-medium">Format: USRA-0001</p>
                    </div>

                    {/* Date of Birth */}
                    <div className="fade-up-3">
                      <FloatInput
                        id="dob"
                        label="Date of Birth"
                        value={dob}
                        onChange={(v) => { setDob(v); setFieldErr((e) => ({ ...e, dob: "" })); setError(""); }}
                        type="date"
                        icon={FiCalendar}
                        error={fieldErr.dob}
                      />
                    </div>

                    {/* Global error */}
                    {error && (
                      <div className="fade-up-3 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold text-red-600"
                        style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
                        <FiAlertCircle size={15} className="flex-shrink-0" />
                        {error}
                      </div>
                    )}

                    {/* Submit */}
                    <div className="fade-up-4 pt-1">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-black text-white transition-all duration-200 active:scale-[0.98]"
                        style={{
                          background: loading
                            ? "rgba(78,174,229,0.4)"
                            : "linear-gradient(135deg, #4EAEE5, #9B59B6)",
                          boxShadow: loading ? "none" : "0 6px 20px rgba(78,174,229,0.35)",
                        }}
                      >
                        {loading
                          ? <><FiLoader size={16} className="animate-spin" /> Verifying…</>
                          : <><FiLogIn size={16} /> Sign In</>
                        }
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Info note */}
              {!success && (
                <div className="fade-up-5 mt-6 flex items-start gap-2.5 px-4 py-3 rounded-2xl"
                  style={{ background: "rgba(78,174,229,0.06)", border: "1px solid rgba(78,174,229,0.14)" }}>
                  <FiShield size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#4EAEE5" }} />
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    Use your <strong className="text-gray-700">USRA Member ID</strong> and registered <strong className="text-gray-700">date of birth</strong> to sign in. No password needed.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-5 font-medium">
            USRA · All rights reserved
          </p>
        </div>
      </div>
    </>
  );
}