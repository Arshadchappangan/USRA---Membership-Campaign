import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft, FiEdit2, FiSave, FiLoader, FiDownload, FiCreditCard, FiImage, FiCheck,
  FiAlertCircle, FiPhone, FiUser, FiHash, FiUsers, FiBriefcase, FiCheckCircle,
  FiBook, FiAward, FiPlus, FiTrash2, FiChevronDown,
  FiCamera, FiLogOut, FiShield, FiHeart, FiX, FiRefreshCw,
  FiMoreVertical,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { usePosterGenerator } from "../hooks/usePosterGenerator";
import { useCardGenerator } from "../hooks/useCardGenerator";
import posterTemplate from "../assets/poster-template.png";
import usraLogo from "../assets/USRA-removebg.png";
import { getMemberById, updateMember } from "../utils/api";
import Navbar from "../components/Navbar";
import { useRazorpayPayment } from "../hooks/useRazorpayPayment";
import MembershipPaymentSection from "../components/membershipPaymentSection";

/* ─── Constants ─────────────────────────────────────────────────────────── */
const ACCENT_PAIRS = [
  ["#4EAEE5", "#9B59B6"], ["#9B59B6", "#E91E8C"], ["#E91E8C", "#4EAEE5"],
  ["#4EAEE5", "#43B89C"], ["#F7971E", "#E91E8C"], ["#43B89C", "#9B59B6"],
];
const MARITAL_OPTIONS = ["Single", "Married", "Divorced", "Widowed"];
const EDUCATION_OPTIONS = ["Below 10th", "10th Pass", "12th Pass", "Diploma", "ITI", "Graduate", "Post Graduate", "PhD", "Other"];
const EMPLOYMENT_TYPES = ["Employed", "Self-Employed", "Business", "Student", "Homemaker", "Unemployed", "Retired"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
const SECTORS = ["Government", "Private", "Public Sector", "NGO / Non-Profit", "Military / Defence", "Education", "Healthcare", "Agriculture", "IT / Tech", "Finance", "Other"];

const SECTIONS = [
  { key: "personal", label: "Personal", icon: FiUser },
  { key: "bio", label: "About", icon: FiUsers },
  { key: "contact", label: "Contact", icon: FiPhone },
  { key: "career", label: "Career", icon: FiBriefcase },
  { key: "experience", label: "Experience", icon: FiAward },
  { key: "education", label: "Education", icon: FiBook },
  { key: "downloads", label: "Downloads", icon: FiDownload },
];

/* ─── Completion score ───────────────────────────────────────────────────── */
const computeCompletion = (m, d) => {
  if (!m || !d) return { pct: 0, missing: [] };
  const checks = [
    { key: "dob", label: "Date of birth", val: d.dob },
    { key: "gender", label: "Gender", val: d.gender },
    { key: "bloodGroup", label: "Blood group", val: d.bloodGroup },
    { key: "phone", label: "Phone", val: d.phone },
    { key: "email", label: "Email", val: d.email },
    { key: "place", label: "City / Place", val: d.place },
    { key: "bio", label: "About me", val: d.bio },
    { key: "employmentType", label: "Employment type", val: d.employmentType },
    { key: "organisation", label: "Organisation", val: d.organisation },
    { key: "jobTitle", label: "Job title", val: d.jobTitle },
    { key: "highestQualification", label: "Qualification", val: d.highestQualification },
    { key: "photo", label: "Profile photo", val: m.photo },
  ];
  const filled = checks.filter(c => !!c.val);
  const missing = checks.filter(c => !c.val).map(c => c.label).slice(0, 3);
  return { pct: Math.round((filled.length / checks.length) * 100), missing };
};

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const accentFor = (n = "") => ACCENT_PAIRS[n.length % ACCENT_PAIRS.length];
const initials = (n = "") => n.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
const toDateInput = (d) => { try { return d ? new Date(d).toISOString().split("T")[0] : ""; } catch { return ""; } };

/* ─── Primitive form components ─────────────────────────────────────────── */
const focusStyle = { borderColor: "#4EAEE5" };
const blurStyle = { borderColor: "rgba(78,174,229,0.2)" };
const inputBase = "w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-800 outline-none transition-all";
const inputBg = { background: "rgba(78,174,229,0.05)", border: "1.5px solid rgba(78,174,229,0.2)" };

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input type={type} value={value || ""} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} className={inputBase} style={inputBg}
      onFocus={e => Object.assign(e.target.style, focusStyle)}
      onBlur={e => Object.assign(e.target.style, blurStyle)} />
  );
}

