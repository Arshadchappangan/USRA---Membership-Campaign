import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch, FiArrowLeft, FiArrowUp, FiArrowDown,
  FiGrid, FiList, FiX, FiFilter, FiUsers, FiMapPin,
  FiCalendar, FiChevronDown, FiPhone, FiHeart,
  FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import { getMembers } from "../utils/api";

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCENT_PAIRS = [
  ["#4EAEE5", "#9B59B6"], ["#9B59B6", "#E91E8C"], ["#E91E8C", "#4EAEE5"],
  ["#4EAEE5", "#43B89C"], ["#F7971E", "#E91E8C"], ["#43B89C", "#9B59B6"],
];
const PAGE_SIZE_OPTIONS = [12, 24, 48];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const SORT_OPTIONS = [
  { value: "date_desc",   label: "Newest First" },
  { value: "date_asc",    label: "Oldest First" },
  { value: "name_asc",    label: "Name A → Z" },
  { value: "name_desc",   label: "Name Z → A" },
  { value: "place_asc",   label: "Place A → Z" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const accentFor  = (name) => ACCENT_PAIRS[name.length % ACCENT_PAIRS.length];
const initials   = (name) => name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
const fmtDate    = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// ─── Sub-components ───────────────────────────────────────────────────────────
function Avatar({ name, photoURL, size = 48 }) {
  const [from, to] = accentFor(name);
  return (
    <div
      className="flex-shrink-0 flex items-center justify-center rounded-2xl font-black text-white select-none overflow-hidden border-2 border-gray-200"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${from}, ${to})`, fontSize: size * 0.32 }}
    >
      {photoURL
        ? <img src={`/uploads/${photoURL}`} alt={name} className="w-full h-full object-cover" />
        : initials(name)}
    </div>
  );
}

function PaymentBadge({ status }) {
  const ok = status === "completed";
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold"
      style={{
        background: ok ? "rgba(34,197,94,0.12)" : "rgba(251,146,60,0.12)",
        color:      ok ? "#15803d" : "#c2410c",
        border: `1px solid ${ok ? "rgba(34,197,94,0.25)" : "rgba(251,146,60,0.25)"}`,
      }}>
      {ok ? "Paid" : "Pending"}
    </span>
  );
}

// ── Skeleton cards ────────────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="flex flex-col items-center text-center p-5 rounded-3xl animate-pulse"
      style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(78,174,229,0.12)" }}>
      <div className="w-14 h-14 rounded-2xl bg-gray-200" />
      <div className="mt-3 h-3 w-20 bg-gray-200 rounded-full" />
      <div className="mt-1.5 h-2.5 w-14 bg-gray-100 rounded-full" />
      <div className="mt-2 h-2.5 w-16 bg-gray-100 rounded-full" />
      <div className="mt-2 h-5 w-12 bg-gray-100 rounded-full" />
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-2xl animate-pulse"
      style={{ background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(78,174,229,0.1)" }}>
      <div className="w-11 h-11 rounded-2xl bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 bg-gray-200 rounded-full" />
        <div className="h-2.5 w-24 bg-gray-100 rounded-full" />
      </div>
      <div className="hidden sm:flex flex-col items-end gap-2">
        <div className="h-5 w-14 bg-gray-100 rounded-full" />
        <div className="h-2.5 w-20 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

// ── Member cards ──────────────────────────────────────────────────────────────
function MemberCardGrid({ member }) {
  return (
    <div className="flex flex-col items-center text-center p-5 rounded-3xl transition-all duration-200 hover:-translate-y-1 cursor-default"
      style={{
        background: "rgba(255,255,255,0.82)",
        border: "1.5px solid rgba(78,174,229,0.18)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 20px rgba(78,174,229,0.09)",
      }}>
      <Avatar name={member.name} photoURL={member.photo} size={56} />
      <p className="mt-3 font-black text-gray-800 text-sm leading-tight">{member.name}</p>
      <p className="text-xs text-gray-400 font-mono mt-0.5">{member.memberId}</p>
      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 justify-center">
        <FiMapPin size={10} /> {member.place}
      </p>
      <span className="mt-2 inline-block px-3 py-0.5 rounded-full text-xs font-bold"
        style={{ background: "rgba(233,30,140,0.08)", color: "#993556", border: "1px solid rgba(233,30,140,0.2)" }}>
        {member.bloodGroup}
      </span>
      <div className="mt-2"><PaymentBadge status={member.paymentStatus} /></div>
      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1 justify-center">
        <FiCalendar size={10} /> {fmtDate(member.createdAt)}
      </p>
    </div>
  );
}

function MemberCardList({ member }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 hover:shadow-md cursor-default"
      style={{
        background: "rgba(255,255,255,0.85)",
        border: "1.5px solid rgba(78,174,229,0.15)",
        backdropFilter: "blur(8px)",
      }}>
      <Avatar name={member.name} photoURL={member.photo} size={44} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-black text-gray-800 text-sm truncate">{member.name}</p>
          <span className="text-xs text-gray-400 font-mono hidden sm:inline">{member.memberId}</span>
        </div>
        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
          <FiMapPin size={10} /> {member.place}
        </p>
      </div>
      <div className="hidden md:flex flex-col items-end gap-1 text-xs text-gray-400 flex-shrink-0">
        <span className="flex items-center gap-1"><FiPhone size={10} /> {member.phone}</span>
        <span className="flex items-center gap-1"><FiHeart size={10} /> {member.bloodGroup}</span>
      </div>
      <div className="text-right flex-shrink-0 hidden sm:flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: "rgba(155,89,182,0.1)", color: "#534AB7", border: "1px solid rgba(155,89,182,0.2)" }}>
            {member.gender}
          </span>
          <PaymentBadge status={member.paymentStatus} />
        </div>
        <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
          <FiCalendar size={10} /> {fmtDate(member.createdAt)}
        </p>
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, value, label, color, loading }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{ background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(78,174,229,0.15)", backdropFilter: "blur(8px)" }}>
      <div className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
        style={{ background: `${color}18` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        {loading
          ? <div className="h-5 w-8 bg-gray-200 rounded animate-pulse mb-1" />
          : <p className="font-black text-gray-800 text-lg leading-none">{value}</p>}
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, pageSize, setPage, setPageSize, totalItems, visibleCount }) {
  const pages = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "…", totalPages];
    if (page >= totalPages - 3) return [1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", page - 1, page, page + 1, "…", totalPages];
  }, [page, totalPages]);

  if (totalPages <= 1 && PAGE_SIZE_OPTIONS.every((s) => s >= totalItems)) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6"
      style={{ borderTop: "1.5px solid rgba(78,174,229,0.12)" }}>

      {/* Page size selector */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Show</span>
        <div className="flex gap-1">
          {PAGE_SIZE_OPTIONS.map((s) => (
            <button key={s} onClick={() => { setPageSize(s); setPage(1); }}
              className="w-9 h-9 rounded-xl text-sm font-bold transition-all duration-150"
              style={{
                background: pageSize === s ? "linear-gradient(135deg,#4EAEE5,#9B59B6)" : "rgba(255,255,255,0.8)",
                color: pageSize === s ? "#fff" : "#6b7280",
                border: pageSize === s ? "none" : "1.5px solid rgba(78,174,229,0.2)",
              }}>
              {s}
            </button>
          ))}
        </div>
        <span>per page</span>
      </div>

      {/* Page numbers */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: "rgba(255,255,255,0.8)",
              border: "1.5px solid rgba(78,174,229,0.2)",
              color: page === 1 ? "#d1d5db" : "#374151",
              cursor: page === 1 ? "not-allowed" : "pointer",
            }}>
            <FiChevronLeft size={15} />
          </button>

          {pages.map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-gray-400">…</span>
            ) : (
              <button key={p} onClick={() => setPage(p)}
                className="w-9 h-9 rounded-xl text-sm font-bold transition-all duration-150"
                style={{
                  background: page === p ? "linear-gradient(135deg,#4EAEE5,#9B59B6)" : "rgba(255,255,255,0.8)",
                  color: page === p ? "#fff" : "#374151",
                  border: page === p ? "none" : "1.5px solid rgba(78,174,229,0.2)",
                }}>
                {p}
              </button>
            )
          )}

          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: "rgba(255,255,255,0.8)",
              border: "1.5px solid rgba(78,174,229,0.2)",
              color: page === totalPages ? "#d1d5db" : "#374151",
              cursor: page === totalPages ? "not-allowed" : "pointer",
            }}>
            <FiChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Range info */}
      <p className="text-xs text-gray-400 font-medium">
        {visibleCount === 0 ? "No results" : `${((page - 1) * pageSize) + 1}–${Math.min(page * pageSize, totalItems)} of ${totalItems}`}
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const MembersPage = () => {
  const navigate = useNavigate();
  const [members,    setMembers]    = useState([]);
  const [loading,    setLoading]    = useState(true);

  const [search,     setSearch]     = useState("");
  const [gender,     setGender]     = useState("All");
  const [bloodGroup, setBloodGroup] = useState("All");
  const [payment,    setPayment]    = useState("All");
  const [sort,       setSort]       = useState("date_desc");
  const [view,       setView]       = useState("grid");
  const [filterOpen, setFilterOpen] = useState(false);

  const [page,       setPage]       = useState(1);
  const [pageSize,   setPageSize]   = useState(12);

  // Reset to page 1 when filters/sort change
  const handleSearch     = (v) => { setSearch(v);     setPage(1); };
  const handleGender     = (v) => { setGender(v);     setPage(1); };
  const handleBloodGroup = (v) => { setBloodGroup(v); setPage(1); };
  const handlePayment    = (v) => { setPayment(v);    setPage(1); };
  const handleSort       = (v) => { setSort(v);       setPage(1); };

  const clearFilters = useCallback(() => {
    setSearch(""); setGender("All"); setBloodGroup("All");
    setPayment("All"); setSort("date_desc"); setPage(1);
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await getMembers(1, 1000); // fetch all, paginate client-side
        setMembers(response.data);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const activeFilterCount = [
    gender !== "All", bloodGroup !== "All",
    payment !== "All", search.trim() !== "",
  ].filter(Boolean).length;

  // Filter + sort
  const filtered = useMemo(() => {
    let list = [...members];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((m) =>
        m.name?.toLowerCase().includes(q) ||
        m.place?.toLowerCase().includes(q) ||
        m.memberId?.toLowerCase().includes(q) ||
        m.phone?.includes(q)
      );
    }
    if (gender     !== "All") list = list.filter((m) => m.gender     === gender);
    if (bloodGroup !== "All") list = list.filter((m) => m.bloodGroup === bloodGroup);
    if (payment    !== "All") list = list.filter((m) => m.paymentStatus === payment);
    list.sort((a, b) => {
      if (sort === "name_asc")  return a.name?.localeCompare(b.name);
      if (sort === "name_desc") return b.name?.localeCompare(a.name);
      if (sort === "date_desc") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "date_asc")  return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "place_asc") return a.place?.localeCompare(b.place);
      return 0;
    });
    return list;
  }, [members, search, gender, bloodGroup, payment, sort]);

  // Paginate
  const totalPages   = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage     = Math.min(page, totalPages);
  const paginated    = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Stats
  const totalCount  = members.length;
  const femaleCount = members.filter((m) => m.gender === "Female").length;
  const paidCount   = members.filter((m) => m.paymentStatus === "completed").length;

  // Scroll to top on page change
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [safePage]);

  const skeletonCount = view === "grid" ? pageSize : Math.min(pageSize, 8);

  return (
    <div className="min-h-screen bg-gradient-hero overflow-hidden">

      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 animate-spin-slow"
          style={{ background: "radial-gradient(circle, #4EAEE5, transparent)" }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 animate-spin-slow"
          style={{ background: "radial-gradient(circle, #E91E8C, transparent)", animationDirection: "reverse" }} />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 px-4 pt-6 pb-4">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-usra-blue transition-colors mb-6">
            <FiArrowLeft size={16} /> Back to Home
          </button>

          <div className="flex flex-row sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-800 leading-tight">
                Our <span className="gradient-text">Members</span>
              </h1>
              <p className="text-gray-500 text-sm mt-1">USRA Membership Campaign 2026</p>
            </div>

            {/* View toggle */}
            <div className="flex items-center p-1 rounded-xl gap-1 self-start sm:self-auto"
              style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(78,174,229,0.15)" }}>
              {[["grid", FiGrid], ["list", FiList]].map(([v, Icon]) => (
                <button key={v} onClick={() => { setView(v); setPage(1); }}
                  className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200"
                  style={{
                    background: view === v ? "linear-gradient(135deg,#4EAEE5,#9B59B6)" : "transparent",
                    color: view === v ? "#fff" : "#9ca3af",
                  }}>
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-4 sm:mt-5">
            <StatPill icon={FiUsers}   value={totalCount}  label="Total Members"  color="#4EAEE5" loading={loading} />
            <StatPill icon={FiUsers}   value={femaleCount} label="Female Members" color="#E91E8C" loading={loading} />
            <StatPill icon={FiHeart}   value={paidCount}   label="Paid Members"   color="#22c55e" loading={loading} />
          </div>
        </div>
      </header>

      {/* ── Search + Filter bar ── */}
      <div className="relative z-10 px-4 py-4 sticky top-0"
        style={{ backdropFilter: "blur(16px)", background: "rgba(240,244,255,0.8)" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <FiSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="text" placeholder="Search by name, place, ID or phone…"
              value={search} onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium text-gray-800 outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.9)",
                border: "1.5px solid rgba(78,174,229,0.2)",
                boxShadow: "0 2px 12px rgba(78,174,229,0.08)",
              }} />
            {search && (
              <button onClick={() => handleSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <FiX size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {/* Desktop filters */}
            {[
              { label: "All Genders",      value: gender,     onChange: handleGender,
                options: [["All","All Genders"],["Male","Male"],["Female","Female"]], color: "#9B59B6" },
              { label: "All Blood Groups", value: bloodGroup, onChange: handleBloodGroup,
                options: [["All","All Blood Groups"], ...BLOOD_GROUPS.map((b) => [b, b])], color: "#E91E8C" },
              { label: "All Payments",     value: payment,    onChange: handlePayment,
                options: [["All","All Payments"],["completed","Paid"],["pending","Pending"]], color: "#22c55e" },
            ].map(({ label, value, onChange, options, color }) => (
              <div key={label} className="relative hidden sm:block">
                <select value={value} onChange={(e) => onChange(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-3 rounded-2xl text-sm font-semibold text-gray-700 outline-none cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    border: value !== "All" ? `1.5px solid ${color}` : "1.5px solid rgba(78,174,229,0.2)",
                  }}>
                  {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <FiChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            ))}

            {/* Sort */}
            <div className="relative hidden sm:block">
              <select value={sort} onChange={(e) => handleSort(e.target.value)}
                className="appearance-none pl-3 pr-8 py-3 rounded-2xl text-sm font-semibold text-gray-700 outline-none cursor-pointer"
                style={{ background: "rgba(255,255,255,0.9)", border: "1.5px solid rgba(78,174,229,0.2)" }}>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <FiChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Mobile filter button */}
            <button onClick={() => setFilterOpen((v) => !v)}
              className="sm:hidden relative flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all"
              style={{
                background: filterOpen ? "linear-gradient(135deg,#4EAEE5,#9B59B6)" : "rgba(255,255,255,0.9)",
                color: filterOpen ? "#fff" : "#374151",
                border: "1.5px solid rgba(78,174,229,0.2)",
              }}>
              <FiFilter size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-xs font-black flex items-center justify-center"
                  style={{ background: "#E91E8C" }}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button onClick={clearFilters}
                className="flex items-center gap-1 px-4 py-3 rounded-2xl text-sm font-bold text-red-400 hover:text-red-600 transition-colors"
                style={{ background: "rgba(255,255,255,0.9)", border: "1.5px solid rgba(233,30,140,0.2)" }}>
                <FiX size={14} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Mobile filter panel */}
        {filterOpen && (
          <div className="sm:hidden max-w-6xl mx-auto mt-3 grid grid-cols-2 gap-2">
            {[
              { label: "Gender",      value: gender,     onChange: handleGender,
                options: [["All","All Genders"],["Male","Male"],["Female","Female"]] },
              { label: "Blood Group", value: bloodGroup, onChange: handleBloodGroup,
                options: [["All","All Blood Groups"], ...BLOOD_GROUPS.map((b) => [b, b])] },
              { label: "Payment",     value: payment,    onChange: handlePayment,
                options: [["All","All Payments"],["completed","Paid"],["pending","Pending"]] },
            ].map(({ label, value, onChange, options }) => (
              <div key={label} className="relative">
                <select value={value} onChange={(e) => onChange(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-3 rounded-2xl text-sm font-semibold text-gray-700 outline-none"
                  style={{ background: "rgba(255,255,255,0.95)", border: "1.5px solid rgba(78,174,229,0.2)" }}>
                  {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <FiChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            ))}
            <div className="relative col-span-2">
              <select value={sort} onChange={(e) => handleSort(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-3 rounded-2xl text-sm font-semibold text-gray-700 outline-none"
                style={{ background: "rgba(255,255,255,0.95)", border: "1.5px solid rgba(78,174,229,0.2)" }}>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <FiChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* ── Results ── */}
      <main className="relative z-10 px-4 py-6 pb-20">
        <div className="max-w-6xl mx-auto">

          {/* Result count + sort indicator */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-gray-500">
              {loading
                ? <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-blue-300 border-t-blue-500 animate-spin inline-block" />
                    Loading members…
                  </span>
                : filtered.length === 0
                  ? "No members found"
                  : `${filtered.length} of ${totalCount} members`}
            </p>
            {!loading && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                {sort.includes("_asc") ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
                {SORT_OPTIONS.find((o) => o.value === sort)?.label}
              </div>
            )}
          </div>

          {/* Active filter chips */}
          {!loading && activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {gender !== "All" && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(155,89,182,0.12)", color: "#534AB7", border: "1px solid rgba(155,89,182,0.25)" }}>
                  {gender} <button onClick={() => handleGender("All")}><FiX size={10} /></button>
                </span>
              )}
              {bloodGroup !== "All" && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(233,30,140,0.1)", color: "#993556", border: "1px solid rgba(233,30,140,0.2)" }}>
                  {bloodGroup} <button onClick={() => handleBloodGroup("All")}><FiX size={10} /></button>
                </span>
              )}
              {payment !== "All" && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(34,197,94,0.1)", color: "#15803d", border: "1px solid rgba(34,197,94,0.2)" }}>
                  {payment === "completed" ? "Paid" : "Pending"}
                  <button onClick={() => handlePayment("All")}><FiX size={10} /></button>
                </span>
              )}
              {search && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(78,174,229,0.1)", color: "#185FA5", border: "1px solid rgba(78,174,229,0.2)" }}>
                  "{search}" <button onClick={() => handleSearch("")}><FiX size={10} /></button>
                </span>
              )}
            </div>
          )}

          {/* Skeleton loading */}
          {loading && view === "grid" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: skeletonCount }).map((_, i) => <SkeletonGrid key={i} />)}
            </div>
          )}
          {loading && view === "list" && (
            <div className="flex flex-col gap-2.5">
              {Array.from({ length: skeletonCount }).map((_, i) => <SkeletonList key={i} />)}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
                style={{ background: "rgba(78,174,229,0.1)" }}>
                <FiUsers size={36} style={{ color: "#4EAEE5" }} />
              </div>
              <p className="font-black text-gray-700 text-xl mb-2">No members found</p>
              <p className="text-gray-400 text-sm mb-6">Try adjusting your search or filters</p>
              <button onClick={clearFilters} className="btn-primary text-sm" style={{ padding: "10px 24px" }}>
                Clear all filters
              </button>
            </div>
          )}

          {/* Grid view */}
          {!loading && view === "grid" && paginated.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {paginated.map((m) => <MemberCardGrid key={m._id} member={m} />)}
            </div>
          )}

          {/* List view */}
          {!loading && view === "list" && paginated.length > 0 && (
            <div className="flex flex-col gap-2.5">
              {paginated.map((m) => <MemberCardList key={m._id} member={m} />)}
            </div>
          )}

          {/* Pagination */}
          {!loading && (
            <Pagination
              page={safePage}
              totalPages={totalPages}
              pageSize={pageSize}
              setPage={setPage}
              setPageSize={setPageSize}
              totalItems={filtered.length}
              visibleCount={paginated.length}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default MembersPage;