import { useEffect } from "react";
import {
  FiX, FiPhone, FiMapPin, FiCalendar, FiHeart,
  FiUser, FiHash, FiUsers, FiBriefcase,
  FiBook, FiAward, FiChevronDown,
  FiMail,
} from "react-icons/fi";
import { useState } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ACCENT_PAIRS = [
  ["#4EAEE5", "#9B59B6"], ["#9B59B6", "#E91E8C"], ["#E91E8C", "#4EAEE5"],
  ["#4EAEE5", "#43B89C"], ["#F7971E", "#E91E8C"], ["#43B89C", "#9B59B6"],
];
const accentFor = (n = "") => ACCENT_PAIRS[n.length % ACCENT_PAIRS.length];
const initials = (n = "") => n.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

// ─── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, color = "#4EAEE5" }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-2.5" style={{ borderBottom: "1px solid rgba(78,174,229,0.08)" }}>
      <div className="flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0" style={{ background: `${color}12` }}>
        <Icon size={13} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 font-bold tracking-wide uppercase">{label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function SectionLabel({ children, icon: Icon, color = "#4EAEE5" }) {
  return (
    <div className="flex items-center gap-2.5 mt-5 mb-3">
      <div className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0" style={{ background: `${color}12` }}>
        <Icon size={12} style={{ color }} />
      </div>
      <p className="text-xs font-black text-gray-600 tracking-tight">{children}</p>
    </div>
  );
}

function Divider() { return <div className="my-4" style={{ height: "1px", background: "rgba(78,174,229,0.1)" }} />; }

function TabBtn({ active, onClick, icon: Icon, label, badge }) {
  return (
    <button onClick={onClick}
      className="relative flex flex-col items-center gap-1 pb-2.5 pt-1 px-1 text-xs font-bold transition-all flex-1"
      style={{ color: active ? "#4EAEE5" : "#9ca3af", borderBottom: active ? "2px solid #4EAEE5" : "2px solid transparent" }}>
      <Icon size={14} />
      <span className="hidden sm:inline">{label}</span>
      {badge > 0 && (
        <span className="absolute -top-0.5 right-0 w-4 h-4 rounded-full text-white text-[9px] font-black flex items-center justify-center"
          style={{ background: "#E91E8C" }}>{badge}</span>
      )}
    </button>
  );
}

// ─── Card views for education / experience ────────────────────────────────────
function EduCard({ item }) {
  return (
    <div className="rounded-2xl p-3.5 mb-2.5" style={{ background: "rgba(155,89,182,0.05)", border: "1.5px solid rgba(155,89,182,0.12)" }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-black text-gray-800">{item.level || "—"}{item.field ? ` · ${item.field}` : ""}</p>
          <p className="text-xs text-gray-500 mt-0.5">{item.institution || "—"}</p>
        </div>
        {item.year && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "rgba(155,89,182,0.1)", color: "#534AB7", border: "1px solid rgba(155,89,182,0.2)" }}>{item.year}</span>}
      </div>
    </div>
  );
}

function ExpCard({ item }) {
  return (
    <div className="rounded-2xl p-3.5 mb-2.5" style={{ background: "rgba(233,30,140,0.04)", border: "1.5px solid rgba(233,30,140,0.1)" }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-black text-gray-800">{item.title || "—"}</p>
          <p className="text-xs font-semibold text-gray-500 mt-0.5">{item.organisation || "—"}</p>
        </div>
        {(item.from || item.to) && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "rgba(233,30,140,0.08)", color: "#993556", border: "1px solid rgba(233,30,140,0.12)" }}>
            {[item.from, item.to].filter(Boolean).join(" → ")}
          </span>
        )}
      </div>
      {item.description && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{item.description}</p>}
    </div>
  );
}

function EmptyNote({ icon: Icon, msg, color }) {
  return (
    <div className="flex items-center gap-2.5 py-6 justify-center rounded-2xl"
      style={{ background: `${color}05`, border: `1.5px dashed ${color}25` }}>
      <Icon size={16} style={{ color: `${color}50` }} />
      <p className="text-xs font-semibold text-gray-400">{msg}</p>
    </div>
  );
}

