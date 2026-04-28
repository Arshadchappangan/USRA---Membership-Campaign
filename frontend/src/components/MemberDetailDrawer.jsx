import { useEffect, useState, useRef, useCallback } from "react";
import {
  FiX, FiPhone, FiMapPin, FiCalendar, FiHeart,
  FiUser, FiHome, FiUsers, FiHash, FiEdit2, FiCheck,
  FiPlus, FiTrash2, FiChevronDown, FiBriefcase,
  FiBook, FiAward, FiSave, FiLoader, FiCamera,
  FiAlertCircle,
} from "react-icons/fi";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ACCENT_PAIRS = [
  ["#4EAEE5", "#9B59B6"], ["#9B59B6", "#E91E8C"], ["#E91E8C", "#4EAEE5"],
  ["#4EAEE5", "#43B89C"], ["#F7971E", "#E91E8C"], ["#43B89C", "#9B59B6"],
];
const accentFor = (name = "") => ACCENT_PAIRS[name.length % ACCENT_PAIRS.length];
const initials  = (name = "") => name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
const fmtDate   = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const MARITAL_OPTIONS   = ["Single", "Married", "Divorced", "Widowed"];
const EDUCATION_OPTIONS = ["Below 10th", "10th Pass", "12th Pass", "Diploma", "ITI", "Graduate", "Post Graduate", "PhD", "Other"];
const EMPLOYMENT_TYPES  = ["Employed", "Self-Employed", "Business", "Student", "Homemaker", "Unemployed", "Retired"];
const SECTORS           = ["Government", "Private", "Public Sector", "NGO / Non-Profit", "Military / Defence", "Education", "Healthcare", "Agriculture", "IT / Tech", "Finance", "Other"];

// ─── Reusable primitives ───────────────────────────────────────────────────────

