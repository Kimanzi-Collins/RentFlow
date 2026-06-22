import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight, Building2, TrendingUp, Users, Wrench,
  FileText, BarChart3, Bell, Shield, CheckCircle2,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// ── Data ──────────────────────────────────────────────────────────────────

const STATS = [
  { value: 120,  suffix: '+', label: 'Landlords'        },
  { value: 3200, suffix: '+', label: 'Units Managed'    },
  { value: 98,   suffix: '%', label: 'Collection Rate'  },
  { value: 2.4,  suffix: 'B', label: 'KES Processed',   prefix: '' },
];

const TICKER_ITEMS = [
  'Property Management',
  'Automated Rent Collection',
  'Tenant Records',
  'Maintenance Tracking',
  'Financial Reports',
  'KES Portfolio Analytics',
  'M-PESA Integration',
  'Real-time Dashboards',
];

const FEATURES = [
  { icon: TrendingUp, label: 'Automated Rent Collection',  desc: 'M-PESA, bank transfers, and cash — all in one place.' },
  { icon: BarChart3,  label: 'Real-time Financials',        desc: 'Live revenue charts, collection rates, and forecasts.' },
  { icon: Users,      label: 'Tenant Management',           desc: 'Full lifecycle from onboarding through lease renewal.' },
  { icon: Wrench,     label: 'Maintenance Tracking',        desc: 'Log, assign, and resolve requests with one click.'     },
  { icon: FileText,   label: 'Lease Management',            desc: 'Digital leases, renewals, and document storage.'       },
  { icon: BarChart3,  label: 'Analytics & Reporting',       desc: 'Export PDF reports for any date range or property.'    },
  { icon: Bell,       label: 'Smart Notifications',         desc: 'Automated reminders for overdue rent and renewals.'    },
  { icon: Shield,     label: 'Secure Data Storage',         desc: 'Bank-grade encryption on all tenant and financial data.'},
];