function SelectInput({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select value={value || ""} onChange={e => onChange(e.target.value)}
        className={`${inputBase} appearance-none pl-3 pr-8 cursor-pointer`} style={inputBg}
        onFocus={e => Object.assign(e.target.style, focusStyle)}
        onBlur={e => Object.assign(e.target.style, blurStyle)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <FiChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea value={value || ""} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={rows}
      className={`${inputBase} resize-none`} style={inputBg}
      onFocus={e => Object.assign(e.target.style, focusStyle)}
      onBlur={e => Object.assign(e.target.style, blurStyle)} />
  );
}

function Field({ label, value, edit, children, span2 = false }) {
  return (
    <div className={span2 ? "col-span-2" : ""}>
      <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">{label}</label>
      {edit
        ? children
        : <p className="text-sm font-semibold text-gray-800">{value || <span className="text-gray-300 italic font-normal">Not set</span>}</p>}
    </div>
  );
}

function Divider() {
  return <div className="my-5" style={{ height: "1px", background: "rgba(78,174,229,0.1)" }} />;
}

/* ─── Toast (top-anchored, no keyboard conflict) ────────────────────────── */
function Toast({ msg, type, onDone }) {
  useEffect(() => {
    if (msg) { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }
  }, [msg, onDone]);
  if (!msg) return null;
  const ok = type !== "error";
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold shadow-2xl whitespace-nowrap"
      style={{ background: ok ? "#22c55e" : "#ef4444", color: "#fff", animation: "slideDown 0.3s ease", boxShadow: ok ? "0 8px 30px rgba(34,197,94,0.4)" : "0 8px 30px rgba(239,68,68,0.4)" }}>
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {ok ? <FiCheck size={15} /> : <FiAlertCircle size={15} />} {msg}
    </div>
  );
}

/* ─── Unsaved changes banner ─────────────────────────────────────────────── */
function UnsavedBanner({ section, onSave, onDiscard, saving }) {
  if (!section) return null;
  const label = SECTIONS.find(s => s.key === section)?.label || section;
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl mb-3 flex-wrap gap-y-2"
      style={{ background: "#FAEEDA", border: "1px solid #FAC775" }}>
      <span className="text-xs font-bold" style={{ color: "#854F0B" }}>
        ⚠ Unsaved changes in <strong>{label}</strong>
      </span>
      <div className="flex gap-2">
        <button onClick={onDiscard} className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
          style={{ background: "rgba(133,79,11,0.12)", color: "#854F0B" }}>
          Discard
        </button>
        <button onClick={onSave} disabled={saving} className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
          style={{ background: "#854F0B", color: "#fff" }}>
          {saving ? <FiLoader size={11} className="animate-spin" /> : <FiSave size={11} />} Save now
        </button>
      </div>
    </div>
  );
}

/* ─── Section jump nav pills ─────────────────────────────────────────────── */
function SectionNav({ active }) {
  const scroll = (key) => {
    const el = document.getElementById(`section-${key}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <div className="sticky z-30 -mx-4 px-4 py-2.5 mb-4 overflow-x-auto"
      style={{ top: 64, background: "rgba(240,244,255,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(78,174,229,0.1)" }}>
      <div className="flex gap-2 min-w-max">
        {SECTIONS.map(s => {
          const isActive = active === s.key;
          return (
            <button key={s.key} onClick={() => scroll(s.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all"
              style={isActive
                ? { background: "linear-gradient(135deg,#4EAEE5,#9B59B6)", color: "#fff" }
                : { background: "rgba(255,255,255,0.8)", color: "#6b7280", border: "1px solid rgba(78,174,229,0.18)" }}>
              <s.icon size={10} /> {s.label}
            </button>
          );
        })
        }
      </div>
    </div>
  );
}

/* ─── Profile completeness bar ───────────────────────────────────────────── */
function CompletenessBar({ pct, missing }) {
  const color = pct === 100 ? "#22c55e" : pct >= 70 ? "#4EAEE5" : "#F7971E";
  return (
    <div className="mt-4 rounded-2xl p-3.5" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(78,174,229,0.12)" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-gray-500">Profile completeness</span>
        <span className="text-[12px] font-black" style={{ color }}>{pct}%</span>
      </div>
      <div className="rounded-full overflow-hidden" style={{ height: 6, background: "rgba(78,174,229,0.12)" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${color},${color}bb)` }} />
      </div>
      {missing.length > 0 && pct < 100 && (
        <p className="text-[10px] text-gray-400 mt-2">
          Add <strong className="text-gray-600">{missing.join(", ")}</strong>{missing.length === 3 ? " & more" : ""} to reach 100%
        </p>
      )}
      {pct === 100 && (
        <p className="text-[10px] font-bold mt-2" style={{ color: "#22c55e" }}>✓ Profile is complete!</p>
      )}
    </div>
  );
}

