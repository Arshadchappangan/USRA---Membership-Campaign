import React, { use, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiUsers, FiHeart, FiStar } from 'react-icons/fi';
import { Countdown } from '../components/CountDown';
import { MembersMarquee } from '../components/Membersmarquee';
import usraLogo from '../assets/usra-logo.png';
import usraRemovebg from '../assets/USRA-removebg.png';
import { getMembers } from '../utils/api';

const features = [
  { icon: FiUsers, title: 'Community', desc: 'Connecting passionate individuals who care about making a difference', color: 'from-blue-400 to-blue-600' },
  { icon: FiHeart, title: 'Care', desc: 'Building stronger relationships together', color: 'from-pink-400 to-rose-600' },
  { icon: FiStar, title: 'Excellence', desc: 'Committed to service and excellence', color: 'from-purple-400 to-purple-600' },
];



const LandingPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await getMembers(1, 20);
        console.log('Fetched members:', response);
        setMembers(response.data);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };

    fetchMembers();
  }, []);


  return (
    <div className="min-h-screen bg-gradient-hero overflow-hidden">
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 animate-spin-slow"
          style={{ background: 'radial-gradient(circle, #4EAEE5, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 animate-spin-slow"
          style={{ background: 'radial-gradient(circle, #E91E8C, transparent)', animationDirection: 'reverse' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10 animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, #9B59B6, transparent)' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={usraRemovebg} alt="USRA" className="h-12 w-12 object-contain drop-shadow-lg" />
            <div>
              <h1 className="text-xl font-black text-gray-800 tracking-tight">USRA</h1>
              <p className="text-xs text-gray-500 font-medium">United Service for Relational Amalgamation</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/register')}
            className="hidden sm:flex btn-primary items-center gap-2 text-sm"
            style={{ padding: '10px 20px' }}
          >
            Join Now <FiArrowRight />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 px-4 pt-8 pb-16 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Campaign Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{ background: 'linear-gradient(135deg, rgba(78,174,229,0.15), rgba(155,89,182,0.15))', border: '1px solid rgba(78,174,229,0.3)', color: '#4EAEE5' }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Membership Campaign 2026
          </div>

          {/* Logo hero */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-full animate-pulse-slow opacity-30"
                style={{ background: 'radial-gradient(circle, #4EAEE5, transparent)', transform: 'scale(1.5)' }} />
              <img
                src={usraRemovebg}
                alt="USRA"
                className="relative w-32 h-32 sm:w-44 sm:h-44 object-contain drop-shadow-2xl animate-float"
              />
            </div>
          </div>


          <h2 className="text-3xl sm:text-5xl font-black text-gray-800 mb-4 leading-tight">
            USRA Membership
            <br />
            <span className="gradient-text">Campaign 2026</span>
          </h2>

          <div className="text-md font-semibold text-usra-blue mb-6">
            May 01 - 15, 2026
          </div>

          <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Be part of something bigger. Join the USRA community and strengthen bonds that last a lifetime.
            <br />
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="btn-primary flex items-center justify-center gap-3 text-lg group"
            >
              <span>Register Now</span>
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold hover:border-usra-blue hover:text-usra-blue transition-all duration-300 bg-white/80"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 flex justify-center">
        <Countdown />
      </section>


      {/* Stats */}
      <section className="relative z-10 px-4 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: members.length, label: 'Members' },
            { value: '2026', label: 'Campaign Year' },
            { value: '₹100', label: 'Membership Fee' },
            { value: '15 Days', label: 'Campaign Duration' },
          ].map((stat, i) => (
          <div key={i} className="glass rounded-2xl p-5 text-center card-hover shadow-card">
            <div className="text-3xl font-black gradient-text mb-1">{stat.value}</div>
            <div className="text-sm text-gray-500 font-semibold">{stat.label}</div>
          </div>
          ))}
        </div>
      </section>

      {/* ── Members Marquee ── */}
      <MembersMarquee members={members} />


      {/* Features */}
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

      {/* How it works */}
      <section className="relative z-10 px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-black text-gray-800 mb-4">How to <span className="gradient-text">Register</span></h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Fill Details', desc: 'Enter your personal information' },
              { step: '02', title: 'Upload Photo', desc: 'Add and crop your profile photo' },
              { step: '03', title: 'Pay ₹100', desc: 'Secure payment via Razorpay' },
              { step: '04', title: 'Get Poster', desc: 'Download your campaign poster' },
            ].map((item, i) => (
              <div key={i} className="relative glass rounded-2xl p-6 card-hover shadow-card">
                <div className="text-5xl font-black opacity-10 text-usra-blue absolute top-4 right-4">{item.step}</div>
                <div className="text-2xl font-black gradient-text mb-2">{item.step}</div>
                <h4 className="font-bold text-gray-800 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative z-10 px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl p-10 text-center text-white overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, #4EAEE5 0%, #9B59B6 50%, #E91E8C 100%)' }}>
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="relative">
              <h3 className="text-3xl font-black mb-4">Ready to Join?</h3>
              <p className="text-white/80 mb-8 text-lg">Registration is open from May 01 - 15, 2026</p>
              <button
                onClick={() => navigate('/register')}
                className="bg-white text-usra-purple font-black text-lg px-10 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                Start Registration →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 px-4 text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src={usraRemovebg} alt="USRA" className="w-6 h-6 object-contain" />
          <span className="font-bold text-gray-700">USRA</span>
        </div>
        <p>United Service for Relational Amalgamation © 2026</p>
        <p className="text-xs mt-1 text-gray-400">Membership Campaign • May 01 - 15, 2026</p>
      </footer>
    </div>
  );
};

export default LandingPage;