// ─── Main Drawer (read-only) ──────────────────────────────────────────────────
export default function MemberDetailDrawer({ member, onClose }) {
  const [tab, setTab] = useState("profile");
  const isOpen = !!member;

  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [isOpen, onClose]);

  // Reset tab when member changes
  useEffect(() => { if (member) setTab("profile"); }, [member]);

  if (!member) return null;

  const [from, to] = accentFor(member.name);
  const isPaid = member.paymentStatus === "completed";
  const eduCount = (member.educations || []).length;
  const expCount = (member.experiences || []).length;
  const isMarried = member.maritalStatus === "Married";

  return (
    <>
      <style>{`.dscroll::-webkit-scrollbar{width:4px}.dscroll::-webkit-scrollbar-thumb{background:rgba(78,174,229,0.2);border-radius:99px}`}</style>

      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 z-40 transition-all duration-300"
        style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)", opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none" }} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300"
        style={{
          width: "min(460px,100vw)",
          background: "rgba(248,251,255,0.98)",
          backdropFilter: "blur(20px)",
          borderLeft: "1.5px solid rgba(78,174,229,0.18)",
          boxShadow: "-12px 0 48px rgba(78,174,229,0.14)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}>

        {/* Gradient top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 flex-shrink-0"
          style={{ background: `linear-gradient(90deg,${from},${to})` }} />

        {/* ── Header ── */}
        <div className="flex-shrink-0 px-5 pt-5 pb-0" style={{ borderBottom: "1.5px solid rgba(78,174,229,0.1)" }}>
          <div className="flex items-start gap-4 pb-4">
            {/* Avatar */}
            <div className="flex-shrink-0 flex items-center justify-center rounded-2xl font-black text-white select-none overflow-hidden"
              style={{ width: 60, height: 60, background: `linear-gradient(135deg,${from},${to})`, fontSize: 21, boxShadow: `0 6px 20px ${from}40` }}>
              {member.photo ? <img src={member.photo} alt={member.name} className="w-full h-full object-cover" /> : initials(member.name)}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <h2 className="font-black text-gray-900 text-xl leading-tight truncate">{member.name}</h2>
              <p className="text-[11px] text-gray-400 font-mono mt-0.5 mb-2">{member.memberId}</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={isPaid ? { background: "#EAF3DE", color: "#3B6D11", border: "0.5px solid #C0DD97" } : { background: "#FAEEDA", color: "#854F0B", border: "0.5px solid #FAC775" }}>
                  {isPaid ? "✓ Paid" : "⏳ Pending"}
                </span>
                {member.bloodGroup && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: "#FBEAF0", color: "#72243E", border: "0.5px solid #F4C0D1" }}>
                    <FiHeart size={8} /> {member.bloodGroup}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={member.gender === "Female" ? { background: "#EEEDFE", color: "#3C3489", border: "0.5px solid #CECBF6" } : { background: "#E6F1FB", color: "#185FA5", border: "0.5px solid #B5D4F4" }}>
                  {member.gender}
                </span>
                {member.maritalStatus && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: "#E1F5EE", color: "#085041", border: "0.5px solid #9FE1CB" }}>
                    {member.maritalStatus}
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

          {/* Tabs */}
          <div className="flex" style={{ gap: "2px" }}>
            <TabBtn active={tab === "profile"} onClick={() => setTab("profile")} icon={FiUser} label="Profile" />
            <TabBtn active={tab === "education"} onClick={() => setTab("education")} icon={FiBook} label="Education" badge={eduCount} />
            <TabBtn active={tab === "career"} onClick={() => setTab("career")} icon={FiBriefcase} label="Career" />
            <TabBtn active={tab === "experience"} onClick={() => setTab("experience")} icon={FiAward} label="Experience" badge={expCount} />
          </div>
        </div>

        {/* ── Body ── */}
        <div className="dscroll flex-1 overflow-y-auto px-5 py-4">

          {/* ═══ PROFILE ═══ */}
          {tab === "profile" && (
            <>

              <SectionLabel icon={FiUser} color="#9B59B6">Personal</SectionLabel>
              <InfoRow icon={FiUser} label="House Name" value={member.houseName} color="#9B59B6" />
              <InfoRow icon={FiCalendar} label="Date of Birth" value={fmtDate(member.dob)} color="#9B59B6" />
              <InfoRow icon={FiUser} label="Gender" value={member.gender} color="#9B59B6" />
              <InfoRow icon={FiHeart} label="Marital Status" value={member.maritalStatus} color="#9B59B6" />
              <InfoRow icon={FiUser} label="Father's Name" value={member.father} color="#9B59B6" />
              <InfoRow icon={FiUser} label="Mother's Name" value={member.mother} color="#9B59B6" />
              <InfoRow icon={FiHeart} label="Blood Group" value={member.bloodGroup} color="#9B59B6" />

              {isMarried && (
                <>
                  <div className="flex items-center gap-3 my-3">
                    <div className="h-px flex-1" style={{ background: "rgba(233,30,140,0.12)" }} />
                    <span className="text-[10px] font-bold text-pink-400 tracking-widest uppercase">Spouse</span>
                    <div className="h-px flex-1" style={{ background: "rgba(233,30,140,0.12)" }} />
                  </div>
                  <InfoRow icon={FiUser} label="Spouse Name" value={member.spouse} color="#E91E8C" />
                  <InfoRow icon={FiPhone} label="Spouse Phone" value={member.spousePhone} color="#E91E8C" />
                  <InfoRow icon={FiBriefcase} label="Spouse Job" value={member.spouseJob} color="#E91E8C" />
                  <InfoRow icon={FiUsers} label="No. of Children" value={member.children} color="#E91E8C" />
                </>
              )}

              {member.bio && (
                <>
                  <Divider />
                  <SectionLabel icon={FiUsers} color="#43B89C">About</SectionLabel>
                  <p className="text-sm text-gray-600 leading-relaxed">{member.bio}</p>
                </>
              )}

              <Divider />

              <SectionLabel icon={FiPhone} title="Contact" color="#4EAEE5">Contact</SectionLabel>
              <InfoRow icon={FiPhone} label="Phone" value={member.phone} color="#4EAEE5" />
              <InfoRow icon={FiMail} label="Email" value={member.email} color="#4EAEE5" />
              <InfoRow icon={FiMapPin} label="Place" value={member.place} color="#4EAEE5" />

              <Divider />

              <SectionLabel icon={FiHash} color="#4EAEE5">Membership</SectionLabel>
              <InfoRow icon={FiHash} label="Member ID" value={member.memberId} color="#4EAEE5" />
              <InfoRow icon={FiCalendar} label="Joined" value={fmtDate(member.createdAt)} color="#4EAEE5" />
            </>
          )}

          {/* ═══ EDUCATION ═══ */}
          {tab === "education" && (
            <>
              {member.highestQualification && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-2xl"
                  style={{ background: "rgba(155,89,182,0.07)", border: "1px solid rgba(155,89,182,0.15)" }}>
                  <FiAward size={14} style={{ color: "#9B59B6" }} className="flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Highest Qualification</p>
                    <p className="text-sm font-black text-gray-800">{member.highestQualification}</p>
                  </div>
                </div>
              )}
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-3">Qualifications ({eduCount})</p>
              {eduCount === 0
                ? <EmptyNote icon={FiBook} msg="No education details added yet" color="#9B59B6" />
                : (member.educations || []).map((item, i) => <EduCard key={i} item={item} />)
              }
            </>
          )}

          {/* ═══ CAREER ═══ */}
          {tab === "career" && (
            <>
              <SectionLabel icon={FiBriefcase} color="#F7971E">Employment</SectionLabel>
              <InfoRow icon={FiBriefcase} label="Employment Type" value={member.employmentType} color="#F7971E" />
              <InfoRow icon={FiUsers} label="Sector" value={member.sector} color="#F7971E" />
              <InfoRow icon={FiHash} label="Organisation" value={member.organisation} color="#F7971E" />
              <InfoRow icon={FiUser} label="Job Title" value={member.jobTitle} color="#F7971E" />
              <InfoRow icon={FiMapPin} label="Work Location" value={member.jobLocation} color="#F7971E" />
              <InfoRow icon={FiHash} label="Annual Income" value={member.annualIncome ? `₹ ${Number(member.annualIncome).toLocaleString("en-IN")}` : ""} color="#F7971E" />

              {member.skills && (
                <>
                  <Divider />
                  <SectionLabel icon={FiAward} color="#43B89C">Skills</SectionLabel>
                  <p className="text-sm text-gray-700 leading-relaxed">{member.skills}</p>
                </>
              )}
            </>
          )}

          {/* ═══ EXPERIENCE ═══ */}
          {tab === "experience" && (
            <>
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-3">{expCount} {expCount === 1 ? "entry" : "entries"}</p>
              {expCount === 0
                ? <EmptyNote icon={FiBriefcase} msg="No work experience added yet" color="#E91E8C" />
                : (member.experiences || []).map((item, i) => <ExpCard key={i} item={item} />)
              }
            </>
          )}

          <div className="pb-6" />
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 flex gap-2 px-5 py-4" style={{ borderTop: "1.5px solid rgba(78,174,229,0.1)" }}>
          <button onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-gray-600 transition-all hover:bg-gray-100 active:scale-95"
            style={{ border: "1.5px solid rgba(78,174,229,0.18)" }}>
            Close
          </button>
        </div>
      </div>
    </>
  );
}