/* ─── Profile Hero ───────────────────────────────────────────────────────── */
function ProfileHero({ member, from, to, onPhotoChange, completion }) {
  const isPaid = member.paymentStatus === "completed";
  const fileRef = useRef();

  return (
    <div className="relative rounded-3xl overflow-hidden mb-4 p-5 sm:p-6"
      style={{ background: `linear-gradient(135deg,${from}18,${to}12)`, border: "1.5px solid rgba(78,174,229,0.15)" }}>
      <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full pointer-events-none opacity-10"
        style={{ background: `radial-gradient(circle,${from},transparent)` }} />

      <div className="flex items-start gap-4 sm:gap-5 relative">
        {/* Avatar with real upload trigger */}
        <div className="flex-shrink-0">
          <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
            <div className="flex items-center justify-center rounded-2xl font-black text-white select-none overflow-hidden"
              style={{ width: 76, height: 76, background: `linear-gradient(135deg,${from},${to})`, fontSize: 26, boxShadow: `0 8px 24px ${from}50` }}>
              {member.photo
                ? <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                : initials(member.name)}
            </div>
            {/* visible camera badge — always visible on mobile, hover on desktop */}
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              style={{ background: "#fff", border: "1.5px solid rgba(78,174,229,0.3)", boxShadow: "0 2px 8px rgba(78,174,229,0.2)" }}>
              <FiCamera size={12} style={{ color: "#4EAEE5" }} />
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) onPhotoChange(f); e.target.value = ""; }} />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight truncate">{member.name}</h1>
          {member.jobTitle && (
            <p className="text-sm text-gray-500 font-medium mt-0.5 truncate">
              {member.jobTitle}{member.organisation ? ` · ${member.organisation}` : ""}
            </p>
          )}
          <p className="text-xs font-mono text-gray-400 mt-1 mb-3">{member.memberId}</p>

          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
              style={isPaid
                ? { background: "#EAF3DE", color: "#3B6D11", border: "0.5px solid #C0DD97" }
                : { background: "#FAEEDA", color: "#854F0B", border: "0.5px solid #FAC775" }}>
              {isPaid ? "✓ Paid" : "⏳ Pending"}
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: "rgba(78,174,229,0.1)", color: "#185FA5", border: "0.5px solid rgba(78,174,229,0.25)" }}>
              <FiShield size={8} /> Since {fmtDate(member.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <CompletenessBar pct={completion.pct} missing={completion.missing} />
    </div>
  );
}

/* ─── SectionCard ────────────────────────────────────────────────────────── */
function SectionCard({ id, icon: Icon, title, color = "#4EAEE5", editMode, onToggle, saving, children, hint }) {
  return (
    <div id={id} className="rounded-3xl p-5 sm:p-6 transition-all scroll-mt-36"
      style={{ background: "rgba(255,255,255,0.88)", border: "1.5px solid rgba(78,174,229,0.14)", backdropFilter: "blur(10px)", boxShadow: "0 4px 20px rgba(78,174,229,0.06)" }}>
      <div className="flex items-center justify-between mb-5 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0" style={{ background: `${color}15` }}>
            <Icon size={16} style={{ color }} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-black text-gray-800 tracking-tight">{title}</h2>
            {hint && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{hint}</p>}
          </div>
        </div>
        <button onClick={onToggle} disabled={saving}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex-shrink-0"
          style={editMode
            ? { background: "linear-gradient(135deg,#4EAEE5,#9B59B6)", color: "#fff", boxShadow: "0 4px 14px rgba(78,174,229,0.3)" }
            : { background: "rgba(78,174,229,0.08)", color: "#4EAEE5", border: "1px solid rgba(78,174,229,0.2)" }}>
          {saving ? <FiLoader size={12} className="animate-spin" />
            : editMode ? <><FiSave size={12} /><span className="hidden sm:inline"> Save</span></>
              : <><FiEdit2 size={12} /><span className="hidden sm:inline"> Edit</span></>}
        </button>
      </div>
      {children}
    </div>
  );
}

/* ─── Education card ─────────────────────────────────────────────────────── */
function EduCard({ item, index, edit, onChange, onRemove }) {
  return (
    <div className="rounded-2xl p-4 mb-3 relative" style={{ background: "rgba(155,89,182,0.05)", border: "1.5px solid rgba(155,89,182,0.14)" }}>
      {edit && (
        <button onClick={() => onRemove(index)} className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50">
          <FiTrash2 size={13} />
        </button>
      )}
      {edit
        ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
          <SelectInput value={item.level} onChange={v => onChange(index, "level", v)} options={EDUCATION_OPTIONS} placeholder="Level" />
          <Input value={item.field} onChange={v => onChange(index, "field", v)} placeholder="Field / Subject" />
          <Input value={item.institution} onChange={v => onChange(index, "institution", v)} placeholder="Institution" />
          <Input value={item.year} onChange={v => onChange(index, "year", v)} placeholder="Year" />
        </div>
        : <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-black text-gray-800">{item.level || "—"}{item.field ? ` · ${item.field}` : ""}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.institution || "—"}</p>
          </div>
          {item.year && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: "rgba(155,89,182,0.1)", color: "#534AB7", border: "1px solid rgba(155,89,182,0.2)" }}>
              {item.year}
            </span>
          )}
        </div>}
    </div>
  );
}

