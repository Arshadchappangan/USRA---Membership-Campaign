import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
    FiLogIn, FiLogOut, FiUser, FiChevronDown,
    FiShield, FiUsers, FiMenu, FiX,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import usraRemovebg from '../assets/USRA-removebg.png';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ACCENT_PAIRS = [
    ["#4EAEE5", "#9B59B6"], ["#9B59B6", "#E91E8C"], ["#E91E8C", "#4EAEE5"],
    ["#4EAEE5", "#43B89C"], ["#F7971E", "#E91E8C"], ["#43B89C", "#9B59B6"],
];
const accentFor = (name = "") => ACCENT_PAIRS[name.length % ACCENT_PAIRS.length];
const initials = (name = "") =>
    name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

// ─── Avatar bubble ────────────────────────────────────────────────────────────
function UserAvatar({ user, size = 36 }) {
    const [from, to] = accentFor(user.name);
    return (
        <div
            className="flex items-center justify-center rounded-xl font-black text-white select-none overflow-hidden flex-shrink-0"
            style={{
                width: size, height: size,
                background: user.photo ? "transparent" : `linear-gradient(135deg,${from},${to})`,
                fontSize: size * 0.35,
                boxShadow: `0 2px 10px ${from}50`,
            }}
        >
            {user.photo
                ? <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                : initials(user.name)}
        </div>
    );
}

