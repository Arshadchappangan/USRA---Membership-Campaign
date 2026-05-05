import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiUsers, FiHeart, FiStar, FiBook, FiAlertCircle } from 'react-icons/fi';
import { Countdown } from '../components/CountDown';
import { MembersMarquee } from '../components/Membersmarquee';
import { LoadingScreen } from '../components/LoadingScreen';
import usraRemovebg from '../assets/USRA-removebg.png';
import { getMembers } from '../utils/api';
import Navbar from '../components/Navbar';

// ─── Campaign config ──────────────────────────────────────────────────────────
// Single source of truth — change here and everything updates.
const CAMPAIGN = {
  name: 'USRA',
  // FIX: Use canonical full name consistently (check your logo asset too)
  fullName: 'United Service for Relational Amalgamation',
  year: 2026,
  // FIX: Membership fee extracted to constant
  membershipFee: '₹100',
  startDate: new Date('2026-05-01T00:00:00'),
  endDate: new Date('2026-05-15T23:59:59'),
  dateLabel: 'May 01 – 15, 2026',
};

// ─── Computed helpers ─────────────────────────────────────────────────────────
function getCampaignStatus() {
  const now = new Date();
  if (now < CAMPAIGN.startDate) return 'upcoming';
  if (now > CAMPAIGN.endDate) return 'closed';
  return 'open';
}