/* ─── Experience card ────────────────────────────────────────────────────── */
function ExpCard({ item, index, edit, onChange, onRemove }) {
  return (
    <div className="rounded-2xl p-4 mb-3 relative" style={{ background: "rgba(233,30,140,0.04)", border: "1.5px solid rgba(233,30,140,0.12)" }}>
      {edit && (
        <button onClick={() => onRemove(index)} className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50">
          <FiTrash2 size={13} />
        </button>
      )}
      {edit
        ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
          <Input value={item.title} onChange={v => onChange(index, "title", v)} placeholder="Job Title / Role" />
          <Input value={item.organisation} onChange={v => onChange(index, "organisation", v)} placeholder="Organisation" />
          <Input value={item.from} onChange={v => onChange(index, "from", v)} placeholder="From (e.g. 2019)" />
          <Input value={item.to} onChange={v => onChange(index, "to", v)} placeholder="To / Present" />
          <div className="col-span-1 sm:col-span-2">
            <Textarea value={item.description} onChange={v => onChange(index, "description", v)} placeholder="Brief description…" rows={2} />
          </div>
        </div>
        : <>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-black text-gray-800">{item.title || "—"}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{item.organisation || "—"}</p>
            </div>
            {(item.from || item.to) && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "rgba(233,30,140,0.08)", color: "#993556", border: "1px solid rgba(233,30,140,0.15)" }}>
                {[item.from, item.to].filter(Boolean).join(" → ")}
              </span>
            )}
          </div>
          {item.description && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{item.description}</p>}
        </>}
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────────────── */
function EmptyCard({ icon: Icon, title, hint, color }) {
  return (
    <div className="flex flex-col items-center py-10 text-center rounded-2xl"
      style={{ background: `${color}06`, border: `1.5px dashed ${color}30` }}>
      <Icon size={28} style={{ color: `${color}50` }} />
      <p className="text-sm font-bold text-gray-400 mt-2">{title}</p>
      <p className="text-xs text-gray-300 mt-1">{hint}</p>
    </div>
  );
}

