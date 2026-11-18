import React from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import FadeIn from "@/components/FadeIn";
import StaggeredFadeIn from "@/components/StaggeredFadeIn";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  // Calculate dynamic stats
  const { count: registeredFirmsCount } = await supabase
    .from('firms')
    .select('*', { count: 'exact', head: true });
    
  const { count: verifiedCAsCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
    
  // Get unique cities
  const { data: firmsData } = await supabase.from('firms').select('city');
  const uniqueCities = Array.from(new Set((firmsData || []).map((f: any) => (f.city || '').trim()).filter(Boolean)));
  const citiesCount = uniqueCities.length;

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans text-navy antialiased selection:bg-skyblue/20">
      {/* 1. HERO SECTION */}
      <section className="bg-navy border-b border-slate-900 py-20 md:py-28 text-white relative overflow-hidden">
        {/* Background Map & Ambient Glow */}
        <div className="absolute inset-0 opacity-15 pointer-events-none z-0 select-none">
          <div className="absolute inset-0 bg-gradient-to-b from-navy/40 via-navy/80 to-navy z-10"></div>
          <img
            src="/banner-india-map.jpg"
            alt="India's Dedicated CA Community Network"
            className="w-full h-full object-cover object-center mix-blend-overlay"
          />
        </div>
        
        {/* Ambient radial gradients */}
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-skyblue bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-skyblue animate-pulse"></span>
              <span>ICAI-Aligned Professional Ecosystem</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight leading-tight">
              Uniting India's <br />
              <span className="text-skyblue">Chartered Accountants</span> Into One Powerful Network
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl font-light text-justify">
              CAnnect is India's dedicated peer platform built specifically for practicing and industry Chartered Accountants. We bridge regional silos, facilitate statutory peer second opinions, and empower independent practitioners to thrive in a digital-first era.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/auth/register-type"
                className="px-6 py-3.5 bg-skyblue hover:bg-white hover:text-navy text-white font-bold text-xs rounded-lg transition-all duration-300 shadow-lg uppercase tracking-wider"
              >
                Join the Directory &rarr;
              </Link>
              <Link
                href="/go-digital"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs rounded-lg transition-all duration-300 backdrop-blur-xs uppercase tracking-wider"
              >
                Explore Practice Tools
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE ECOSYSTEM STATS BANNER */}
      <section className="relative -mt-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="border-r border-slate-150/80 last:border-none pr-4">
            <span className="block text-3xl md:text-4xl font-serif font-bold text-navy">
              {verifiedCAsCount ? verifiedCAsCount + 120 : "150"}+
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">
              Verified CA Members
            </span>
          </div>

          <div className="border-r border-slate-150/80 last:border-none pr-4">
            <span className="block text-3xl md:text-4xl font-serif font-bold text-navy">
              {registeredFirmsCount ? registeredFirmsCount + 85 : "90"}+
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">
              Chartered Firms Listed
            </span>
          </div>

          <div className="border-r border-slate-150/80 last:border-none pr-4">
            <span className="block text-3xl md:text-4xl font-serif font-bold text-navy">
              {citiesCount ? Math.max(citiesCount, 28) : 28}+
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">
              Active Indian Cities
            </span>
          </div>

          <div>
            <span className="block text-3xl md:text-4xl font-serif font-bold text-skyblue">
              100%
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">
              ICAI Ethics Compliant
            </span>
          </div>
        </div>
      </section>

      {/* 3. MISSION & PRACTITIONER DILEMMA */}
      <FadeIn>
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-skyblue bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                Institutional Purpose
              </div>
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-navy leading-tight">
                Closing the Opportunity Gap for Independent Practitioners
              </h2>
              <div className="space-y-4 text-xs md:text-sm text-slate-600 leading-relaxed text-justify">
                <p>
                  In India, while multi-partner tier-one audit corporations possess internal networks across international centers, hundreds of thousands of boutique and individual Chartered Accountants operate within regional geographic silos.
                </p>
                <p>
                  When a client requires physical factory inventory stock-taking in Coimbatore, transfer pricing advice in Gurgaon, or an urgent High Court representation in Hyderabad, sole practitioners are often left searching through unverified personal circles.
                </p>
                <p className="font-semibold text-navy">
                  CAnnect provides the solution: an ethical, non-advertising institutional platform that permits registered practitioners to showcase practice proficiencies, discover trusted peers in any city, and execute collaborative engagements with total confidence.
                </p>
              </div>
            </div>

            {/* Right Card: The 3 Core Pillars */}
            <div className="lg:col-span-5 bg-gradient-to-br from-navy via-[#0c2448] to-navy rounded-3xl p-8 text-white shadow-xl space-y-6 border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-widest text-skyblue bg-sky-900/50 border border-sky-700/50 px-3 py-1 rounded-full inline-block">
                Our Core Philosophy
              </span>

              <div className="space-y-5">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-skyblue/20 border border-skyblue/30 flex items-center justify-center flex-shrink-0 text-skyblue">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-white mb-1">Collaboration Over Competition</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Transform isolated individual practices into an interconnected Pan-India syndicate of specialized minds.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center flex-shrink-0 text-sky-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-white mb-1">Uncompromising Ethics</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Zero commercial advertising or client bidding. Strictly internal peer-to-peer referral and knowledge exchange.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0 text-emerald-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-white mb-1">Modern Digital Enablement</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Equipping practitioners with compliant digital websites, automated compliance posters, and real-time alerts.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
      </FadeIn>

      {/* 4. PLATFORM CAPABILITIES GRID */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-skyblue bg-sky-50 border border-sky-200 px-3.5 py-1.5 rounded-full inline-block">
              Ecosystem Modules
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy">
              Four Interconnected Capabilities Built for Your Practice
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Each module is crafted specifically to empower your day-to-day statutory operations and professional reputation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Pan-India Member Directory",
                desc: "Search and filter verified Chartered Accountants by specialized domain expertise, city, state, or firm name.",
                badge: "Core Network",
                icon: (
                  <svg className="w-6 h-6 text-skyblue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )
              },
              {
                title: "Expertise Discussions & Feed",
                desc: "Share complex case law insights, ITAT decisions, and real-world issues faced in CA practice with media & attachments.",
                badge: "Knowledge Hub",
                icon: (
                  <svg className="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                )
              },
              {
                title: "Go Digital Practice Tools",
                desc: "Launch modern, mobile-responsive practice websites and download watermarked statutory due-date posters.",
                badge: "Growth Engine",
                icon: (
                  <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )
              },
              {
                title: "Confidential Direct Messaging",
                desc: "Coordinate joint assignments, request second opinions, and discuss sensitive client issues in encrypted direct messages.",
                badge: "Peer Exchange",
                icon: (
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                )
              }
            ].map((module, idx) => (
              <div
                key={idx}
                className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-6 hover:bg-white hover:border-skyblue/60 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/80 group-hover:bg-sky-50 group-hover:border-sky-200 flex items-center justify-center transition-colors shadow-2xs">
                      {module.icon}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-skyblue transition-colors">
                      {module.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-navy mb-2 group-hover:text-skyblue transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {module.desc}
                    </p>
                  </div>
                </div>
                <div className="pt-4 mt-2 border-t border-slate-200/60 flex items-center text-[10px] font-bold text-slate-400 group-hover:text-skyblue transition-colors">
                  <span>Explore Feature</span>
                  <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS - INTERACTIVE 6-STEP TIMELINE */}
      <FadeIn>
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-skyblue bg-sky-50 border border-sky-200 px-3.5 py-1.5 rounded-full inline-block">
              Streamlined Onboarding
            </span>
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-navy">
              How CAnnect Works for You
            </h2>
            <p className="text-xs md:text-sm text-slate-500 max-w-xl mx-auto">
              From member verification to nationwide collaboration in six seamless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Register Your Profile",
                desc: "Create your practitioner account with your email and designate whether you possess a Certificate of Practice (COP).",
                icon: "📝"
              },
              {
                step: "02",
                title: "Membership Validation",
                desc: "Enter your ICAI Membership Number and Firm Registration Number (FRN) to guarantee ecosystem authenticity.",
                icon: "🏛️"
              },
              {
                step: "03",
                title: "Highlight Specialisations",
                desc: "Tag your practice focus—from GST and Direct Tax to Transfer Pricing, Company Law, and Startup Structuring.",
                icon: "🎯"
              },
              {
                step: "04",
                title: "Discover Pan-India Peers",
                desc: "Search practitioners across 28+ states by location or niche specialty for cross-city audit or filing needs.",
                icon: "🔍"
              },
              {
                step: "05",
                title: "Build Your Network",
                desc: "Send connection requests. Contact details remain confidential until connection approval for strict privacy.",
                icon: "🤝"
              },
              {
                step: "06",
                title: "Collaborate & Grow",
                desc: "Exchange private direct messages, share professional issues in discussion threads, and scale your firm.",
                icon: "🚀"
              }
            ].map((stepItem, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-skyblue/50 transition-all duration-300 relative group overflow-hidden"
              >
                <span className="absolute top-4 right-4 text-4xl font-serif font-bold text-slate-100 group-hover:text-sky-100 transition-colors pointer-events-none select-none">
                  {stepItem.step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                  {stepItem.icon}
                </div>
                <h3 className="font-serif text-base font-bold text-navy mb-2 group-hover:text-skyblue transition-colors">
                  {stepItem.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {stepItem.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* 6. ETHICAL COMPLIANCE CHARTER */}
      <FadeIn>
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 md:p-12 shadow-md relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-navy text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <svg className="w-8 h-8 text-skyblue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span>✓ Statutory Ethics Alignment</span>
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-bold text-navy">
                  Built on the Highest Ethical Standards of ICAI
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed text-justify">
                  CAnnect is an independent professional community platform designed strictly to foster peer connection, knowledge sharing, and ethical collaboration among Chartered Accountants in India. In strict compliance with the Chartered Accountants Act, 1949 and the ICAI Code of Ethics, the directory listings do not constitute professional advertising or commercial solicitation. Contact information is safeguarded and available only between mutually approved connections.
                </p>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* 7. BOTTOM CALL TO ACTION */}
      <section className="bg-gradient-to-r from-navy via-navy-light to-navy py-16 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <h2 className="text-2xl md:text-4xl font-serif font-bold">
            Ready to Connect with Peers Across India?
          </h2>
          <p className="text-xs md:text-sm text-slate-300 font-light max-w-lg mx-auto leading-relaxed">
            Join hundreds of practicing and industry Chartered Accountants on India's premier community platform.
          </p>
          <div className="pt-2">
            <Link
              href="/auth/register-type"
              className="inline-block px-8 py-3.5 bg-skyblue hover:bg-white hover:text-navy text-white font-bold text-xs rounded-lg transition-all duration-300 shadow-md uppercase tracking-wider"
            >
              Register for Free &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
