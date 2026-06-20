import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Hero text reveal
    gsap.to('.hero-title-inner', {
      y: 0,
      duration: 1.2,
      stagger: 0.1,
      ease: 'power4.out',
      delay: 0.2
    });

    gsap.fromTo('.hero-btn', 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.8 }
    );

    // 2. Parallax background image
    gsap.to('.hero-bg', {
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
      y: 200,
      scale: 1.05
    });

    // 3. Scroll text reveals
    gsap.utils.toArray('.scroll-reveal').forEach((el: any) => {
      const inner = el.querySelectorAll('.scroll-reveal-inner');
      gsap.fromTo(inner, 
        { y: '100%' },
        {
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
          },
          y: '0%',
          duration: 1.2,
          ease: 'power4.out',
          stagger: 0.1
        }
      );
    });

    // 4. Image reveals (wipe down)
    gsap.utils.toArray('.img-reveal').forEach((el: any) => {
      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
        },
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        duration: 1.5,
        ease: 'power3.inOut'
      });
      
      // Image slight scale down inside
      const img = el.querySelector('img');
      if (img) {
        gsap.fromTo(img, 
          { scale: 1.2 },
          {
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
            },
            scale: 1,
            duration: 1.5,
            ease: 'power3.inOut'
          }
        );
      }
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="w-full bg-[#f6f6f4] text-[#1c1c1c]">
      {/* Navbar */}
      <nav className="absolute top-0 w-full z-50 flex items-center justify-between px-8 py-8 md:px-16 mix-blend-difference text-white">
        <div className="font-sans font-bold text-xl tracking-tight uppercase flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 2L8 22L14 2L20 22L22 2H18L14 16L10 2H2Z" fill="white"/>
          </svg>
          RENTFLOW
        </div>
        <div className="flex items-center gap-8">
          <span className="hidden md:block font-medium cursor-pointer hover:opacity-70 transition">Support</span>
          <button className="vista-btn !bg-transparent !text-white !border-white hover:!bg-white hover:!text-black" onClick={() => navigate('/sign-in')}>
            Sign In <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section relative w-full h-[90vh] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            className="hero-bg w-full h-full object-cover origin-bottom" 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80" 
            alt="Corporate building" 
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <div className="relative z-10 w-full h-full flex flex-col justify-end px-8 md:px-16 pb-24 md:pb-32">
          <h1 className="text-[10vw] md:text-[7vw] leading-[1] tracking-tight text-white max-w-6xl">
            <div className="clip-text">
              <span className="hero-title-inner block translate-y-full">A <span className="font-serif italic">trusted</span> property</span>
            </div>
            <div className="clip-text">
              <span className="hero-title-inner block translate-y-full">management partner</span>
            </div>
          </h1>
          <div className="mt-12 hero-btn opacity-0 flex flex-wrap gap-4">
            <button className="vista-btn" onClick={() => navigate('/sign-in')}>
              Sign In to Dashboard <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Introduction Paragraph */}
      <section className="py-24 md:py-32 px-8 md:px-16 max-w-5xl">
        <p className="text-[24px] md:text-[32px] leading-relaxed font-sans font-light text-[#1c1c1c]">
          RentFlow is a premium property management platform designed to automate your portfolio. Built to serve modern landlords, our platform today manages <span className="font-serif italic font-medium">thousands of units</span> across industrial, commercial, and multi-residential properties seamlessly.
        </p>
      </section>

      {/* Large Image Reveal */}
      <section className="px-8 md:px-16 pb-32">
        <div className="w-full h-[60vh] md:h-[80vh] overflow-hidden img-reveal relative" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}>
          <img 
            className="w-full h-full object-cover scale-110" 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" 
            alt="Modern office building" 
          />
        </div>
      </section>

      {/* Split Text & Image Section 1 */}
      <section className="py-24 px-8 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-center">
        <div className="order-2 md:order-1">
          <div className="w-full aspect-[4/5] overflow-hidden img-reveal relative">
            <img 
              className="w-full h-full object-cover scale-110" 
              src="https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80" 
              alt="Architecture details" 
            />
          </div>
        </div>
        <div className="order-1 md:order-2">
          <h2 className="text-[40px] md:text-[56px] leading-[1.1] mb-8 scroll-reveal clip-text">
            <span className="scroll-reveal-inner block">Automating with</span>
            <span className="scroll-reveal-inner block font-serif italic text-[#6b6b6b]">precision</span>
          </h2>
          <p className="text-lg text-[#6b6b6b] leading-relaxed mb-8">
            Throughout our history, we've watched the real estate market evolve – shaping the experience that guides our software philosophy. We build creatively yet with discipline, seeking to deliver tools that bring compelling value and operational growth to property managers.
          </p>
          <button className="vista-btn" onClick={() => navigate('/sign-in')}>
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Split Text & Image Section 2 */}
      <section className="py-24 px-8 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-center">
        <div>
          <h2 className="text-[40px] md:text-[56px] leading-[1.1] mb-8 scroll-reveal clip-text">
            <span className="scroll-reveal-inner block">Delivering on</span>
            <span className="scroll-reveal-inner block font-serif italic text-[#6b6b6b]">details</span>
          </h2>
          <p className="text-lg text-[#6b6b6b] leading-relaxed mb-8">
            We thrive off solving complex management problems. Our vertically integrated platform drives your portfolio through every stage of the rental lifecycle, blending rich financial insights with an extensive tenant tracking network.
          </p>
          <button className="vista-btn" onClick={() => navigate('/sign-in')}>
            Sign In <ArrowRight size={16} />
          </button>
        </div>
        <div>
          <div className="w-full aspect-[4/5] overflow-hidden img-reveal relative">
            <img 
              className="w-full h-full object-cover scale-110" 
              src="https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80" 
              alt="Interior details" 
            />
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="py-32 px-8 md:px-16 bg-white border-y border-[#e2e2df]">
        <h3 className="text-2xl font-sans mb-16 text-center max-w-4xl mx-auto">
          We execute every feature with a focus on cost reduction, time savings, reliability, and market-tailored solutions.
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-[#e2e2df]">
          {[
            'Automated Rent Collection',
            'Real-time Financials',
            'Tenant Management',
            'Maintenance Tracking',
            'Lease Management',
            'Analytics & Reporting',
            'Smart Notifications',
            'Secure Data Storage'
          ].map((item, idx) => (
            <div key={idx} className="p-10 border-b border-r border-[#e2e2df] aspect-square flex flex-col justify-end hover:bg-[#f6f6f4] transition duration-500">
              <span className="text-lg font-medium">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Portfolios Gallery */}
      <section className="py-32 px-8 md:px-16">
        <h2 className="text-[40px] md:text-[48px] mb-12">Showcase Portfolios</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80', title: 'SOJAG Head Office', type: 'Commercial Management' },
            { img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80', title: 'Serra Apartments', type: 'Residential Management' },
            { img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80', title: 'LSU Logistics', type: 'Industrial Management' }
          ].map((project, idx) => (
            <div key={idx} className="group cursor-pointer">
              <div className="w-full aspect-[4/3] overflow-hidden mb-4 relative">
                <img 
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-105" 
                  src={project.img} 
                  alt={project.title} 
                />
              </div>
              <p className="text-[13px] text-[#6b6b6b] uppercase tracking-wide mb-1">{project.type}</p>
              <h4 className="text-xl font-medium">{project.title}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Huge Wavy CTA Section */}
      <section className="relative py-40 px-8 md:px-16 bg-[#eaeae8] overflow-hidden">
        {/* Abstract background shape mimicking the wavy "M" in the video */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg viewBox="0 0 1440 320" className="w-full h-full object-cover">
            <path fill="#1c1c1c" fillOpacity="1" d="M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className="relative z-10 max-w-4xl scroll-reveal clip-text">
          <h2 className="text-[56px] md:text-[80px] leading-[1.1] mb-6">
            <span className="scroll-reveal-inner block">Manage your</span>
            <span className="scroll-reveal-inner block font-serif italic">— ideal space</span>
          </h2>
          <p className="text-xl text-[#6b6b6b] mb-10">Access your dashboard or contact support for personalized assistance</p>
          <div className="flex flex-wrap gap-4">
            <button className="vista-btn-dark" onClick={() => navigate('/sign-in')}>
              Sign In <ArrowRight size={16} />
            </button>
            <button className="vista-btn" onClick={() => navigate('/sign-in')}>
              Create Account <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1c1c1c] text-white pt-24 pb-8 px-8 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-24">
          <div className="md:col-span-1">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2L8 22L14 2L20 22L22 2H18L14 16L10 2H2Z" fill="white"/>
            </svg>
          </div>
          <div>
            <h4 className="font-bold mb-6">Platform</h4>
            <ul className="space-y-3 text-[#a1a1a6] text-sm">
              <li><button onClick={() => navigate('/sign-in')} className="hover:text-white transition">Sign In</button></li>
              <li><button onClick={() => navigate('/sign-in')} className="hover:text-white transition">Get Started</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Legal</h4>
            <ul className="space-y-3 text-[#a1a1a6] text-sm">
              <li><a href="#" className="hover:text-white transition">Privacy & Cookies Policies</a></li>
              <li><a href="#" className="hover:text-white transition">Terms & Conditions</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Get in Touch</h4>
            <ul className="space-y-3 text-[#a1a1a6] text-sm">
              <li>support@rentflow.com</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Subscribe to Updates</h4>
            <div className="border-b border-[#a1a1a6] pb-2 flex justify-between items-center">
              <input type="email" placeholder="Email" className="bg-transparent text-sm w-full outline-none text-white" />
              <ArrowRight size={16} className="text-[#a1a1a6]" />
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-[#a1a1a6] pt-8 border-t border-white/10">
          <p>Designed by DeepMind.</p>
          <p>© 2026 Collins Mwandikwa. All rights reserved.</p>
          <p>English</p>
        </div>
      </footer>
    </div>
  );
};