/* ─── Download section ───────────────────────────────────────────────────── */
function DownloadSection({
  member,
  generatingCard, cardGenerated, cardDataUrl, onGenerateCard,
  generatingPoster, posterGenerated, posterDataUrl, onGeneratePoster,
  download,
}) {
  return (
    <div id="section-downloads" className="scroll-mt-36 grid grid-cols-1 sm:grid-cols-2 gap-4">

      {/* Membership Card */}
      <div className="rounded-3xl overflow-hidden flex flex-col"
        style={{ background: "rgba(255,255,255,0.88)", border: "1.5px solid rgba(78,174,229,0.2)", backdropFilter: "blur(10px)", boxShadow: "0 4px 20px rgba(78,174,229,0.06)" }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(78,174,229,0.1)" }}>
            <FiCreditCard size={16} style={{ color: "#4EAEE5" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-gray-800">Membership Card</p>
            <p className="text-[11px] text-gray-400">Standard · Credit card size</p>
          </div>
          {/* Status indicator */}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: cardGenerated ? "#22c55e" : "#d1d5db" }} />
            <span className="text-[10px] font-bold" style={{ color: cardGenerated ? "#22c55e" : "#9ca3af" }}>
              {cardGenerated ? "Ready" : "Not generated"}
            </span>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex items-center justify-center py-6 mx-4 rounded-2xl mb-4"
          style={{ background: "linear-gradient(135deg,rgba(78,174,229,0.06),rgba(15,28,53,0.06))", minHeight: 110 }}>
          {cardGenerated && cardDataUrl
            ? <img src={cardDataUrl} alt="Card preview" className="rounded-lg max-h-24 shadow-lg" style={{ boxShadow: "0 6px 20px rgba(78,174,229,0.25)" }} />
            : <div className="flex flex-col items-center justify-center gap-2 opacity-40">
              <div className="rounded-xl flex flex-col justify-end p-3"
                style={{ width: 120, height: 70, background: "linear-gradient(135deg,#0F1C35,#4EAEE5)" }}>
                <div className="rounded-sm mb-1.5" style={{ width: 18, height: 12, background: "linear-gradient(135deg,#FAC775,#EF9F27)" }} />
                <div className="text-white font-black" style={{ fontSize: 7, letterSpacing: ".04em" }}>{member.name?.toUpperCase()}</div>
                <div className="font-mono" style={{ fontSize: 6, color: "rgba(255,255,255,0.55)", marginTop: 1 }}>{member.memberId}</div>
              </div>
              <p className="text-[10px] text-gray-400 font-medium">Preview after generate</p>
            </div>}
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-4 pb-5 mt-auto">
          <button onClick={onGenerateCard} disabled={generatingCard}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-70"
            style={{ background: "linear-gradient(135deg,#0F1C35,#4EAEE5)", boxShadow: "0 4px 14px rgba(78,174,229,0.25)" }}>
            {generatingCard
              ? <><FiLoader size={13} className="animate-spin" /> Generating…</>
              : cardGenerated ? <><FiRefreshCw size={13} /> Regenerate</> : <><FiCreditCard size={13} /> Generate</>}
          </button>
          <button onClick={() => download(cardDataUrl, `USRA-Card-${member.name}.png`)} disabled={!cardGenerated}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
            style={cardGenerated
              ? { background: "rgba(78,174,229,0.08)", color: "#4EAEE5", border: "1.5px solid rgba(78,174,229,0.25)" }
              : { background: "#f9fafb", color: "#d1d5db", border: "1.5px solid #e5e7eb", cursor: "not-allowed" }}>
            <FiDownload size={13} /> Download
          </button>
        </div>
      </div>

      {/* Campaign Poster */}
      <div className="rounded-3xl overflow-hidden flex flex-col"
        style={{ background: "rgba(255,255,255,0.88)", border: "1.5px solid rgba(155,89,182,0.2)", backdropFilter: "blur(10px)", boxShadow: "0 4px 20px rgba(155,89,182,0.06)" }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(155,89,182,0.1)" }}>
            <FiImage size={16} style={{ color: "#9B59B6" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-gray-800">Campaign Poster</p>
            <p className="text-[11px] text-gray-400">Portrait · Share-ready</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: posterGenerated ? "#22c55e" : "#d1d5db" }} />
            <span className="text-[10px] font-bold" style={{ color: posterGenerated ? "#22c55e" : "#9ca3af" }}>
              {posterGenerated ? "Ready" : "Not generated"}
            </span>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex items-center justify-center py-6 mx-4 rounded-2xl mb-4"
          style={{ background: "linear-gradient(135deg,rgba(155,89,182,0.06),rgba(233,30,140,0.04))", minHeight: 110 }}>
          {posterGenerated && posterDataUrl
            ? <img src={posterDataUrl} alt="Poster preview" className="rounded-lg max-h-24 shadow-lg" style={{ boxShadow: "0 6px 20px rgba(155,89,182,0.25)" }} />
            : <div className="flex flex-col items-center justify-center gap-2 opacity-40">
              <div className="rounded-xl flex flex-col items-center justify-end p-3"
                style={{ width: 64, height: 90, background: "linear-gradient(135deg,#9B59B6,#E91E8C)" }}>
                <div className="rounded-full mb-2" style={{ width: 28, height: 28, background: "rgba(255,255,255,0.25)" }} />
                <div className="text-white font-black text-center" style={{ fontSize: 5.5 }}>YOUR NAME<br />USRA MEMBER</div>
              </div>
              <p className="text-[10px] text-gray-400 font-medium">Preview after generate</p>
            </div>}
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-4 pb-5 mt-auto">
          <button onClick={onGeneratePoster} disabled={generatingPoster}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-70"
            style={{ background: "linear-gradient(135deg,#9B59B6,#E91E8C)", boxShadow: "0 4px 14px rgba(155,89,182,0.25)" }}>
            {generatingPoster
              ? <><FiLoader size={13} className="animate-spin" /> Generating…</>
              : posterGenerated ? <><FiRefreshCw size={13} /> Regenerate</> : <><FiImage size={13} /> Generate</>}
          </button>
          <button onClick={() => download(posterDataUrl, `USRA-Poster-${member.name}.png`)} disabled={!posterGenerated}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
            style={posterGenerated
              ? { background: "rgba(155,89,182,0.08)", color: "#9B59B6", border: "1.5px solid rgba(155,89,182,0.25)" }
              : { background: "#f9fafb", color: "#d1d5db", border: "1.5px solid #e5e7eb", cursor: "not-allowed" }}>
            <FiDownload size={13} /> Download
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── More menu (Sign Out moved here) ──────────────────────────────────── */
function MoreMenu({ onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
        style={{ background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(78,174,229,0.2)", color: "#6b7280" }}>
        <FiMoreVertical size={15} />
      </button>
      {open && (
        <div className="absolute right-0 top-11 rounded-2xl shadow-xl z-50 overflow-hidden"
          style={{ background: "#fff", border: "1.5px solid rgba(78,174,229,0.14)", minWidth: 160 }}>
          <button onClick={() => { setOpen(false); onLogout(); }}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
            <FiLogOut size={14} /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

const ProfilePayButton = ({ mongoId, isPaid = false, className = '' }) => {
  const { openPayment, paymentStatus, isPaymentLoading } = useRazorpayPayment();

  // ── Paid state ─────────────────────────────────────────────────────────────
  if (isPaid) {
    return (
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-600 font-semibold text-sm ${className}`}>
        <FiCheckCircle className="w-4 h-4" />
        Payment Complete
      </div>
    );
  }

  // ── Button label ────────────────────────────────────────────────────────────
  const label = () => {
    if (isPaymentLoading) {
      return (
        <>
          <div className="spinner w-4 h-4" />
          Opening Payment...
        </>
      );
    }
    if (paymentStatus === 'failed') {
      return (
        <>
          <FiAlertCircle className="w-4 h-4" />
          Retry Payment ₹100
        </>
      );
    }
    return (
      <>
        <FiCreditCard className="w-4 h-4" />
        Complete Payment ₹100
      </>
    );
  };

  // ── Colour variant changes after failure ────────────────────────────────────
  const colorClass = paymentStatus === 'failed'
    ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300'
    : 'bg-usra-blue hover:bg-usra-blue/90 focus:ring-usra-blue/30';

  return (
    <button
      onClick={() => openPayment(mongoId)}
      disabled={isPaymentLoading}
      className={`
        flex items-center gap-2 px-5 py-2.5 rounded-xl
        text-white font-semibold text-sm
        transition-all focus:outline-none focus:ring-2
        disabled:opacity-60 disabled:cursor-not-allowed
        ${colorClass} ${className}
      `}
    >
      {label()}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   Main Page
═══════════════════════════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const canvasRef = useRef(null);

  const { posterDataUrl, posterGenerated, generatingPoster, generatePoster } = usePosterGenerator();
  const { cardDataUrl, cardGenerated, generatingCard, generateCard } = useCardGenerator();

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [member, setMember] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [editMode, setEditMode] = useState({});   // at most one key is true
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [activeSection, setActiveSection] = useState("personal");

  /* ── Active section tracking via IntersectionObserver ────────────────── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace("section-", "");
            setActiveSection(id);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    SECTIONS.forEach(s => {
      const el = document.getElementById(`section-${s.key}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [loading]);

  /* ── Load member data ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (!user) { navigate("/login", { state: { from: { pathname: "/profile" } } }); return; }
    (async () => {
      try {
        setLoading(true);
        const res = await getMemberById(user._id);
        const m = res.data || res;
        setMember(m);
        buildDraft(m);
      } catch {
        setToast({ msg: "Failed to load profile.", type: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const buildDraft = (m) => setDraft({
    dob: toDateInput(m.dob), gender: m.gender || "", bloodGroup: m.bloodGroup || "",
    father: m.father || "", mother: m.mother || "",
    maritalStatus: m.maritalStatus || "",
    spouseName: m.spouse || "", spousePhone: m.spousePhone || "",
    spouseJob: m.spouseJob || "", children: m.children || "",
    bio: m.bio || "",
    phone: m.phone || "", place: m.place || "", houseName: m.houseName || "", email: m.email || "",
    employmentType: m.employmentType || "", sector: m.sector || "",
    organisation: m.organisation || "", jobTitle: m.jobTitle || "",
    jobLocation: m.jobLocation || "",
    annualIncome: m.annualIncome != null ? String(m.annualIncome) : "",
    skills: m.skills || "",
    highestQualification: m.highestQualification || "",
    educations: Array.isArray(m.educations) ? m.educations : [],
    experiences: Array.isArray(m.experiences) ? m.experiences : [],
  });

  /* ── Edit / save logic with unsaved guard ─────────────────────────────── */
  const activeEditSection = Object.keys(editMode).find(k => editMode[k]) || null;

  const saveSection = useCallback(async (section) => {
    setSaving(s => ({ ...s, [section]: true }));
    try {
      const res = await updateMember(member._id, draft);
      const updated = res.data || res;
      setMember(updated);
      buildDraft(updated);
      setToast({ msg: "Saved successfully!", type: "success" });
      setEditMode({});
    } catch (err) {
      setToast({ msg: err?.response?.data?.message || "Failed to save. Try again.", type: "error" });
    } finally {
      setSaving(s => ({ ...s, [section]: false }));
    }
  }, [member, draft]);

  const discardSection = useCallback(() => {
    buildDraft(member);
    setEditMode({});
  }, [member]);

  const toggleEdit = (section) => {
    if (editMode[section]) {
      saveSection(section);
    } else {
      // Guard: block opening new section if another has unsaved changes
      if (activeEditSection && activeEditSection !== section) {
        setToast({ msg: `Save or discard changes in "${SECTIONS.find(s => s.key === activeEditSection)?.label}" first.`, type: "error" });
        return;
      }
      setEditMode({ [section]: true });
    }
  };

  /* ── Draft setters ────────────────────────────────────────────────────── */
  const set = k => v => setDraft(d => ({ ...d, [k]: v }));
  const setArr = (k, i, f, v) => setDraft(d => { const a = [...(d[k] || [])]; a[i] = { ...a[i], [f]: v }; return { ...d, [k]: a }; });
  const addArr = (k, blank) => setDraft(d => ({ ...d, [k]: [...(d[k] || []), blank] }));
  const rmArr = (k, i) => setDraft(d => { const a = [...(d[k] || [])]; a.splice(i, 1); return { ...d, [k]: a }; });

  /* ── Photo upload ─────────────────────────────────────────────────────── */
  const handlePhotoChange = async (file) => {
    // convert to base64 preview immediately; save via updateMember
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result;
      try {
        const res = await updateMember(member._id, { photo: base64 });
        const updated = res.data || res;
        setMember(updated);
        setToast({ msg: "Photo updated!", type: "success" });
      } catch {
        setToast({ msg: "Photo upload failed.", type: "error" });
      }
    };
    reader.readAsDataURL(file);
  };

  /* ── Downloads ────────────────────────────────────────────────────────── */
  const handleGenerateCard = () => generateCard({ memberData: member, memberDbId: member.memberId, photoPreviewUrl: member.photo, logoSrc: usraLogo });
  const handleGeneratePoster = () => generatePoster({ memberData: member, photoPreviewUrl: member.photo, templateSrc: posterTemplate, canvas: canvasRef.current });
  const download = (dataUrl, filename) => { const a = document.createElement("a"); a.href = dataUrl; a.download = filename; a.click(); };

  /* ── Guards ───────────────────────────────────────────────────────────── */
  if (!user) return null;
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(145deg,#f0f4ff,#faf5ff)" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#4EAEE5,#9B59B6)" }}>
          <FiLoader size={20} color="#fff" className="animate-spin" />
        </div>
        <p className="text-sm font-semibold text-gray-400">Loading your profile…</p>
      </div>
    </div>
  );
  if (!member || !draft) return null;

  const [from, to] = accentFor(member.name);
  const isMarried = draft.maritalStatus === "Married";
  const eduCount = (draft.educations || []).length;
  const expCount = (draft.experiences || []).length;
  const completion = computeCompletion(member, draft);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(145deg,#f0f4ff 0%,#faf5ff 50%,#f0fff8 100%)" }}>
      <Navbar />

      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10"
          style={{ background: `radial-gradient(circle,${from},transparent)` }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-8"
          style={{ background: `radial-gradient(circle,${to},transparent)` }} />
      </div>

      {/* Hidden canvas for poster generation */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-20 pb-24">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
            <FiArrowLeft size={15} /> Back
          </button>
          <MoreMenu onLogout={() => { logout(); navigate("/"); }} />
        </div>

        {/* Hero */}
        <ProfileHero member={member} from={from} to={to} onPhotoChange={handlePhotoChange} completion={completion} />

        {/* Sticky section nav */}
        <SectionNav active={activeSection} />

        {/* Unsaved changes banner */}
        <UnsavedBanner
          section={activeEditSection}
          onSave={() => saveSection(activeEditSection)}
          onDiscard={discardSection}
          saving={saving[activeEditSection]}
        />

        <div className="space-y-5">

          {/* 1 · Personal */}
          <SectionCard id="section-personal" icon={FiUser} title="Personal Details" color="#9B59B6"
            editMode={editMode.personal} saving={saving.personal}
            onToggle={() => toggleEdit("personal")} hint="DOB · parents · blood group">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Date of Birth" value={fmtDate(member.dob)} edit={editMode.personal}><Input value={draft.dob} onChange={set("dob")} type="date" /></Field>
              <Field label="Gender" value={member.gender} edit={editMode.personal}><SelectInput value={draft.gender} onChange={set("gender")} options={["Male", "Female", "Other"]} placeholder="Select" /></Field>
              <Field label="Blood Group" value={member.bloodGroup} edit={editMode.personal}><SelectInput value={draft.bloodGroup} onChange={set("bloodGroup")} options={BLOOD_GROUPS} placeholder="Select" /></Field>
              <Field label="Marital Status" value={member.maritalStatus} edit={editMode.personal}><SelectInput value={draft.maritalStatus} onChange={set("maritalStatus")} options={MARITAL_OPTIONS} placeholder="Select" /></Field>
              <Field label="Father's Name" value={member.father} edit={editMode.personal}><Input value={draft.father} onChange={set("father")} placeholder="Father's full name" /></Field>
              <Field label="Mother's Name" value={member.mother} edit={editMode.personal}><Input value={draft.mother} onChange={set("mother")} placeholder="Mother's full name" /></Field>
            </div>

            {isMarried && <>
              <div className="flex items-center gap-3 my-5">
                <div className="h-px flex-1" style={{ background: "rgba(233,30,140,0.15)" }} />
                <span className="text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full"
                  style={{ background: "rgba(233,30,140,0.07)", color: "#E91E8C", border: "1px solid rgba(233,30,140,0.15)" }}>
                  Spouse Details
                </span>
                <div className="h-px flex-1" style={{ background: "rgba(233,30,140,0.15)" }} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Spouse Name" value={member.spouse} edit={editMode.personal}><Input value={draft.spouseName} onChange={set("spouseName")} placeholder="Full name" /></Field>
                <Field label="Spouse Phone" value={member.spousePhone} edit={editMode.personal}><Input value={draft.spousePhone} onChange={set("spousePhone")} placeholder="+91 XXXXX XXXXX" type="tel" /></Field>
                <Field label="Spouse Occupation" value={member.spouseJob} edit={editMode.personal}><Input value={draft.spouseJob} onChange={set("spouseJob")} placeholder="Job / Occupation" /></Field>
                <Field label="No. of Children" value={member.children} edit={editMode.personal}><Input value={draft.children} onChange={set("children")} placeholder="0" type="number" /></Field>
              </div>
            </>}
          </SectionCard>

          {/* 2 · About */}
          <SectionCard id="section-bio" icon={FiUsers} title="About Me" color="#43B89C"
            editMode={editMode.bio} saving={saving.bio}
            onToggle={() => toggleEdit("bio")} hint="A short bio visible to others">
            <Field label="Bio / Short Note" value={member.bio} edit={editMode.bio}>
              <Textarea value={draft.bio} onChange={set("bio")} placeholder="Write something about yourself…" rows={4} />
            </Field>
          </SectionCard>

          {/* 3 · Contact */}
          <SectionCard id="section-contact" icon={FiPhone} title="Contact Information" color="#4EAEE5"
            editMode={editMode.contact} saving={saving.contact}
            onToggle={() => toggleEdit("contact")} hint="Phone · email · address">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Phone" value={member.phone} edit={editMode.contact}><Input value={draft.phone} onChange={set("phone")} placeholder="9876543210" type="tel" /></Field>
              <Field label="Email" value={member.email} edit={editMode.contact}><Input value={draft.email} onChange={set("email")} placeholder="you@example.com" type="email" /></Field>
              <Field label="Place / City" value={member.place} edit={editMode.contact}><Input value={draft.place} onChange={set("place")} placeholder="City or Town" /></Field>
              <Field label="House Name" value={member.houseName} edit={editMode.contact}><Input value={draft.houseName} onChange={set("houseName")} placeholder="House / Building name" /></Field>
            </div>
          </SectionCard>

          {/* 4 · Career */}
          <SectionCard id="section-career" icon={FiBriefcase} title="Career & Employment" color="#F7971E"
            editMode={editMode.career} saving={saving.career}
            onToggle={() => toggleEdit("career")} hint="Job · sector · income">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Employment Type" value={member.employmentType} edit={editMode.career} span2>
                <SelectInput value={draft.employmentType} onChange={set("employmentType")} options={EMPLOYMENT_TYPES} placeholder="Select type" />
              </Field>
              <Field label="Sector" value={member.sector} edit={editMode.career}><SelectInput value={draft.sector} onChange={set("sector")} options={SECTORS} placeholder="Select sector" /></Field>
              <Field label="Organisation" value={member.organisation} edit={editMode.career}><Input value={draft.organisation} onChange={set("organisation")} placeholder="Company / Org" /></Field>
              <Field label="Job Title" value={member.jobTitle} edit={editMode.career}><Input value={draft.jobTitle} onChange={set("jobTitle")} placeholder="Designation" /></Field>
              <Field label="Work Location" value={member.jobLocation} edit={editMode.career}><Input value={draft.jobLocation} onChange={set("jobLocation")} placeholder="City or Remote" /></Field>
              <Field label="Annual Income (₹)"
                value={member.annualIncome != null ? `₹ ${Number(member.annualIncome).toLocaleString("en-IN")}` : ""}
                edit={editMode.career}>
                <Input value={draft.annualIncome} onChange={set("annualIncome")} placeholder="e.g. 500000" type="number" />
              </Field>
            </div>
            <Divider />
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-3">Skills & Expertise</p>
            <Field label="Skills" value={member.skills} edit={editMode.career}>
              <Textarea value={draft.skills} onChange={set("skills")} placeholder="e.g. Teaching, Driving, Carpentry…" />
            </Field>
          </SectionCard>

          {/* 5 · Experience */}
          <SectionCard id="section-experience" icon={FiAward} title="Work Experience" color="#E91E8C"
            editMode={editMode.experience} saving={saving.experience}
            onToggle={() => toggleEdit("experience")} hint={`${expCount} ${expCount === 1 ? "entry" : "entries"}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                {expCount} {expCount === 1 ? "entry" : "entries"}
              </p>
              {editMode.experience && (
                <button onClick={() => addArr("experiences", { title: "", organisation: "", from: "", to: "", description: "" })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold active:scale-95"
                  style={{ background: "rgba(233,30,140,0.08)", color: "#993556", border: "1px solid rgba(233,30,140,0.18)" }}>
                  <FiPlus size={11} /> Add Entry
                </button>
              )}
            </div>
            {expCount === 0
              ? <EmptyCard icon={FiBriefcase} title="No experience added" hint="Click Edit to add work history" color="#E91E8C" />
              : (draft.experiences || []).map((item, i) => (
                <ExpCard key={i} item={item} index={i} edit={editMode.experience}
                  onChange={(idx, f, v) => setArr("experiences", idx, f, v)}
                  onRemove={idx => rmArr("experiences", idx)} />
              ))
            }
          </SectionCard>

          {/* 6 · Education */}
          <SectionCard id="section-education" icon={FiBook} title="Education" color="#9B59B6"
            editMode={editMode.education} saving={saving.education}
            onToggle={() => toggleEdit("education")} hint={`Highest: ${member.highestQualification || "Not set"}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <Field label="Highest Qualification" value={member.highestQualification} edit={editMode.education} span2>
                <SelectInput value={draft.highestQualification} onChange={set("highestQualification")} options={EDUCATION_OPTIONS} placeholder="Select highest level" />
              </Field>
            </div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Qualifications ({eduCount})</p>
              {editMode.education && (
                <button onClick={() => addArr("educations", { level: "", field: "", institution: "", year: "" })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold active:scale-95"
                  style={{ background: "rgba(155,89,182,0.1)", color: "#534AB7", border: "1px solid rgba(155,89,182,0.2)" }}>
                  <FiPlus size={11} /> Add
                </button>
              )}
            </div>
            {eduCount === 0
              ? <EmptyCard icon={FiBook} title="No qualifications added" hint="Click Edit to add" color="#9B59B6" />
              : (draft.educations || []).map((item, i) => (
                <EduCard key={i} item={item} index={i} edit={editMode.education}
                  onChange={(idx, f, v) => setArr("educations", idx, f, v)}
                  onRemove={idx => rmArr("educations", idx)} />
              ))
            }
          </SectionCard>

          {/* 7 · Membership (read-only) */}
          <MembershipPaymentSection member={member} />

          {/* 8 · Downloads */}
          {member.paymentStatus === 'completed' &&
            <div className="rounded-3xl p-5 sm:p-6"
              style={{ background: "rgba(255,255,255,0.6)", border: "1.5px solid rgba(78,174,229,0.1)" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(78,174,229,0.1)" }}>
                  <FiDownload size={16} style={{ color: "#4EAEE5" }} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-gray-800">Downloads</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">Generate and download your card & poster</p>
                </div>
              </div>
              <DownloadSection
                member={member}
                generatingCard={generatingCard} cardGenerated={cardGenerated} cardDataUrl={cardDataUrl} onGenerateCard={handleGenerateCard}
                generatingPoster={generatingPoster} posterGenerated={posterGenerated} posterDataUrl={posterDataUrl} onGeneratePoster={handleGeneratePoster}
                download={download}
              />
            </div>
          }



        </div>
      </div>

      <Toast msg={toast.msg} type={toast.type} onDone={() => setToast({ msg: "", type: "" })} />
    </div>
  );
}