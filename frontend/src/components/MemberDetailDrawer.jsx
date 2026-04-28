import { useEffect, useRef } from "react";
import {
    FiX, FiPhone, FiMapPin, FiCalendar, FiHeart,
    FiUser, FiHome, FiUsers, FiHash,
    FiMail,
} from "react-icons/fi";

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const ACCENT_PAIRS = [
    ["#4EAEE5", "#9B59B6"], ["#9B59B6", "#E91E8C"], ["#E91E8C", "#4EAEE5"],
    ["#4EAEE5", "#43B89C"], ["#F7971E", "#E91E8C"], ["#43B89C", "#9B59B6"],
];

const accentFor = (name = "") => ACCENT_PAIRS[name.length % ACCENT_PAIRS.length];
const initials = (name = "") => name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

function InfoRow({ icon: Icon, label, value, iconColor = "#4EAEE5" }) {
    return (
        <div className="flex items-center gap-3 py-3"
            style={{ borderBottom: "1px solid rgba(78,174,229,0.1)" }}>
            <div className="flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0"
                style={{ background: `${iconColor}18` }}>
                <Icon size={14} style={{ color: iconColor }} />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{value || "—"}</p>
            </div>
        </div>
    );
}

function SectionLabel({ children }) {
    return (
        <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mt-5 mb-1">
            {children}
        </p>
    );
}

export default function MemberDetailDrawer({ member, onClose }) {
    const drawerRef = useRef(null);
    const isOpen = !!member;

    // Close on Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    // Trap scroll on body when open
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const [from, to] = member ? accentFor(member.name) : ["#4EAEE5", "#9B59B6"];
    const isPaid = member?.paymentStatus === "completed";

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 z-40 transition-all duration-300"
                style={{
                    background: "rgba(15,23,42,0.45)",
                    backdropFilter: "blur(4px)",
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? "auto" : "none",
                }}
            />

            {/* Drawer panel */}
            <div
                ref={drawerRef}
                className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300"
                style={{
                    width: "min(400px, 100vw)",
                    background: "rgba(255,255,255,0.97)",
                    backdropFilter: "blur(20px)",
                    borderLeft: "1.5px solid rgba(78,174,229,0.18)",
                    boxShadow: "-8px 0 40px rgba(78,174,229,0.12)",
                    transform: isOpen ? "translateX(0)" : "translateX(100%)",
                }}
            >
                {member && (
                    <>
                        {/* Header */}
                        <div className="flex items-start gap-4 px-5 pt-6 pb-5"
                            style={{ borderBottom: "1.5px solid rgba(78,174,229,0.12)" }}>
                            {/* Avatar */}
                            <div className="flex-shrink-0 flex items-center justify-center rounded-2xl font-black text-white select-none overflow-hidden"
                                style={{
                                    width: 58, height: 58,
                                    background: `linear-gradient(135deg, ${from}, ${to})`,
                                    fontSize: 20,
                                }}>
                                {member.photo
                                    ? <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                                    : initials(member.name)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h2 className="font-black text-gray-900 text-lg leading-tight truncate">{member.name}</h2>
                                <p className="text-xs text-gray-400 font-mono mt-0.5">{member.memberId}</p>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                                        style={{
                                            background: isPaid ? "rgba(34,197,94,0.1)" : "rgba(251,146,60,0.1)",
                                            color: isPaid ? "#15803d" : "#c2410c",
                                            border: `1px solid ${isPaid ? "rgba(34,197,94,0.25)" : "rgba(251,146,60,0.25)"}`,
                                        }}>
                                        {isPaid ? "✓ Paid" : "⏳ Pending"}
                                    </span>
                                    {member.bloodGroup && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                                            style={{ background: "rgba(233,30,140,0.08)", color: "#993556", border: "1px solid rgba(233,30,140,0.2)" }}>
                                            <FiHeart size={9} /> {member.bloodGroup}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                                        style={{ background: "rgba(155,89,182,0.08)", color: "#534AB7", border: "1px solid rgba(155,89,182,0.2)" }}>
                                        {member.gender}
                                    </span>
                                </div>
                            </div>

                            {/* Close */}
                            <button
                                onClick={onClose}
                                className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                                aria-label="Close">
                                <FiX size={16} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto px-5 py-4">
                            <SectionLabel>Contact</SectionLabel>
                            <InfoRow icon={FiPhone} label="Phone" value={member.phone} iconColor="#4EAEE5" />
                            <InfoRow icon={FiMail} label="Email" value={member.email} iconColor="#4EAEE5" />
                            <InfoRow icon={FiMapPin} label="Place" value={member.place} iconColor="#4EAEE5" />

                            <SectionLabel>Personal</SectionLabel>
                            <InfoRow icon={FiCalendar} label="Date of Birth" value={fmtDate(member.dob)} iconColor="#E91E8C" />
                            <InfoRow icon={FiUser} label="Father's Name" value={member.father} iconColor="#E91E8C" />
                            <InfoRow icon={FiUser} label="Mother's Name" value={member.mother} iconColor="#E91E8C" />

                            <SectionLabel>Membership</SectionLabel>
                            <InfoRow icon={FiCalendar} label="Joined" value={fmtDate(member.createdAt)} iconColor="#43B89C" />
                            <InfoRow icon={FiHash} label="Member ID" value={member.memberId} iconColor="#43B89C" />

                            {/* Divider spacing */}
                            <div className="pb-4" />
                        </div>

                        {/* Footer actions */}
                        <div className="flex gap-2 px-5 py-4"
                            style={{ borderTop: "1.5px solid rgba(78,174,229,0.12)" }}>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-2xl text-sm font-bold text-gray-600 transition-all hover:bg-gray-100"
                                style={{ border: "1.5px solid rgba(78,174,229,0.18)" }}>
                                Close
                            </button>
                            <a
                                href={`tel:${member.phone}`}
                                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white text-center transition-all"
                                style={{ background: "linear-gradient(135deg, #4EAEE5, #9B59B6)" }}>
                                Call Member
                            </a>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}