// ─── Dropdown menu (desktop) ──────────────────────────────────────────────────
function DropdownMenu({ user, onClose, onLogout }) {
    const navigate = useNavigate();
    const go = (path) => { onClose(); navigate(path); };

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <div
                className="absolute top-full right-0 mt-2 z-50 flex flex-col overflow-hidden"
                style={{
                    width: 240,
                    background: "rgba(255,255,255,0.97)",
                    backdropFilter: "blur(20px)",
                    borderRadius: 18,
                    border: "1.5px solid rgba(78,174,229,0.18)",
                    boxShadow: "0 16px 48px rgba(78,174,229,0.15), 0 4px 12px rgba(0,0,0,0.08)",
                    animation: "dropIn 0.18s cubic-bezier(0.34,1.56,0.64,1) both",
                }}
            >
                <style>{`@keyframes dropIn { from{opacity:0;transform:scale(0.92) translateY(-8px)} to{opacity:1;transform:scale(1) translateY(0)} }`}</style>

                <div className="px-4 py-3.5" style={{ borderBottom: "1px solid rgba(78,174,229,0.1)" }}>
                    <div className="flex items-center gap-3">
                        <UserAvatar user={user} size={40} />
                        <div className="min-w-0">
                            <p className="text-sm font-black text-gray-800 truncate">{user.name}</p>
                            <p className="text-[11px] font-mono text-gray-400 truncate">{user.memberId}</p>
                        </div>
                    </div>
                    <div className="mt-2.5">
                        <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                            style={user.role === "admin"
                                ? { background: "rgba(233,30,140,0.1)", color: "#993556", border: "1px solid rgba(233,30,140,0.2)" }
                                : { background: "rgba(78,174,229,0.1)", color: "#185FA5", border: "1px solid rgba(78,174,229,0.2)" }
                            }
                        >
                            {user.role === "admin" ? <FiShield size={9} /> : <FiUser size={9} />}
                            {user.role === "admin" ? "Admin" : "Member"}
                        </span>
                    </div>
                </div>

                <div className="py-1.5">
                    <MenuItem icon={FiUser} label="My Profile" onClick={() => go("/profile")} />
                    <MenuItem icon={FiUsers} label="Members" onClick={() => go("/members")} />
                    {user.role === "admin" && (
                        <MenuItem icon={FiShield} label="Admin Panel" onClick={() => go("/admin")} accent />
                    )}
                </div>

                <div className="py-1.5" style={{ borderTop: "1px solid rgba(78,174,229,0.1)" }}>
                    <button
                        onClick={() => { onClose(); onLogout(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors text-left"
                    >
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0"
                            style={{ background: "rgba(239,68,68,0.08)" }}>
                            <FiLogOut size={13} style={{ color: "#ef4444" }} />
                        </div>
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
}

function MenuItem({ icon: Icon, label, onClick, accent = false }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50 text-left"
            style={{ color: accent ? "#993556" : "#374151" }}
        >
            <div className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0"
                style={{ background: accent ? "rgba(233,30,140,0.07)" : "rgba(78,174,229,0.07)" }}>
                <Icon size={13} style={{ color: accent ? "#E91E8C" : "#4EAEE5" }} />
            </div>
            {label}
        </button>
    );
}

// ─── Mobile drawer ────────────────────────────────────────────────────────────
function MobileDrawer({ user, onClose, onLogout, location }) {
    const navigate = useNavigate();
    const go = (path) => { onClose(); navigate(path); };

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
            <div
                className="fixed top-16 left-0 right-0 z-50 flex flex-col overflow-hidden mx-3"
                style={{
                    background: "rgba(255,255,255,0.98)",
                    backdropFilter: "blur(20px)",
                    borderRadius: 18,
                    border: "1.5px solid rgba(78,174,229,0.18)",
                    boxShadow: "0 16px 48px rgba(78,174,229,0.15)",
                    animation: "slideDown 0.2s cubic-bezier(0.34,1.4,0.64,1) both",
                }}
            >
                <style>{`@keyframes slideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }`}</style>

                {/* Nav links */}
                <div className="p-3" style={{ borderBottom: "1px solid rgba(78,174,229,0.1)" }}>
                    <MobileNavLink
                        label="Home"
                        active={location.pathname === "/"}
                        onClick={() => go("/")}
                    />
                    <MobileNavLink
                        label="Members"
                        active={location.pathname === "/members"}
                        onClick={() => go("/members")}
                    />
                </div>

                {user ? (
                    <>
                        {/* User info */}
                        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(78,174,229,0.1)" }}>
                            <div className="flex items-center gap-3">
                                <UserAvatar user={user} size={40} />
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-gray-800 truncate">{user.name}</p>
                                    <p className="text-[11px] font-mono text-gray-400 truncate">{user.memberId}</p>
                                </div>
                                <span
                                    className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
                                    style={user.role === "admin"
                                        ? { background: "rgba(233,30,140,0.1)", color: "#993556", border: "1px solid rgba(233,30,140,0.2)" }
                                        : { background: "rgba(78,174,229,0.1)", color: "#185FA5", border: "1px solid rgba(78,174,229,0.2)" }
                                    }
                                >
                                    {user.role === "admin" ? <FiShield size={8} /> : <FiUser size={8} />}
                                    {user.role === "admin" ? "Admin" : "Member"}
                                </span>
                            </div>
                        </div>

                        {/* Profile actions */}
                        <div className="p-3">
                            <MenuItem icon={FiUser} label="My Profile" onClick={() => go("/profile")} />
                            {user.role === "admin" && (
                                <MenuItem icon={FiShield} label="Admin Panel" onClick={() => go("/admin")} accent />
                            )}
                        </div>

                        {/* Logout */}
                        <div className="p-3" style={{ borderTop: "1px solid rgba(78,174,229,0.1)" }}>
                            <button
                                onClick={() => { onClose(); onLogout(); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors rounded-xl text-left"
                            >
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0"
                                    style={{ background: "rgba(239,68,68,0.08)" }}>
                                    <FiLogOut size={13} style={{ color: "#ef4444" }} />
                                </div>
                                Sign Out
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="p-4">
                        <button
                            onClick={() => { onClose(); navigate("/login"); }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95"
                            style={{
                                background: "linear-gradient(135deg,#4EAEE5,#9B59B6)",
                                boxShadow: "0 4px 14px rgba(78,174,229,0.3)",
                            }}
                        >
                            <FiLogIn size={14} />
                            Sign In
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

function MobileNavLink({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all text-left"
            style={{
                background: active ? "rgba(78,174,229,0.1)" : "transparent",
                color: active ? "#185FA5" : "#6b7280",
            }}
        >
            {label}
        </button>
    );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar({ transparent = false }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);   // desktop dropdown
    const [drawerOpen, setDrawerOpen] = useState(false); // mobile drawer
    const [scrolled, setScrolled] = useState(false);

    // Close drawer on route change
    useEffect(() => { setDrawerOpen(false); setMenuOpen(false); }, [location.pathname]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        document.body.style.overflow = drawerOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [drawerOpen]);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-30 transition-all duration-300"
            style={{
                background: transparent && !scrolled
                    ? "transparent"
                    : "rgba(248,251,255,0.92)",
                backdropFilter: scrolled || !transparent ? "blur(16px)" : "none",
                borderBottom: scrolled
                    ? "1px solid rgba(78,174,229,0.15)"
                    : "1px solid transparent",
                boxShadow: scrolled ? "0 4px 20px rgba(78,174,229,0.08)" : "none",
            }}
        >
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
                    <img
                        src={usraRemovebg}
                        alt="USRA"
                        className="h-10 w-10 sm:h-12 sm:w-12 object-contain drop-shadow-lg flex-shrink-0"
                    />
                    <div className="hidden xs:block min-w-0">
                        <h1 className="text-lg sm:text-xl font-black text-gray-800 tracking-tight leading-tight">USRA</h1>
                        <p className="text-[10px] sm:text-xs text-gray-500 font-medium hidden sm:block truncate">
                            United Service for Relational Amalgamation
                        </p>
                    </div>
                </Link>

                {/* Desktop nav links */}
                <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
                    <NavLink to="/" label="Home" active={location.pathname === "/"} />
                    <NavLink to="/members" label="Members" active={location.pathname === "/members"} />
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2 flex-shrink-0">

                    {/* Desktop: avatar + dropdown */}
                    {user ? (
                        <div className="relative hidden md:block">
                            <button
                                onClick={() => setMenuOpen((v) => !v)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-2xl transition-all duration-150 hover:bg-white/60 active:scale-95"
                                style={{ border: "1.5px solid rgba(78,174,229,0.18)" }}
                            >
                                <UserAvatar user={user} size={32} />
                                <span className="hidden sm:inline text-sm font-bold text-gray-700 max-w-[100px] truncate">
                                    {user.name.split(" ")[0]}
                                </span>
                                <FiChevronDown
                                    size={13}
                                    className="transition-transform duration-200"
                                    style={{ transform: menuOpen ? "rotate(180deg)" : "none", color: "#9ca3af" }}
                                />
                            </button>
                            {menuOpen && (
                                <DropdownMenu
                                    user={user}
                                    onClose={() => setMenuOpen(false)}
                                    onLogout={handleLogout}
                                />
                            )}
                        </div>
                    ) : (
                        /* Desktop: sign in button */
                        <button
                            onClick={() => navigate("/login")}
                            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold text-white transition-all duration-150 hover:opacity-90 active:scale-95"
                            style={{
                                background: "linear-gradient(135deg,#4EAEE5,#9B59B6)",
                                boxShadow: "0 4px 14px rgba(78,174,229,0.3)",
                            }}
                        >
                            <FiLogIn size={14} />
                            <span>Sign In</span>
                        </button>
                    )}

                    {/* Mobile: avatar (if logged in) + hamburger */}
                    <div className="flex items-center gap-2 md:hidden">
                        {user && (
                            <UserAvatar user={user} size={32} />
                        )}
                        <button
                            onClick={() => setDrawerOpen((v) => !v)}
                            className="flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-95"
                            style={{
                                background: drawerOpen ? "rgba(78,174,229,0.12)" : "rgba(78,174,229,0.06)",
                                border: "1.5px solid rgba(78,174,229,0.18)",
                                color: "#4EAEE5",
                            }}
                            aria-label="Toggle menu"
                            aria-expanded={drawerOpen}
                        >
                            {drawerOpen ? <FiX size={18} /> : <FiMenu size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile drawer */}
            {drawerOpen && (
                <MobileDrawer
                    user={user}
                    onClose={() => setDrawerOpen(false)}
                    onLogout={handleLogout}
                    location={location}
                />
            )}
        </nav>
    );
}

function NavLink({ to, label, active }) {
    return (
        <Link
            to={to}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150"
            style={{
                background: active ? "rgba(78,174,229,0.1)" : "transparent",
                color: active ? "#185FA5" : "#6b7280",
            }}
        >
            {label}
        </Link>
    );
}