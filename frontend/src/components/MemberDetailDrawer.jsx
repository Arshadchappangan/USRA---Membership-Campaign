import { useEffect, useState, useRef } from "react";
import {
  FiX, FiPhone, FiMapPin, FiCalendar, FiHeart,
  FiUser, FiHash, FiUsers, FiBriefcase,
  FiBook, FiAward, FiMail, FiChevronRight,
  FiShield, FiTrendingUp, FiHome,
} from "react-icons/fi";

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const ACCENT_PAIRS = [
  ["#4EAEE5", "#9B59B6"], ["#9B59B6", "#E91E8C"], ["#E91E8C", "#4EAEE5"],
  ["#4EAEE5", "#43B89C"], ["#F7971E", "#E91E8C"], ["#43B89C", "#9B59B6"],
];
const accentFor = (n = "") => ACCENT_PAIRS[n.length % ACCENT_PAIRS.length];
const initials = (n = "") => n.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const TABS = [
  { key: "profile", label: "Profile", icon: FiUser },
  { key: "career", label: "Career", icon: FiBriefcase },
  { key: "education", label: "Education", icon: FiBook },
  { key: "experience", label: "Experience", icon: FiAward },
];

/* ─── Stat chip ─────────────────────────────────────────────────────────── */
function StatChip({ label, value, color, bg, border }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold leading-none flex-shrink-0"
      style={{ background: bg, color, border: `0.5px solid ${border}` }}>
      {label && <span className="opacity-60 font-semibold">{label}</span>}
      {value}
    </span>
  );
}