// ─── Features — FIX: Actual objectives from the constitution (Section 3) ─────
const features = [
  {
    icon: FiUsers,
    title: 'Family bonds',
    desc: 'Strengthening relationships within our extended family network across generations.',
    color: 'from-blue-400 to-blue-600',
  },
  {
    icon: FiBook,
    title: 'Education & growth',
    desc: 'Supporting members with academic progress, cultural events, and literary gatherings.',
    color: 'from-purple-400 to-purple-600',
  },
  {
    icon: FiHeart,
    title: 'Care & support',
    desc: 'Emergency financial aid, and backing women-led entrepreneurship within the community.',
    color: 'from-pink-400 to-rose-600',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  // FIX: Separate member data, total count, error, and loading states
  const [members, setMembers] = useState([]);
  const [membersTotal, setMembersTotal] = useState(null); // null = not yet known
  const [membersError, setMembersError] = useState(false);
  const [membersLoading, setMembersLoading] = useState(true);

  // FIX: Computed campaign status — drives CTA behaviour
  const campaignStatus = getCampaignStatus();
  const isOpen = campaignStatus === 'open';

  // ── Intersection observer — FIX: runs after members load so marquee reveals work
  useEffect(() => {
    if (membersLoading) return; // wait until member data has settled

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('animate-slide-up');
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [membersLoading]); // re-runs once members have loaded

  // ── Member fetch — FIX: error state, graceful degradation, real total count
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await getMembers(1, 20);
        setMembers(response.data ?? []);
        setMembersTotal(
          response.total ??
          response.count ??
          response.meta?.total ??
          response.data?.length ??
          0
        );
      } catch (error) {
        console.error('Error fetching members:', error);
        setMembersError(true);
        // Page still renders — members are progressive enhancement only
      } finally {
        setMembersLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // FIX: NO top-level loading gate. Page renders immediately.
  // Only member-dependent sections show skeletons/fallbacks.

  // ── CTA handler — FIX: respects campaign open/closed window
  const handleRegisterClick = () => {
    if (isOpen) {
      navigate('/register');
    }
    // Closed / upcoming: button is disabled, so this won't fire.
    // You could also navigate to a waitlist page here if desired.
  };

  // ── CTA label based on campaign status
  const ctaLabel = {
    upcoming: 'Registration not yet open',
    open: 'Register Now',
    closed: 'Registration closed',
  }[campaignStatus];

  return (
    <div className="min-h-screen bg-gradient-hero overflow-hidden">
      <Navbar transparent={true} />

      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 animate-spin-slow"
          style={{ background: 'radial-gradient(circle, #4EAEE5, transparent)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 animate-spin-slow"
          style={{ background: 'radial-gradient(circle, #E91E8C, transparent)', animationDirection: 'reverse' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10 animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, #9B59B6, transparent)' }}
        />
      </div>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative z-10 px-4 pt-24 pb-16 text-center">
        <div className="max-w-4xl mx-auto">

          {/* Campaign badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(78,174,229,0.15), rgba(155,89,182,0.15))',
              border: '1px solid rgba(78,174,229,0.3)',
              color: '#4EAEE5',
            }}
          >
            <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            Membership Campaign {CAMPAIGN.year}
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full animate-pulse-slow opacity-30"
                style={{ background: 'radial-gradient(circle, #4EAEE5, transparent)', transform: 'scale(1.5)' }}
              />
              <img
                src={usraRemovebg}
                alt={CAMPAIGN.name}
                className="relative w-32 h-32 sm:w-44 sm:h-44 object-contain drop-shadow-2xl animate-float"
              />
            </div>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-gray-800 mb-4 leading-tight">
            {CAMPAIGN.name} Membership
            <br />
            <span className="gradient-text">Campaign {CAMPAIGN.year}</span>
          </h2>

          <div className="text-md font-semibold text-usra-blue mb-6">{CAMPAIGN.dateLabel}</div>

          <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Be part of something bigger. Join the USRA community and strengthen bonds that last a lifetime.
          </p>

          {/* FIX: CTA buttons respect campaign open/closed status */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRegisterClick}
              disabled={!isOpen}
              className={`btn-primary flex items-center justify-center gap-3 text-lg group transition-all duration-300 ${
                !isOpen ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title={!isOpen ? ctaLabel : undefined}
            >
              <span>{ctaLabel}</span>
              {isOpen && (
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              )}
            </button>

            <button
              onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold hover:border-usra-blue hover:text-usra-blue transition-all duration-300 bg-white/80"
            >
              Learn More
            </button>
          </div>

          {/* FIX: Show closed notice when campaign has ended */}
          {campaignStatus === 'closed' && (
            <p className="mt-4 text-sm text-gray-400">
              This campaign has ended. Stay tuned for the next one.
            </p>
          )}
          {campaignStatus === 'upcoming' && (
            <p className="mt-4 text-sm text-gray-400">
              Registration opens on {CAMPAIGN.startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
            </p>
          )}
        </div>
      </section>

      {/* Countdown */}
      <section className="relative z-10 px-4 flex justify-center">
        <Countdown />
      </section>

      {/* ── Stats ── */}
      <section className="relative z-10 px-4 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              // FIX: Shows real total (not page-1 length), '...' while loading, '—' on error
              value: membersLoading ? '...' : membersError ? '—' : (membersTotal ?? '—'),
              label: 'Members',
            },
            { value: CAMPAIGN.year, label: 'Campaign Year' },
            { value: CAMPAIGN.membershipFee, label: 'Membership Fee' },
            { value: '15 Days', label: 'Campaign Duration' },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-2xl p-5 text-center card-hover shadow-card">
              <div className="text-3xl font-black gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500 font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Members Marquee — FIX: only renders when data exists, degrades gracefully ── */}
      {membersLoading && (
        <div className="relative z-10 px-4 py-4">
          <div className="h-16 animate-pulse bg-white/30 rounded-2xl mx-auto max-w-4xl" />
        </div>
      )}
      {!membersLoading && !membersError && members.length > 0 && (
        <MembersMarquee members={members} />
      )}
      {!membersLoading && membersError && (
        <div className="relative z-10 px-4 py-3 text-center">
          <span className="inline-flex items-center gap-2 text-sm text-gray-400">
            <FiAlertCircle className="w-4 h-4" />
            Member list temporarily unavailable
          </span>
        </div>
      )}

      {/* ── Features — FIX: actual objectives from constitution Section 3 ── */}
      <section id="about" className="relative z-10 px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-black text-gray-800 mb-4">
              Why Join <span className="gradient-text">USRA?</span>
            </h3>
            <p className="text-gray-500 text-lg">Building bridges, creating communities</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="glass rounded-3xl p-8 card-hover shadow-card text-center">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-5 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h4>
                  <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How to register ── */}
      <section className="relative z-10 px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-black text-gray-800 mb-4">
              How to <span className="gradient-text">Register</span>
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Fill Details', desc: 'Enter your personal information' },
              { step: '02', title: 'Upload Photo', desc: 'Add and crop your profile photo' },
              // FIX: Fee uses the constant
              { step: '03', title: `Pay ${CAMPAIGN.membershipFee}`, desc: 'Secure payment via Razorpay' },
              { step: '04', title: 'Get Poster', desc: 'Download your campaign poster' },
            ].map((item, i) => (
              <div key={i} className="relative glass rounded-2xl p-6 card-hover shadow-card">
                <div className="text-5xl font-black opacity-10 text-usra-blue absolute top-4 right-4">
                  {item.step}
                </div>
                <div className="text-2xl font-black gradient-text mb-2">{item.step}</div>
                <h4 className="font-bold text-gray-800 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner — FIX: disabled when campaign is not open ── */}
      <section className="relative z-10 px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-3xl p-10 text-center text-white overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, #4EAEE5 0%, #9B59B6 50%, #E91E8C 100%)' }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            <div className="relative">
              <h3 className="text-3xl font-black mb-4">
                {isOpen ? 'Ready to Join?' : campaignStatus === 'closed' ? 'Campaign Ended' : 'Coming Soon'}
              </h3>
              <p className="text-white/80 mb-8 text-lg">
                {isOpen
                  ? `Registration is open from ${CAMPAIGN.dateLabel}`
                  : campaignStatus === 'closed'
                  ? 'Thank you to everyone who registered this year.'
                  : `Registration opens ${CAMPAIGN.dateLabel}`}
              </p>
              <button
                onClick={handleRegisterClick}
                disabled={!isOpen}
                className={`bg-white text-usra-purple font-black text-lg px-10 py-4 rounded-2xl transition-all duration-300 ${
                  isOpen
                    ? 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                {isOpen ? 'Start Registration →' : ctaLabel}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer — FIX: canonical name from constant ── */}
      <footer className="relative z-10 text-center py-8 px-4 text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src={usraRemovebg} alt={CAMPAIGN.name} className="w-6 h-6 object-contain" />
          <span className="font-bold text-gray-700">{CAMPAIGN.name}</span>
        </div>
        <p>{CAMPAIGN.fullName} © {CAMPAIGN.year}</p>
        <p className="text-xs mt-1 text-gray-400">
          Membership Campaign • {CAMPAIGN.dateLabel}
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;