function Field({ label, value, edit, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400">{label}</label>
      {edit ? children : (
        <p className="text-sm font-semibold text-gray-800 leading-snug">{value || <span className="text-gray-300 font-normal">—</span>}</p>
      )}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", className = "" }) {
  return (
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 rounded-xl text-sm font-medium text-gray-800 outline-none transition-all ${className}`}
      style={{
        background: "rgba(78,174,229,0.04)",
        border: "1.5px solid rgba(78,174,229,0.2)",
      }}
      onFocus={e => e.target.style.borderColor = "rgba(78,174,229,0.55)"}
      onBlur={e  => e.target.style.borderColor = "rgba(78,174,229,0.2)"}
    />
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl text-sm font-medium text-gray-800 outline-none transition-all cursor-pointer"
        style={{
          background: "rgba(78,174,229,0.04)",
          border: "1.5px solid rgba(78,174,229,0.2)",
        }}
        onFocus={e => e.target.style.borderColor = "rgba(78,174,229,0.55)"}
        onBlur={e  => e.target.style.borderColor = "rgba(78,174,229,0.2)"}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <FiChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 rounded-xl text-sm font-medium text-gray-800 outline-none transition-all resize-none"
      style={{
        background: "rgba(78,174,229,0.04)",
        border: "1.5px solid rgba(78,174,229,0.2)",
      }}
      onFocus={e => e.target.style.borderColor = "rgba(78,174,229,0.55)"}
      onBlur={e  => e.target.style.borderColor = "rgba(78,174,229,0.2)"}
    />
  );
}

function SectionHeader({ icon: Icon, title, color = "#4EAEE5", editMode, onToggle, saving }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0"
          style={{ background: `${color}15` }}>
          <Icon size={13} style={{ color }} />
        </div>
        <h3 className="text-sm font-black text-gray-700">{title}</h3>
      </div>
      <button
        onClick={onToggle}
        disabled={saving}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
        style={editMode
          ? { background: "linear-gradient(135deg,#4EAEE5,#9B59B6)", color: "#fff" }
          : { background: "rgba(78,174,229,0.08)", color: "#4EAEE5", border: "1px solid rgba(78,174,229,0.2)" }
        }
      >
        {saving ? <FiLoader size={11} className="animate-spin" /> : editMode ? <><FiSave size={11} /> Save</> : <><FiEdit2 size={11} /> Edit</>}
      </button>
    </div>
  );
}

function Divider() {
  return <div className="my-5" style={{ height: "1px", background: "rgba(78,174,229,0.1)" }} />;
}

function TabBtn({ active, onClick, icon: Icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-1 pb-2.5 pt-1 px-1 text-xs font-bold transition-all flex-1"
      style={{
        color: active ? "#4EAEE5" : "#9ca3af",
        borderBottom: active ? "2px solid #4EAEE5" : "2px solid transparent",
      }}
    >
      <Icon size={15} />
      <span className="hidden sm:inline">{label}</span>
      {badge > 0 && (
        <span className="absolute -top-0.5 right-0 w-4 h-4 rounded-full text-white text-[9px] font-black flex items-center justify-center"
          style={{ background: "#E91E8C" }}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Experience card ──────────────────────────────────────────────────────────
function ExperienceCard({ item, index, edit, onChange, onRemove, color }) {
  return (
    <div className="rounded-2xl p-4 mb-3 relative"
      style={{ background: `${color}08`, border: `1.5px solid ${color}22` }}>
      {edit && (
        <button onClick={() => onRemove(index)}
          className="absolute top-3 right-3 w-6 h-6 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors">
          <FiTrash2 size={11} />
        </button>
      )}
      {edit ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
          <Input value={item.title}        onChange={(v) => onChange(index, "title", v)}        placeholder="Job title / Role" />
          <Input value={item.organisation} onChange={(v) => onChange(index, "organisation", v)} placeholder="Organisation / Company" />
          <Input value={item.from}         onChange={(v) => onChange(index, "from", v)}         placeholder="From (e.g. 2019)" />
          <Input value={item.to}           onChange={(v) => onChange(index, "to", v)}           placeholder="To (e.g. 2023 or Present)" />
          <div className="sm:col-span-2">
            <Textarea value={item.description} onChange={(v) => onChange(index, "description", v)} placeholder="Brief description (optional)" rows={2} />
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm font-black text-gray-800">{item.title || "—"}</p>
          <p className="text-xs font-semibold text-gray-500 mt-0.5">{item.organisation || "—"}</p>
          {(item.from || item.to) && (
            <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
              <FiCalendar size={9} /> {[item.from, item.to].filter(Boolean).join(" → ")}
            </p>
          )}
          {item.description && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{item.description}</p>}
        </>
      )}
    </div>
  );
}

// ─── Education card ───────────────────────────────────────────────────────────
function EducationCard({ item, index, edit, onChange, onRemove }) {
  return (
    <div className="rounded-2xl p-4 mb-3 relative"
      style={{ background: "rgba(155,89,182,0.05)", border: "1.5px solid rgba(155,89,182,0.15)" }}>
      {edit && (
        <button onClick={() => onRemove(index)}
          className="absolute top-3 right-3 w-6 h-6 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors">
          <FiTrash2 size={11} />
        </button>
      )}
      {edit ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
          <Select value={item.level}       onChange={(v) => onChange(index, "level", v)}       options={EDUCATION_OPTIONS} placeholder="Education level" />
          <Input  value={item.field}       onChange={(v) => onChange(index, "field", v)}       placeholder="Field / Subject" />
          <Input  value={item.institution} onChange={(v) => onChange(index, "institution", v)} placeholder="Institution / Board" />
          <Input  value={item.year}        onChange={(v) => onChange(index, "year", v)}        placeholder="Year of completion" />
        </div>
      ) : (
        <>
          <p className="text-sm font-black text-gray-800">{item.level || "—"}{item.field ? ` — ${item.field}` : ""}</p>
          <p className="text-xs font-semibold text-gray-500 mt-0.5">{item.institution || "—"}</p>
          {item.year && (
            <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
              <FiAward size={9} /> Completed {item.year}
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  const isErr = type === "error";
  return (
    <div className="absolute bottom-20 left-4 right-4 z-10 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold shadow-lg transition-all"
      style={{
        background: isErr ? "rgba(239,68,68,0.95)" : "rgba(34,197,94,0.95)",
        color: "#fff",
      }}>
      {isErr ? <FiAlertCircle size={14} /> : <FiCheck size={14} />}
      {msg}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MemberDetailDrawer({ member, onClose, onUpdate }) {
  const [tab, setTab]         = useState("profile");
  const [draft, setDraft]     = useState(null);
  const [saving, setSaving]   = useState({});
  const [editMode, setEditMode] = useState({});
  const [toast, setToast]     = useState({ msg: "", type: "" });
  const bodyRef = useRef(null);
  const isOpen  = !!member;

  // Initialise draft when member changes
  useEffect(() => {
    if (member) {
      setDraft({
        // Basic
        name:          member.name        || "",
        phone:         member.phone       || "",
        place:         member.place       || "",
        houseName:     member.houseName   || "",
        dob:           member.dob         || "",
        guardianName:  member.guardianName || "",
        guardianPhone: member.guardianPhone|| "",
        // Personal extra
        maritalStatus: member.maritalStatus || "",
        spouseName:    member.spouseName   || "",
        spousePhone:   member.spousePhone  || "",
        spouseJob:     member.spouseJob    || "",
        children:      member.children    || "",
        // Education
        highestQualification: member.highestQualification || "",
        educations:    member.educations  || [],
        // Employment
        employmentType: member.employmentType || "",
        sector:         member.sector         || "",
        organisation:   member.organisation   || "",
        jobTitle:       member.jobTitle       || "",
        jobLocation:    member.jobLocation    || "",
        annualIncome:   member.annualIncome   || "",
        // Experience
        experiences:    member.experiences || [],
        // Skills / extra
        skills:         member.skills     || "",
        bio:            member.bio        || "",
      });
      setTab("profile");
      setEditMode({});
    }
  }, [member]);

  // Keyboard & body scroll
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  const set = (key) => (val) => setDraft((d) => ({ ...d, [key]: val }));

  // Array helpers
  const setArr = (key, index, field, value) =>
    setDraft((d) => {
      const arr = [...(d[key] || [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...d, [key]: arr };
    });

  const addArr = (key, blank) =>
    setDraft((d) => ({ ...d, [key]: [...(d[key] || []), blank] }));

  const removeArr = (key, index) =>
    setDraft((d) => {
      const arr = [...(d[key] || [])];
      arr.splice(index, 1);
      return { ...d, [key]: arr };
    });

  const toggleEdit = async (section) => {
    if (editMode[section]) {
      // Save
      setSaving((s) => ({ ...s, [section]: true }));
      try {
        if (onUpdate) await onUpdate(member._id, draft);
        showToast("Saved successfully");
        setEditMode((e) => ({ ...e, [section]: false }));
      } catch {
        showToast("Failed to save. Try again.", "error");
      } finally {
        setSaving((s) => ({ ...s, [section]: false }));
      }
    } else {
      setEditMode((e) => ({ ...e, [section]: true }));
      setTimeout(() => bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 50);
    }
  };

  if (!member || !draft) return null;

  const [from, to] = accentFor(member.name);
  const isPaid     = member.paymentStatus === "completed";
  const isMarried  = draft.maritalStatus === "Married";

  const expCount = (draft.experiences || []).length;
  const eduCount = (draft.educations  || []).length;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 z-40 transition-all duration-300"
        style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)", opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none" }} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300"
        style={{
          width: "min(480px, 100vw)",
          background: "rgba(248,251,255,0.98)",
          backdropFilter: "blur(20px)",
          borderLeft: "1.5px solid rgba(78,174,229,0.2)",
          boxShadow: "-12px 0 48px rgba(78,174,229,0.15)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}>

        {/* ── Header ── */}
        <div className="flex-shrink-0 px-5 pt-5 pb-0"
          style={{ borderBottom: "1.5px solid rgba(78,174,229,0.1)" }}>

          {/* Top row */}
          <div className="flex items-start gap-4 pb-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0 group">
              <div className="flex items-center justify-center rounded-2xl font-black text-white select-none overflow-hidden"
                style={{ width: 60, height: 60, background: `linear-gradient(135deg,${from},${to})`, fontSize: 21 }}>
                {member.photo
                  ? <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                  : initials(member.name)}
              </div>
              <button className="absolute inset-0 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(0,0,0,0.45)" }}>
                <FiCamera size={14} color="#fff" />
              </button>
            </div>

            {/* Name block */}
            <div className="flex-1 min-w-0">
              <h2 className="font-black text-gray-900 text-xl leading-tight truncate">{member.name}</h2>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{member.memberId}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={isPaid
                    ? { background: "#EAF3DE", color: "#3B6D11", border: "0.5px solid #C0DD97" }
                    : { background: "#FAEEDA", color: "#854F0B", border: "0.5px solid #FAC775" }}>
                  {isPaid ? "✓ Paid" : "⏳ Pending"}
                </span>
                {member.bloodGroup && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: "#FBEAF0", color: "#72243E", border: "0.5px solid #F4C0D1" }}>
                    <FiHeart size={8} /> {member.bloodGroup}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={member.gender === "Female"
                    ? { background: "#EEEDFE", color: "#3C3489", border: "0.5px solid #CECBF6" }
                    : { background: "#E6F1FB", color: "#185FA5", border: "0.5px solid #B5D4F4" }}>
                  {member.gender}
                </span>
                {draft.maritalStatus && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: "#E1F5EE", color: "#085041", border: "0.5px solid #9FE1CB" }}>
                    {draft.maritalStatus}
                  </span>
                )}
              </div>
            </div>

            {/* Close */}
            <button onClick={onClose}
              className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
              <FiX size={16} />
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex" style={{ gap: "2px" }}>
            <TabBtn active={tab === "profile"}    onClick={() => setTab("profile")}    icon={FiUser}      label="Profile" />
            <TabBtn active={tab === "education"}  onClick={() => setTab("education")}  icon={FiBook}      label="Education"  badge={eduCount} />
            <TabBtn active={tab === "career"}     onClick={() => setTab("career")}     icon={FiBriefcase} label="Career" />
            <TabBtn active={tab === "experience"} onClick={() => setTab("experience")} icon={FiAward}     label="Experience" badge={expCount} />
          </div>
        </div>

        {/* ── Body ── */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto px-5 py-5 relative">
          <Toast msg={toast.msg} type={toast.type} />

          {/* ═══ PROFILE TAB ═══ */}
          {tab === "profile" && (
            <>
              {/* Contact */}
              <SectionHeader icon={FiPhone} title="Contact Info" color="#4EAEE5"
                editMode={editMode.contact} saving={saving.contact}
                onToggle={() => toggleEdit("contact")} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Phone" value={draft.phone} edit={editMode.contact}>
                  <Input value={draft.phone} onChange={set("phone")} placeholder="+91 XXXXX XXXXX" type="tel" />
                </Field>
                <Field label="Place" value={draft.place} edit={editMode.contact}>
                  <Input value={draft.place} onChange={set("place")} placeholder="City / Town" />
                </Field>
                <Field label="House Name" value={draft.houseName} edit={editMode.contact} className="sm:col-span-2">
                  <Input value={draft.houseName} onChange={set("houseName")} placeholder="House / Building name" />
                </Field>
              </div>

              <Divider />

              {/* Personal */}
              <SectionHeader icon={FiUser} title="Personal Details" color="#9B59B6"
                editMode={editMode.personal} saving={saving.personal}
                onToggle={() => toggleEdit("personal")} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Date of Birth" value={fmtDate(draft.dob)} edit={editMode.personal}>
                  <Input value={draft.dob} onChange={set("dob")} type="date" />
                </Field>
                <Field label="Guardian Name" value={draft.guardianName} edit={editMode.personal}>
                  <Input value={draft.guardianName} onChange={set("guardianName")} placeholder="Parent / Guardian" />
                </Field>
                <Field label="Guardian Phone" value={draft.guardianPhone} edit={editMode.personal}>
                  <Input value={draft.guardianPhone} onChange={set("guardianPhone")} placeholder="+91 XXXXX XXXXX" type="tel" />
                </Field>
                <Field label="Marital Status" value={draft.maritalStatus} edit={editMode.personal}>
                  <Select value={draft.maritalStatus} onChange={set("maritalStatus")} options={MARITAL_OPTIONS} placeholder="Select status" />
                </Field>
              </div>

              {/* Spouse block — only when married */}
              {isMarried && (
                <>
                  <div className="mt-4 mb-3 flex items-center gap-2">
                    <div className="h-px flex-1" style={{ background: "rgba(233,30,140,0.15)" }} />
                    <span className="text-[10px] font-bold tracking-widest uppercase text-pink-400">Spouse Details</span>
                    <div className="h-px flex-1" style={{ background: "rgba(233,30,140,0.15)" }} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Spouse Name" value={draft.spouseName} edit={editMode.personal}>
                      <Input value={draft.spouseName} onChange={set("spouseName")} placeholder="Full name" />
                    </Field>
                    <Field label="Spouse Phone" value={draft.spousePhone} edit={editMode.personal}>
                      <Input value={draft.spousePhone} onChange={set("spousePhone")} placeholder="+91 XXXXX XXXXX" type="tel" />
                    </Field>
                    <Field label="Spouse Occupation" value={draft.spouseJob} edit={editMode.personal} className="sm:col-span-2">
                      <Input value={draft.spouseJob} onChange={set("spouseJob")} placeholder="Job / Occupation" />
                    </Field>
                    <Field label="No. of Children" value={draft.children} edit={editMode.personal}>
                      <Input value={draft.children} onChange={set("children")} placeholder="0" type="number" />
                    </Field>
                  </div>
                </>
              )}

              <Divider />

              {/* Bio */}
              <SectionHeader icon={FiUsers} title="About" color="#43B89C"
                editMode={editMode.bio} saving={saving.bio}
                onToggle={() => toggleEdit("bio")} />
              <Field label="Short Bio / Note" value={draft.bio} edit={editMode.bio}>
                <Textarea value={draft.bio} onChange={set("bio")} placeholder="A short note about this member…" rows={3} />
              </Field>

              <Divider />

              {/* Membership read-only */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0"
                  style={{ background: "rgba(78,174,229,0.1)" }}>
                  <FiHash size={13} style={{ color: "#4EAEE5" }} />
                </div>
                <h3 className="text-sm font-black text-gray-700">Membership</h3>
                <span className="text-[10px] text-gray-400 font-medium ml-1">(read-only)</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Member ID"   value={member.memberId} />
                <Field label="Joined"      value={fmtDate(member.createdAt)} />
                <Field label="Blood Group" value={member.bloodGroup} />
                <Field label="Gender"      value={member.gender} />
              </div>
            </>
          )}

          {/* ═══ EDUCATION TAB ═══ */}
          {tab === "education" && (
            <>
              <SectionHeader icon={FiBook} title="Education" color="#9B59B6"
                editMode={editMode.education} saving={saving.education}
                onToggle={() => toggleEdit("education")} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <Field label="Highest Qualification" value={draft.highestQualification} edit={editMode.education} className="sm:col-span-2">
                  <Select value={draft.highestQualification} onChange={set("highestQualification")}
                    options={EDUCATION_OPTIONS} placeholder="Select highest level" />
                </Field>
              </div>

              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Qualifications</p>
                {editMode.education && (
                  <button onClick={() => addArr("educations", { level: "", field: "", institution: "", year: "" })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{ background: "rgba(155,89,182,0.1)", color: "#534AB7", border: "1px solid rgba(155,89,182,0.2)" }}>
                    <FiPlus size={11} /> Add
                  </button>
                )}
              </div>

              {(draft.educations || []).length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl"
                  style={{ background: "rgba(155,89,182,0.04)", border: "1.5px dashed rgba(155,89,182,0.2)" }}>
                  <FiBook size={24} style={{ color: "rgba(155,89,182,0.4)" }} />
                  <p className="text-sm font-bold text-gray-400 mt-2">No qualifications added</p>
                  {!editMode.education && (
                    <p className="text-xs text-gray-300 mt-1">Click Edit to add education details</p>
                  )}
                </div>
              )}
              {(draft.educations || []).map((item, i) => (
                <EducationCard key={i} item={item} index={i} edit={editMode.education}
                  onChange={(idx, f, v) => setArr("educations", idx, f, v)}
                  onRemove={(idx) => removeArr("educations", idx)} />
              ))}
            </>
          )}

          {/* ═══ CAREER TAB ═══ */}
          {tab === "career" && (
            <>
              <SectionHeader icon={FiBriefcase} title="Employment" color="#F7971E"
                editMode={editMode.career} saving={saving.career}
                onToggle={() => toggleEdit("career")} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Employment Type" value={draft.employmentType} edit={editMode.career} className="sm:col-span-2">
                  <Select value={draft.employmentType} onChange={set("employmentType")}
                    options={EMPLOYMENT_TYPES} placeholder="Select type" />
                </Field>
                <Field label="Sector" value={draft.sector} edit={editMode.career}>
                  <Select value={draft.sector} onChange={set("sector")} options={SECTORS} placeholder="Select sector" />
                </Field>
                <Field label="Organisation" value={draft.organisation} edit={editMode.career}>
                  <Input value={draft.organisation} onChange={set("organisation")} placeholder="Company / Org name" />
                </Field>
                <Field label="Job Title" value={draft.jobTitle} edit={editMode.career}>
                  <Input value={draft.jobTitle} onChange={set("jobTitle")} placeholder="Designation / Title" />
                </Field>
                <Field label="Work Location" value={draft.jobLocation} edit={editMode.career}>
                  <Input value={draft.jobLocation} onChange={set("jobLocation")} placeholder="City or Remote" />
                </Field>
                <Field label="Annual Income (₹)" value={draft.annualIncome ? `₹ ${draft.annualIncome}` : ""} edit={editMode.career} className="sm:col-span-2">
                  <Input value={draft.annualIncome} onChange={set("annualIncome")} placeholder="e.g. 500000" type="number" />
                </Field>
              </div>

              <Divider />

              <SectionHeader icon={FiAward} title="Skills" color="#43B89C"
                editMode={editMode.skills} saving={saving.skills}
                onToggle={() => toggleEdit("skills")} />
              <Field label="Skills / Expertise" value={draft.skills} edit={editMode.skills}>
                <Textarea value={draft.skills} onChange={set("skills")}
                  placeholder="e.g. Carpentry, Computer Operator, Teaching, Driving…" rows={3} />
              </Field>
            </>
          )}

          {/* ═══ EXPERIENCE TAB ═══ */}
          {tab === "experience" && (
            <>
              <SectionHeader icon={FiAward} title="Work Experience" color="#E91E8C"
                editMode={editMode.experience} saving={saving.experience}
                onToggle={() => toggleEdit("experience")} />

              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-400">
                  {expCount} {expCount === 1 ? "entry" : "entries"}
                </p>
                {editMode.experience && (
                  <button
                    onClick={() => addArr("experiences", { title: "", organisation: "", from: "", to: "", description: "" })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{ background: "rgba(233,30,140,0.08)", color: "#993556", border: "1px solid rgba(233,30,140,0.2)" }}>
                    <FiPlus size={11} /> Add Entry
                  </button>
                )}
              </div>

              {expCount === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl"
                  style={{ background: "rgba(233,30,140,0.04)", border: "1.5px dashed rgba(233,30,140,0.18)" }}>
                  <FiBriefcase size={24} style={{ color: "rgba(233,30,140,0.3)" }} />
                  <p className="text-sm font-bold text-gray-400 mt-2">No experience added</p>
                  {!editMode.experience && (
                    <p className="text-xs text-gray-300 mt-1">Click Edit to add work history</p>
                  )}
                </div>
              )}
              {(draft.experiences || []).map((item, i) => (
                <ExperienceCard key={i} item={item} index={i} edit={editMode.experience}
                  color="#E91E8C"
                  onChange={(idx, f, v) => setArr("experiences", idx, f, v)}
                  onRemove={(idx) => removeArr("experiences", idx)} />
              ))}
            </>
          )}

          <div className="pb-6" />
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 flex gap-2 px-5 py-4"
          style={{ borderTop: "1.5px solid rgba(78,174,229,0.1)" }}>
          <button onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-gray-600 transition-all hover:bg-gray-100"
            style={{ border: "1.5px solid rgba(78,174,229,0.18)" }}>
            Close
          </button>
          <a href={`tel:${member.phone}`}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-white text-center flex items-center justify-center gap-2 transition-all"
            style={{ background: "linear-gradient(135deg,#4EAEE5,#9B59B6)" }}>
            <FiPhone size={14} /> Call Member
          </a>
        </div>
      </div>
    </>
  );
}