/* ─── Info row ──────────────────────────────────────────────────────────── */
function InfoRow({ icon: Icon, label, value, color = "#4EAEE5", mono = false }) {
  if (!value && value !== 0) return null;
  return (
    <div className="group flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-150"
      style={{ background: "transparent" }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(78,174,229,0.04)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150"
        style={{ background: `${color}12` }}>
        <Icon size={13} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black tracking-widest uppercase mb-0.5" style={{ color: `${color}80` }}>{label}</p>
        <p className={`text-sm font-semibold text-gray-800 truncate ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  );
}

/* ─── Section header ────────────────────────────────────────────────────── */
function SectionHead({ icon: Icon, label, color, count }) {
  return (
    <div className="flex items-center gap-2 px-1 mb-1 mt-5 first:mt-0">
      <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15` }}>
        <Icon size={10} style={{ color }} />
      </div>
      <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: `${color}90` }}>{label}</span>
      {count !== undefined && (
        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${color}12`, color }}>
          {count}
        </span>
      )}
      <div className="flex-1 ml-1" style={{ height: "0.5px", background: `${color}18` }} />
    </div>
  );
}

/* ─── Thin divider ──────────────────────────────────────────────────────── */
function Divider({ color = "rgba(78,174,229,0.1)" }) {
  return <div className="mx-4 my-2" style={{ height: "0.5px", background: color }} />;
}

/* ─── Education card ────────────────────────────────────────────────────── */
function EduCard({ item, index }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl mb-2 transition-all duration-150"
      style={{ background: "rgba(155,89,182,0.05)", border: "1px solid rgba(155,89,182,0.12)" }}>
      <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "rgba(155,89,182,0.12)" }}>
        <span className="text-[10px] font-black" style={{ color: "#9B59B6" }}>{index + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-gray-800 leading-snug">
          {item.level || "—"}{item.field ? <span className="font-semibold text-gray-500"> · {item.field}</span> : ""}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{item.institution || "—"}</p>
      </div>
      {item.year && (
        <span className="text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0"
          style={{ background: "rgba(155,89,182,0.1)", color: "#534AB7" }}>{item.year}</span>
      )}
    </div>
  );
}

/* ─── Experience card ───────────────────────────────────────────────────── */
function ExpCard({ item, index }) {
  return (
    <div className="px-4 py-3.5 rounded-2xl mb-2 transition-all duration-150"
      style={{ background: "rgba(233,30,140,0.04)", border: "1px solid rgba(233,30,140,0.1)" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: "rgba(233,30,140,0.1)" }}>
            <span className="text-[10px] font-black" style={{ color: "#E91E8C" }}>{index + 1}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-gray-800 leading-snug">{item.title || "—"}</p>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">{item.organisation || "—"}</p>
          </div>
        </div>
        {(item.from || item.to) && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0"
            style={{ background: "rgba(233,30,140,0.08)", color: "#993556" }}>
            {[item.from, item.to].filter(Boolean).join("–")}
          </span>
        )}
      </div>
      {item.description && (
        <p className="text-xs text-gray-500 mt-2 leading-relaxed pl-10">{item.description}</p>
      )}
    </div>
  );
}

/* ─── Empty state ───────────────────────────────────────────────────────── */
function Empty({ icon: Icon, msg, color }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 rounded-2xl mx-1"
      style={{ background: `${color}05`, border: `1.5px dashed ${color}20` }}>
      <Icon size={22} style={{ color: `${color}40` }} />
      <p className="text-xs font-semibold text-gray-400">{msg}</p>
    </div>
  );
}

/* ─── Bio card ──────────────────────────────────────────────────────────── */
function BioCard({ bio }) {
  if (!bio) return null;
  return (
    <div className="mx-1 px-4 py-3.5 rounded-2xl mb-1"
      style={{ background: "linear-gradient(135deg,rgba(67,184,156,0.07),rgba(78,174,229,0.05))", border: "1px solid rgba(67,184,156,0.16)" }}>
      <p className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: "rgba(67,184,156,0.8)" }}>About</p>
      <p className="text-sm text-gray-700 leading-relaxed">{bio}</p>
    </div>
  );
}

/* ─── Skills card ───────────────────────────────────────────────────────── */
function SkillsCard({ skills }) {
  if (!skills) return null;
  const list = skills.split(",").map(s => s.trim()).filter(Boolean);
  return (
    <div className="mx-1 px-4 py-3.5 rounded-2xl"
      style={{ background: "rgba(67,184,156,0.05)", border: "1px solid rgba(67,184,156,0.14)" }}>
      <p className="text-[10px] font-black tracking-widest uppercase mb-2.5" style={{ color: "rgba(67,184,156,0.8)" }}>Skills</p>
      <div className="flex flex-wrap gap-1.5">
        {list.map((s, i) => (
          <span key={i} className="px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ background: "rgba(67,184,156,0.1)", color: "#0F6E56", border: "0.5px solid rgba(67,184,156,0.2)" }}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Hero avatar ───────────────────────────────────────────────────────── */
function HeroAvatar({ member, from, to }) {
  return (
    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center font-black text-white select-none overflow-hidden flex-shrink-0"
      style={{ background: `linear-gradient(145deg,${from},${to})`, fontSize: 22, boxShadow: `0 8px 24px ${from}45`, minWidth: 64, minHeight: 64 }}>
      {member.photo
        ? <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
        : initials(member.name)}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Main Drawer
════════════════════════════════════════════════════════════════════════════ */
export default function MemberDetailDrawer({ member, onClose }) {
  const [tab, setTab] = useState("profile");
  const [entered, setEntered] = useState(false);
  const bodyRef = useRef(null);
  const isOpen = !!member;

  /* Animate in */
  useEffect(() => {
    if (isOpen) { requestAnimationFrame(() => setEntered(true)); }
    else { setEntered(false); }
  }, [isOpen]);

  /* Keyboard + body scroll lock */
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [isOpen, onClose]);

  /* Reset tab + scroll on member change */
  useEffect(() => {
    if (member) { setTab("profile"); if (bodyRef.current) bodyRef.current.scrollTop = 0; }
  }, [member]);

  if (!member) return null;

  const [from, to] = accentFor(member.name);
  const isPaid = member.paymentStatus === "completed";
  const eduCount = (member.educations || []).length;
  const expCount = (member.experiences || []).length;
  const isMarried = member.maritalStatus === "Married";

  const hasCareerData =
    member.employmentType ||
    member.sector ||
    member.organisation ||
    member.jobTitle ||
    member.jobLocation ||
    member.annualIncome ||
    member.skills;

  return (
    <>
      <style>{`
        .drawer-scroll::-webkit-scrollbar { width: 3px; }
        .drawer-scroll::-webkit-scrollbar-track { background: transparent; }
        .drawer-scroll::-webkit-scrollbar-thumb { background: rgba(78,174,229,0.18); border-radius: 99px; }
        .tab-pill { position: relative; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 8px 4px 10px; flex: 1; font-size: 10px; font-weight: 800; letter-spacing: .03em; text-transform: uppercase; transition: color .15s; cursor: pointer; border: none; background: none; }
        .tab-pill::after { content: ''; position: absolute; bottom: 0; left: 20%; right: 20%; height: 2.5px; border-radius: 99px; transition: opacity .15s, transform .15s; opacity: 0; transform: scaleX(0.6); }
        .tab-pill.active::after { opacity: 1; transform: scaleX(1); }
        @keyframes drawerIn { from { opacity:0; transform:translateX(32px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp .25s ease both; }
      `}</style>

      {/* Backdrop */}
      <div onClick={onClose}
        className="fixed inset-0 z-40 transition-all duration-300"
        style={{
          background: "rgba(10,20,40,0.5)",
          backdropFilter: "blur(6px)",
          opacity: entered ? 1 : 0,
          pointerEvents: entered ? "auto" : "none",
          WebkitBackdropFilter: "blur(6px)",
        }} />

      {/* Drawer panel */}
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: "min(480px, 100vw)",
          background: "rgba(247,250,255,0.97)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderLeft: "1px solid rgba(78,174,229,0.14)",
          boxShadow: "-20px 0 60px rgba(78,174,229,0.12), -4px 0 16px rgba(0,0,0,0.06)",
          transition: "transform .3s cubic-bezier(.32,.72,0,1)",
          transform: entered ? "translateX(0)" : "translateX(100%)",
        }}>

        {/* Gradient top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 z-10"
          style={{ background: `linear-gradient(90deg,${from},${to},${from})` }} />

        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 px-5 pt-6 pb-0"
          style={{ borderBottom: "1px solid rgba(78,174,229,0.1)" }}>

          {/* Top row: avatar + name + close */}
          <div className="flex items-start gap-4 mb-4">
            <HeroAvatar member={member} from={from} to={to} />

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black text-gray-900 leading-tight truncate">{member.name}</h2>

              {/* Sub-line: job title */}
              {(member.jobTitle || member.organisation) && (
                <p className="text-xs font-semibold text-gray-500 mt-0.5 truncate">
                  {member.jobTitle}{member.organisation ? ` · ${member.organisation}` : ""}
                </p>
              )}

              {/* Member ID */}
              <p className="text-[11px] font-mono text-gray-400 mt-1">{member.memberId}</p>

              {/* Status badges */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <StatChip
                  value={isPaid ? "✓ Paid" : "⏳ Pending"}
                  color={isPaid ? "#3B6D11" : "#854F0B"}
                  bg={isPaid ? "#EAF3DE" : "#FAEEDA"}
                  border={isPaid ? "#C0DD97" : "#FAC775"}
                />
                {member.bloodGroup && (
                  <StatChip value={member.bloodGroup} label="🩸 " color="#72243E" bg="#FBEAF0" border="#F4C0D1" />
                )}
                {member.gender && (
                  <StatChip
                    value={member.gender}
                    color={member.gender === "Female" ? "#3C3489" : "#185FA5"}
                    bg={member.gender === "Female" ? "#EEEDFE" : "#E6F1FB"}
                    border={member.gender === "Female" ? "#CECBF6" : "#B5D4F4"}
                  />
                )}
                {member.maritalStatus && (
                  <StatChip value={member.maritalStatus} color="#085041" bg="#E1F5EE" border="#9FE1CB" />
                )}
              </div>
            </div>

            {/* Close button */}
            <button onClick={onClose}
              className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150"
              style={{ background: "rgba(78,174,229,0.07)", color: "#94a3b8", border: "1px solid rgba(78,174,229,0.14)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#ef4444"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(78,174,229,0.07)"; e.currentTarget.style.color = "#94a3b8"; }}>
              <FiX size={14} />
            </button>
          </div>

          {/* ── Tab bar ── */}
          <div className="flex">
            {TABS.map(t => {
              const active = tab === t.key;
              const badge = t.key === "education" ? eduCount : t.key === "experience" ? expCount : 0;
              return (
                <button key={t.key}
                  className={`tab-pill ${active ? "active" : ""}`}
                  style={{ color: active ? from : "#9ca3af" }}
                  onClick={() => { setTab(t.key); if (bodyRef.current) bodyRef.current.scrollTop = 0; }}>
                  <style>{`.tab-pill.active::after { background: linear-gradient(90deg,${from},${to}); }`}</style>
                  <t.icon size={13} />
                  <span className="hidden xs:inline sm:inline">{t.label}</span>
                  {badge > 0 && (
                    <span className="absolute -top-1 right-1 min-w-[14px] h-3.5 px-1 rounded-full text-white text-[8px] font-black flex items-center justify-center"
                      style={{ background: "#E91E8C" }}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── BODY ──────────────────────────────────────────────────────── */}
        <div ref={bodyRef} className="drawer-scroll flex-1 overflow-y-auto py-4"
          style={{ scrollBehavior: "smooth" }}>

          {/* ═══ PROFILE TAB ═══ */}
          {tab === "profile" && (
            <div className="fade-up">

              {/* Bio */}
              {member.bio && (
                <>
                  <div className="px-4 mb-1">
                    <BioCard bio={member.bio} />
                  </div>
                  <div className="my-2 mx-5" style={{ height: "0.5px", background: "rgba(78,174,229,0.09)" }} />
                </>
              )}

              {/* Personal */}
              <div className="px-3">
                <SectionHead icon={FiUser} label="Personal" color="#9B59B6" />
              </div>
              <InfoRow icon={FiCalendar} label="Date of Birth" value={fmtDate(member.dob)} color="#9B59B6" />
              <InfoRow icon={FiUser} label="Gender" value={member.gender} color="#9B59B6" />
              <InfoRow icon={FiUser} label="Father" value={member.father} color="#9B59B6" />
              <InfoRow icon={FiUser} label="Mother" value={member.mother} color="#9B59B6" />
              <InfoRow icon={FiHome} label="House Name" value={member.houseName} color="#9B59B6" />

              {isMarried && (
                <>
                  <div className="px-3">
                    <SectionHead icon={FiHeart} label="Spouse" color="#E91E8C" />
                  </div>
                  <InfoRow icon={FiUser} label="Spouse Name" value={member.spouse} color="#E91E8C" />
                  <InfoRow icon={FiPhone} label="Spouse Phone" value={member.spousePhone} color="#E91E8C" />
                  <InfoRow icon={FiBriefcase} label="Spouse Occupation" value={member.spouseJob} color="#E91E8C" />
                  <InfoRow icon={FiUsers} label="Children" value={member.children} color="#E91E8C" />
                </>
              )}

              <div className="my-2 mx-5" style={{ height: "0.5px", background: "rgba(78,174,229,0.09)" }} />

              {/* Contact */}
              <div className="px-3">
                <SectionHead icon={FiPhone} label="Contact" color="#4EAEE5" />
              </div>
              <InfoRow icon={FiPhone} label="Phone" value={member.phone} color="#4EAEE5" />
              <InfoRow icon={FiMail} label="Email" value={member.email} color="#4EAEE5" />
              <InfoRow icon={FiMapPin} label="Place" value={member.place} color="#4EAEE5" />

              <div className="my-2 mx-5" style={{ height: "0.5px", background: "rgba(78,174,229,0.09)" }} />

              {/* Membership */}
              <div className="px-3">
                <SectionHead icon={FiShield} label="Membership" color="#43B89C" />
              </div>
              <InfoRow icon={FiHash} label="Member ID" value={member.memberId} color="#43B89C" mono />
              <InfoRow icon={FiCalendar} label="Joined" value={fmtDate(member.createdAt)} color="#43B89C" />
              <InfoRow icon={FiShield} label="Payment Status" value={member.paymentStatus === "completed" ? "✓ Paid" : "⏳ Pending"} color="#43B89C" />

              <div className="pb-4" />
            </div>
          )}

          {/* ═══ CAREER TAB ═══ */}
          {tab === "career" && (
            <div className="fade-up px-1">

              {!hasCareerData ? (
                <Empty
                  icon={FiBriefcase}
                  msg="No career details added yet"
                  color="#F7971E"
                />
              ) : (
                <>
                  {/* Employment block */}
                  <div className="px-3">
                    <SectionHead icon={FiBriefcase} label="Employment" color="#F7971E" />
                  </div>

                  <InfoRow icon={FiBriefcase} label="Employment Type" value={member.employmentType} color="#F7971E" />
                  <InfoRow icon={FiUsers} label="Sector" value={member.sector} color="#F7971E" />
                  <InfoRow icon={FiHash} label="Organisation" value={member.organisation} color="#F7971E" />
                  <InfoRow icon={FiUser} label="Job Title" value={member.jobTitle} color="#F7971E" />
                  <InfoRow icon={FiMapPin} label="Work Location" value={member.jobLocation} color="#F7971E" />

                  {member.annualIncome && (
                    <div className="mx-4 my-2 px-4 py-3 rounded-2xl flex items-center justify-between"
                      style={{
                        background: "linear-gradient(135deg,rgba(247,151,30,0.07),rgba(247,151,30,0.03))",
                        border: "1px solid rgba(247,151,30,0.16)"
                      }}>
                      <div>
                        <p className="text-[10px] font-black tracking-widest uppercase mb-0.5"
                          style={{ color: "rgba(247,151,30,0.7)" }}>
                          Annual Income
                        </p>
                        <p className="text-lg font-black text-gray-800">
                          ₹ {Number(member.annualIncome).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <FiTrendingUp size={24} style={{ color: "rgba(247,151,30,0.3)" }} />
                    </div>
                  )}

                  {/* Skills */}
                  {member.skills && (
                    <>
                      <div className="my-3 mx-5"
                        style={{ height: "0.5px", background: "rgba(78,174,229,0.09)" }} />
                      <div className="px-3">
                        <SectionHead icon={FiAward} label="Skills & Expertise" color="#43B89C" />
                      </div>
                      <div className="px-4">
                        <SkillsCard skills={member.skills} />
                      </div>
                    </>
                  )}
                </>
              )}

              <div className="pb-4" />
            </div>
          )}

          {/* ═══ EDUCATION TAB ═══ */}
          {tab === "education" && (
            <div className="fade-up px-4">

              {/* Highest qualification highlight */}
              {member.highestQualification && (
                <div className="flex items-center gap-3 mb-4 px-4 py-3.5 rounded-2xl"
                  style={{ background: "linear-gradient(135deg,rgba(155,89,182,0.08),rgba(155,89,182,0.04))", border: "1px solid rgba(155,89,182,0.16)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(155,89,182,0.12)" }}>
                    <FiAward size={15} style={{ color: "#9B59B6" }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black tracking-widest uppercase mb-0.5" style={{ color: "rgba(155,89,182,0.7)" }}>Highest Qualification</p>
                    <p className="text-sm font-black text-gray-800">{member.highestQualification}</p>
                  </div>
                </div>
              )}

              <div className="px-0 mb-3">
                <SectionHead icon={FiBook} label="All Qualifications" color="#9B59B6" count={eduCount} />
              </div>

              {eduCount === 0
                ? <Empty icon={FiBook} msg="No education details added yet" color="#9B59B6" />
                : (member.educations || []).map((item, i) => <EduCard key={i} item={item} index={i} />)
              }

              <div className="pb-4" />
            </div>
          )}

          {/* ═══ EXPERIENCE TAB ═══ */}
          {tab === "experience" && (
            <div className="fade-up px-4">

              <div className="px-0 mb-3">
                <SectionHead icon={FiAward} label="Work History" color="#E91E8C" count={expCount} />
              </div>

              {expCount === 0
                ? <Empty icon={FiBriefcase} msg="No work experience added yet" color="#E91E8C" />
                : (member.experiences || []).map((item, i) => <ExpCard key={i} item={item} index={i} />)
              }

              <div className="pb-4" />
            </div>
          )}
        </div>

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 px-5 py-3.5 flex items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(78,174,229,0.1)", background: "rgba(247,250,255,0.95)" }}>

          {/* Left: quick-action chips */}
          <div className="flex items-center gap-2 min-w-0">
            {member.phone && (
              <a href={`tel:${member.phone}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95"
                style={{ background: "rgba(78,174,229,0.08)", color: "#4EAEE5", border: "1px solid rgba(78,174,229,0.18)" }}>
                <FiPhone size={11} />
                <span className="hidden sm:inline">Call</span>
              </a>
            )}
            {member.email && (
              <a href={`mailto:${member.email}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95"
                style={{ background: "rgba(155,89,182,0.08)", color: "#9B59B6", border: "1px solid rgba(155,89,182,0.18)" }}>
                <FiMail size={11} />
                <span className="hidden sm:inline">Email</span>
              </a>
            )}
          </div>

          <button onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 active:scale-95 flex-shrink-0"
            style={{ background: "rgba(78,174,229,0.07)", color: "#6b7280", border: "1.5px solid rgba(78,174,229,0.18)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(78,174,229,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(78,174,229,0.07)"; }}>
            <FiX size={12} /> Close
          </button>
        </div>
      </div>
    </>
  );
}