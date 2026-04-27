import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiUsers } from "react-icons/fi";

/**
 * MembersMarquee
 *
 * Props:
 *   members  – array of { name, place, avatar? }
 *              If not provided, falls back to SAMPLE_MEMBERS for demo.
 *
 * Usage in LandingPage:
 *   <MembersMarquee members={fetchedMembers} />
 *
 * Place it between the Stats section and the Features section.
 */

const SAMPLE_MEMBERS = [
  { name: "Arjun Nair", place: "Kozhikode" },
  { name: "Fathima Beevi", place: "Malappuram" },
  { name: "Rahul Menon", place: "Thrissur" },
  { name: "Sana Rashid", place: "Kannur" },
  { name: "Vishnu Das", place: "Palakkad" },
  { name: "Amina Shirin", place: "Calicut" },
  { name: "Anil Kumar", place: "Ernakulam" },
  { name: "Naseema K", place: "Tirur" },
  { name: "Deepthi Raj", place: "Kottayam" },
  { name: "Bilal Ahmed", place: "Manjeri" },
  { name: "Priya Suresh", place: "Wayanad" },
  { name: "Shabna M", place: "Ponnani" },
];

function initials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// Deterministic pastel gradient per member based on name length
const CARD_ACCENTS = [
  { from: "#4EAEE5", to: "#9B59B6" },
  { from: "#9B59B6", to: "#E91E8C" },
  { from: "#E91E8C", to: "#4EAEE5" },
  { from: "#4EAEE5", to: "#43B89C" },
  { from: "#F7971E", to: "#E91E8C" },
  { from: "#43B89C", to: "#9B59B6" },
];

function accentFor(name) {
  return CARD_ACCENTS[name.length % CARD_ACCENTS.length];
}

function MemberCard({ member }) {
  const accent = accentFor(member.name);
  return (
    <div
      className="flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.82)",
        border: "1.5px solid rgba(78,174,229,0.18)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 4px 16px rgba(78,174,229,0.08)",
        minWidth: "170px",
      }}
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-xl font-black text-sm text-white"
        style={{
          width: 40,
          height: 40,
          background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
        }}
      >
        {member.photo ? (
          <img
            src={member.photo}
            alt={initials(member.name)}
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <span className="text-lg">{initials(member.name)}</span>
        )}
      </div>
    

      {/* Text */}
      <div className="overflow-hidden">
        <p
          className="font-bold text-gray-800 truncate"
          style={{ fontSize: 13, lineHeight: "1.3" }}
        >
          {member.name}
        </p>
        <p className="text-gray-400 truncate" style={{ fontSize: 11 }}>
          {member.place}
        </p>
      </div>
    </div>
  );
}

export function MembersMarquee({ members }) {
  const navigate = useNavigate();
  const list = members?.length ? members : SAMPLE_MEMBERS;

  // Duplicate for seamless loop
  const doubled = [...list, ...list];

  return (
    <section className="relative z-10 py-14 px-4 overflow-hidden">
      {/* Section header */}
      <div className="max-w-5xl mx-auto text-center mb-8">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-3"
          style={{
            background: "rgba(78,174,229,0.1)",
            border: "1px solid rgba(78,174,229,0.25)",
            color: "#4EAEE5",
            letterSpacing: "0.1em",
          }}
        >
          <FiUsers size={12} />
          GROWING FAMILY
        </div>
        <h3 className="text-3xl sm:text-4xl font-black text-gray-800 mb-2">
          Meet Our <span className="gradient-text">Members</span>
        </h3>
      </div>

      {/* ── Marquee Track 1 (left → right) ── */}
      <div className="relative mb-3 overflow-hidden">
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, var(--bg-hero, #F0F4FF), transparent)",
          }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to left, var(--bg-hero, #F0F4FF), transparent)",
          }}
        />

        <div
          className="flex gap-3"
          style={{
            animation: "marquee-ltr 28s linear infinite",
            width: "max-content",
          }}
        >
          {doubled.map((m, i) => (
            <MemberCard key={i} member={m} />
          ))}
        </div>
      </div>

      {/* ── Marquee Track 2 (right → left, offset) ── */}
      <div className="relative overflow-hidden">
        <div
          className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, var(--bg-hero, #F0F4FF), transparent)",
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to left, var(--bg-hero, #F0F4FF), transparent)",
          }}
        />

        <div
          className="flex gap-3"
          style={{
            animation: "marquee-rtl 22s linear infinite",
            width: "max-content",
          }}
        >
          {[...doubled].reverse().map((m, i) => (
            <MemberCard key={i} member={m} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-center mt-10">
        <button
          onClick={() => navigate("/members")}
          className="group flex items-center gap-3 px-7 py-3.5 rounded-2xl font-bold text-base transition-all duration-300 hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #4EAEE5 0%, #9B59B6 55%, #E91E8C 100%)",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(78,174,229,0.35)",
          }}
        >
          <FiUsers />
          <span>View All Members</span>
          <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Keyframe animations — injected once */}
      <style>{`
        @keyframes marquee-ltr {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-rtl {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}