const PORTFOLIOS = [
  { img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80', title: 'SOJAG Head Office',  type: 'Commercial Management' },
  { img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80',   title: 'Serra Apartments', type: 'Residential Management' },
  { img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80', title: 'LSU Logistics',     type: 'Industrial Management' },
];

// ── Component ─────────────────────────────────────────────────────────────

export const Landing: React.FC = () => {
  const navigate  = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  // Sticky nav backdrop
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useGSAP(() => {
    // Hero text reveal
    gsap.to('.hero-title-inner', {
      y: 0, duration: 1.3, stagger: 0.12, ease: 'power4.out', delay: 0.3,
    });
    gsap.fromTo('.hero-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.9 });
    gsap.fromTo('.hero-btn', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 1.1 });

    // Hero parallax
    gsap.to('.hero-bg', {
      scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: true },
      y: 180, scale: 1.06,
    });

    // Stat counters
    gsap.utils.toArray<HTMLElement>('.stat-num').forEach(el => {
      const target = parseFloat(el.getAttribute('data-target') || '0');
      const isDecimal = target % 1 !== 0;
      gsap.fromTo(el,
        { textContent: '0' },
        {
          scrollTrigger: { trigger: el, start: 'top 88%' },
          textContent: target,
          duration: 2.2,
          ease: 'power2.out',
          snap: isDecimal ? {} : { textContent: 1 },
          onUpdate() {
            const v = parseFloat(el.textContent || '0');
            el.textContent = isDecimal ? v.toFixed(1) : Math.round(v).toLocaleString();
          },
        }
      );
    });

    // Scroll text reveals
    gsap.utils.toArray<HTMLElement>('.scroll-reveal').forEach(el => {
      const inner = el.querySelectorAll('.scroll-reveal-inner');
      gsap.fromTo(inner,
        { y: '105%' },
        { scrollTrigger: { trigger: el, start: 'top 85%' }, y: '0%', duration: 1.2, ease: 'power4.out', stagger: 0.1 }
      );
    });

    // Image reveals
    gsap.utils.toArray<HTMLElement>('.img-reveal').forEach(el => {
      gsap.to(el, {
        scrollTrigger: { trigger: el, start: 'top 80%' },
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        duration: 1.5, ease: 'power3.inOut',
      });
      const img = el.querySelector('img');
      if (img) gsap.fromTo(img, { scale: 1.18 }, { scrollTrigger: { trigger: el, start: 'top 80%' }, scale: 1, duration: 1.5, ease: 'power3.inOut' });
    });

    // Feature cards stagger
    gsap.fromTo('.feature-card',
      { opacity: 0, y: 24 },
      { scrollTrigger: { trigger: '.features-grid', start: 'top 80%' }, opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: 'power3.out' }
    );

    // Portfolio items
    gsap.fromTo('.portfolio-item',
      { opacity: 0, y: 32 },
      { scrollTrigger: { trigger: '.portfolio-grid', start: 'top 80%' }, opacity: 1, y: 0, duration: 0.65, stagger: 0.12, ease: 'power3.out' }
    );

  }, { scope: containerRef });

  const tickerLine = [...TICKER_ITEMS, ...TICKER_ITEMS]; // duplicate for seamless loop

  return (
    <div ref={containerRef} className="w-full bg-[#f6f6f4] text-[#1c1c1c]" style={{ overflowX: 'hidden' }}>

      {/* ── Sticky Navbar ── */}
      <nav className={`landing-nav flex items-center justify-between px-8 md:px-16 py-6 ${scrolled ? 'scrolled' : ''}`}>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 font-sans font-bold text-lg tracking-tight uppercase"
          style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Building2 size={22} />
          RENTFLOW
        </button>
        <div className="flex items-center gap-8">
          <span className="hidden md:block font-medium text-sm cursor-pointer text-white/70 hover:text-white transition">Support</span>
          <span className="hidden md:block font-medium text-sm cursor-pointer text-white/70 hover:text-white transition">Features</span>
          <button
            type="button"
            className="vista-btn !bg-transparent !text-white !border-white/40 hover:!bg-white hover:!text-[#1c1c1c] text-sm"
            onClick={() => navigate('/sign-in')}
          >
            Sign In <ArrowRight size={15} />
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-section relative w-full min-h-screen overflow-hidden flex flex-col justify-end">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            className="hero-bg w-full h-full object-cover origin-bottom"
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80"
            alt="Corporate skyline"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.1) 100%)' }} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 px-8 md:px-16 pb-28 md:pb-40">
          <p className="hero-sub text-white/60 text-sm font-sans font-semibold uppercase tracking-widest mb-6" style={{ opacity: 0 }}>
            Property Management Platform · Kenya
          </p>
          <h1 className="font-sans font-black text-white max-w-5xl" style={{ fontSize: 'clamp(48px, 8vw, 110px)', lineHeight: 1, letterSpacing: '-0.03em', margin: '0 0 40px' }}>
            <div className="clip-text"><span className="hero-title-inner block" style={{ transform: 'translateY(110%)' }}>A <em className="font-serif font-normal not-italic" style={{ fontStyle: 'italic' }}>trusted</em></span></div>
            <div className="clip-text"><span className="hero-title-inner block" style={{ transform: 'translateY(110%)' }}>property partner</span></div>
          </h1>
          <div className="hero-btn flex flex-wrap gap-4" style={{ opacity: 0 }}>
            <button type="button" className="vista-btn-dark" onClick={() => navigate('/sign-in')}>
              Open Dashboard <ArrowRight size={16} />
            </button>
            <button type="button" className="vista-btn !text-white !border-white/40 hover:!bg-white hover:!text-[#1c1c1c]" onClick={() => navigate('/sign-in')}>
              Request Demo
            </button>
          </div>
        </div>

        {/* Bottom stat strip */}
        <div className="relative z-10 border-t border-white/10" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {STATS.map((s, i) => (
              <div key={i} className="px-8 py-6 text-white text-center">
                <div className="font-black text-white" style={{ fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1, letterSpacing: '-0.03em' }}>
                  <span className="stat-num" data-target={s.value}>0</span>{s.suffix}
                </div>
                <div className="text-white/50 text-xs font-semibold uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marquee Ticker ── */}
      <div className="py-5 border-y border-[#e2e2df] bg-[#f6f6f4] overflow-hidden">
        <div className="marquee-track">
          {tickerLine.map((item, i) => (
            <span key={i} className="flex items-center gap-6 px-6 text-[13px] font-semibold text-[#6b6b6b] uppercase tracking-wider whitespace-nowrap">
              {item}
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#c8c8c5', display: 'inline-block', flexShrink: 0 }} />
            </span>
          ))}
        </div>
      </div>

      {/* ── Intro ── */}
      <section className="py-24 md:py-36 px-8 md:px-16 max-w-5xl">
        <p className="font-sans font-light text-[#1c1c1c]" style={{ fontSize: 'clamp(20px, 3vw, 32px)', lineHeight: 1.7 }}>
          RentFlow is a premium property management platform designed to automate your portfolio.
          Built for modern Kenyan landlords, it manages{' '}
          <span className="font-serif italic font-medium">thousands of units</span> across industrial,
          commercial, and multi-residential properties — with M-PESA–native payment collection built in.
        </p>
      </section>

      {/* ── Full-width Image ── */}
      <section className="px-8 md:px-16 pb-32">
        <div
          className="w-full overflow-hidden img-reveal relative"
          style={{ height: 'clamp(320px, 60vh, 700px)', clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)', borderRadius: 24 }}
        >
          <img
            className="w-full h-full object-cover"
            style={{ transform: 'scale(1.18)' }}
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"
            alt="Modern office"
          />
          {/* Overlay label */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)' }}>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Platform Preview</p>
            <p className="text-white text-xl font-semibold mt-1">Multi-property portfolio management</p>
          </div>
        </div>
      </section>

      {/* ── Split Section 1 ── */}
      <section className="py-24 px-8 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-28 items-center">
        <div className="order-2 md:order-1">
          <div className="overflow-hidden img-reveal relative" style={{ aspectRatio: '4/5', borderRadius: 20, clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}>
            <img className="w-full h-full object-cover" style={{ transform: 'scale(1.18)' }}
              src="https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80" alt="Architecture" />
          </div>
        </div>
        <div className="order-1 md:order-2">
          <p className="text-xs font-bold uppercase tracking-widest text-[#9b9b9b] mb-6">Our Approach</p>
          <h2 className="scroll-reveal clip-text" style={{ fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.1, marginBottom: 24 }}>
            <span className="scroll-reveal-inner block font-sans font-black">Automating with</span>
            <span className="scroll-reveal-inner block font-serif italic text-[#6b6b6b]">precision</span>
          </h2>
          <p className="text-lg text-[#6b6b6b] leading-relaxed mb-8">
            We've watched the Kenyan real estate market evolve — and built our software around it.
            From M-PESA rent collection to automated statement generation, every feature removes
            friction from your management workflow.
          </p>
          <div className="flex flex-col gap-3 mb-10">
            {['Automated M-PESA & bank reconciliation', 'PDF statements generated on demand', 'Multi-property dashboard in one view'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
                <span className="text-[15px] font-medium text-[#3b3b3b]">{f}</span>
              </div>
            ))}
          </div>
          <button type="button" className="vista-btn" onClick={() => navigate('/sign-in')}>
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Split Section 2 ── */}
      <section className="py-24 px-8 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-28 items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#9b9b9b] mb-6">Why RentFlow</p>
          <h2 className="scroll-reveal clip-text" style={{ fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.1, marginBottom: 24 }}>
            <span className="scroll-reveal-inner block font-sans font-black">Delivering on</span>
            <span className="scroll-reveal-inner block font-serif italic text-[#6b6b6b]">details</span>
          </h2>
          <p className="text-lg text-[#6b6b6b] leading-relaxed mb-8">
            We thrive on solving complex management problems. Our vertically integrated platform drives
            your portfolio through every stage of the rental lifecycle — blending rich financial
            insights with an extensive tenant tracking network.
          </p>
          <button type="button" className="vista-btn" onClick={() => navigate('/sign-in')}>
            Sign In <ArrowRight size={16} />
          </button>
        </div>
        <div>
          <div className="overflow-hidden img-reveal relative" style={{ aspectRatio: '4/5', borderRadius: 20, clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}>
            <img className="w-full h-full object-cover" style={{ transform: 'scale(1.18)' }}
              src="https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80" alt="Interior" />
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-32 px-8 md:px-16 bg-white border-y border-[#e2e2df]">
        <div className="max-w-4xl mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-[#9b9b9b] mb-4">Platform Features</p>
          <h2 className="font-sans font-black text-[#1c1c1c]" style={{ fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.15, margin: 0 }}>
            Every tool you need — nothing you don't.
          </h2>
        </div>
        <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-[#e2e2df]">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="feature-card p-8 border-b border-r border-[#e2e2df] hover:bg-[#f6f6f4] transition-colors duration-300 cursor-default"
              style={{ opacity: 0 }}
            >
              <div className="mb-5 w-10 h-10 rounded-xl bg-[#f0f0ee] flex items-center justify-center">
                <f.icon size={18} color="#1c1c1c" />
              </div>
              <p className="font-semibold text-[15px] text-[#1c1c1c] mb-2">{f.label}</p>
              <p className="text-[13px] text-[#8b8b8b] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Portfolio Showcase ── */}
      <section className="py-32 px-8 md:px-16">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
          <h2 className="font-sans font-black text-[#1c1c1c]" style={{ fontSize: 'clamp(32px, 5vw, 48px)', margin: 0 }}>
            Showcase Portfolios
          </h2>
          <button type="button" className="vista-btn" onClick={() => navigate('/sign-in')}>
            View Dashboard <ArrowRight size={15} />
          </button>
        </div>
        <div className="portfolio-grid grid grid-cols-1 md:grid-cols-3 gap-6">
          {PORTFOLIOS.map((p, i) => (
            <div key={i} className="portfolio-item group cursor-pointer" style={{ opacity: 0 }}>
              <div className="overflow-hidden mb-4 relative" style={{ aspectRatio: '4/3', borderRadius: 16 }}>
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={p.img} alt={p.title}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
              </div>
              <p className="text-[12px] text-[#9b9b9b] uppercase tracking-widest font-semibold mb-1">{p.type}</p>
              <h4 className="text-[18px] font-semibold">{p.title}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative py-40 px-8 md:px-16 overflow-hidden" style={{ background: '#1c1c1c' }}>
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)', borderRadius: '50%' }}
        />
        <div className="relative z-10">
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-6">Get Started</p>
          <h2 className="scroll-reveal clip-text text-white" style={{ fontSize: 'clamp(48px, 8vw, 96px)', lineHeight: 1.05, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 32, maxWidth: 900 }}>
            <span className="scroll-reveal-inner block">Manage your</span>
            <span className="scroll-reveal-inner block font-serif italic font-normal">— ideal portfolio</span>
          </h2>
          <p className="text-white/50 text-xl mb-10 max-w-xl leading-relaxed">
            Join 120+ property managers who have moved their portfolios to RentFlow.
          </p>
          <div className="flex flex-wrap gap-4">
            <button type="button" className="vista-btn-dark !bg-white !text-[#1c1c1c] !border-white hover:!bg-transparent hover:!text-white" onClick={() => navigate('/sign-in')}>
              Sign In <ArrowRight size={16} />
            </button>
            <button type="button" className="vista-btn !text-white !border-white/30 hover:!bg-white hover:!text-[#1c1c1c]" onClick={() => navigate('/sign-in')}>
              Create Account <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0f0f0f] text-white pt-20 pb-8 px-8 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-20">
          <div className="md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2 font-sans font-bold text-base uppercase tracking-tight">
              <Building2 size={20} /> RENTFLOW
            </div>
            <p className="text-[#a1a1a6] text-sm leading-relaxed">
              The modern property management platform for Kenya.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-5">Platform</h4>
            <ul className="flex flex-col gap-3 text-[#a1a1a6] text-sm">
              <li><button type="button" onClick={() => navigate('/sign-in')} className="hover:text-white transition text-left" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit' }}>Sign In</button></li>
              <li><button type="button" onClick={() => navigate('/sign-in')} className="hover:text-white transition text-left" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit' }}>Get Started</button></li>
              <li><button type="button" className="hover:text-white transition text-left" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit' }}>Features</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-5">Legal</h4>
            <ul className="flex flex-col gap-3 text-[#a1a1a6] text-sm">
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms & Conditions</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-5">Get in Touch</h4>
            <ul className="flex flex-col gap-3 text-[#a1a1a6] text-sm">
              <li>support@rentflow.co.ke</li>
              <li>+254 700 000 000</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-5">Stay Updated</h4>
            <div className="border-b border-[#a1a1a6] pb-2 flex items-center justify-between gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="bg-transparent text-sm w-full outline-none text-white placeholder:text-[#5a5a5a]"
                style={{ border: 'none', fontFamily: 'inherit' }}
              />
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1a6', display: 'flex' }}>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-[#5a5a5a] pt-8 border-t border-white/5">
          <p>Designed by Gh0stNode.</p>
          <p>© 2026 Collins Mwandikwa. All rights reserved.</p>
          <p>English (Kenya)</p>
        </div>
      </footer>
    </div>
  );
};
