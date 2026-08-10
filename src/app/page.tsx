import React from "react";
import Link from "next/link";
import { readDb } from "@/lib/db";
import FadeIn from "@/components/FadeIn";
import StaggeredFadeIn from "@/components/StaggeredFadeIn";
import CountUpNumber from "@/components/CountUpNumber";

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const db = readDb();
  
  const approvedFirmsCount = db.firms.filter((f: any) => f.status === 'approved').length;
  const approvedUsersCount = db.users.filter((u: any) => u.status === 'approved').length;

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* Hero / Welcome Section */}
      <FadeIn>
        <section className="bg-navy relative overflow-hidden text-white border-b border-slate-900 pt-12 pb-20 md:pt-20 md:pb-28">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#0b9bf5_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>
          
          {/* Faded Background Growth Image Banner with Dark overlay */}
          <div className="absolute top-0 right-0 w-full md:w-1/2 h-full opacity-20 pointer-events-none z-0 overflow-hidden select-none">
            <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/60 to-transparent z-10"></div>
            <img
              src="/banner-growth.png"
              alt=""
              className="w-full h-full object-cover object-center mix-blend-overlay"
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Hero Text - Asymmetric layout, taking 7 cols */}
              <div className="lg:col-span-7 space-y-6 animate-fade-in">
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
                  Chartered Accountants <span className="text-skyblue font-extrabold">Connect, Collaborate, Grow</span> Together
                </h1>
                <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl font-light">
                  India's dedicated platform for CAs to list their practicing firms, showcase domain specialisations, build professional peer networks, and access critical tax compliance knowledge.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-2">
                  <Link
                    href="/auth/register-type"
                    className="inline-flex items-center justify-center px-5 py-3 border border-skyblue text-xs font-bold rounded text-white bg-skyblue hover:bg-white hover:text-navy hover:border-white transition-smooth shadow-sm focus-ring uppercase tracking-wider"
                  >
                    Register
                  </Link>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center justify-center px-5 py-3 border border-slate-600 text-xs font-bold rounded text-slate-300 bg-white/5 hover:bg-white/15 hover:text-white transition-smooth shadow-xs uppercase tracking-wider"
                  >
                    Explore the Directory
                  </Link>
              </div>
            </div>

              {/* Hero Visual Card - Stats and directory at a glance */}
              <div className="lg:col-span-5 animate-fade-in-delay-2 relative z-10">
                <div className="bg-gradient-to-br from-skyblue/10 to-sky-600/25 border border-white/10 rounded-lg p-8 shadow-2xl space-y-6 text-white backdrop-blur-md">
                  <h3 className="font-serif text-lg text-white font-semibold border-b border-white/20 pb-3">
                    Community Directory at a Glance
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-white/10 rounded p-4 bg-white/10 backdrop-blur-xs">
                      <span className="block text-2xl font-serif font-bold text-white">
                        <CountUpNumber end={approvedFirmsCount} />+
                      </span>
                      <span className="text-xs text-sky-100 font-sans">Registered Firms</span>
                    </div>
                    <div className="border border-white/10 rounded p-4 bg-white/10 backdrop-blur-xs">
                      <span className="block text-2xl font-serif font-bold text-white">
                        <CountUpNumber end={approvedUsersCount} />+
                      </span>
                      <span className="text-xs text-sky-100 font-sans">Verified Members</span>
                    </div>
                    <div className="border border-white/10 rounded p-4 bg-white/10 backdrop-blur-xs col-span-2 flex items-center space-x-3">
                      <div className="h-10 w-10 bg-skyblue/20 rounded flex items-center justify-center flex-shrink-0">
                        <svg className="h-5 w-5 text-skyblue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <span className="text-sm text-sky-50 font-medium">
                        100% Verified membership through ICAI Reg Nos.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* About Section & Value Props */}
      <FadeIn>
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Asymmetric Header Description */}
            <div className="lg:col-span-4 space-y-4">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy">
                Empowering India's Chartered Accountants
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed text-justify">
                CAnnect was founded to fill the network gap between independent CA practitioners in India. We believe that professional collaboration thrives when CAs can easily list their practices, detail specialized competencies, and find local partners for complex compliance mandates.
              </p>
              <div className="pt-2">
                <Link
                  href="/about"
                  className="text-xs font-semibold text-navy hover:text-skyblue transition-smooth inline-flex items-center space-x-1 border-b border-navy hover:border-skyblue pb-0.5"
                >
                  <span>Read the Founding Story</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* 3 Value Proposition Cards */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-white p-6 border border-slate-200 shadow-sm rounded hover:shadow-md transition-smooth flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 bg-navy/5 text-navy rounded flex items-center justify-center mb-4">
                    <svg className="h-5 w-5 text-skyblue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-base font-semibold text-navy mb-2">
                    Network Pan-India
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed text-justify">
                    Establish contact pathways with Chartered Accountants in smaller cities and remote business corridors to facilitate regional filings.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-6 border border-slate-200 shadow-sm rounded hover:shadow-md transition-smooth flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 bg-navy/5 text-navy rounded flex items-center justify-center mb-4">
                    <svg className="h-5 w-5 text-skyblue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-base font-semibold text-navy mb-2">
                    Firm Directories
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed text-justify">
                    Detail your specific practice focus — Transfer Pricing, Statutory Audits, GST Litigations, or Startup Advisory.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-6 border border-slate-200 shadow-sm rounded hover:shadow-md transition-smooth flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 bg-navy/5 text-navy rounded flex items-center justify-center mb-4">
                    <svg className="h-5 w-5 text-skyblue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-base font-semibold text-navy mb-2">
                    Knowledge Hub
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed text-justify">
                    Share compliance articles, circular interpretations, and due-date alerts compiled specifically for the Indian accounting environment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>



      {/* Exclusive Community Benefits Section */}
      <FadeIn>
        <section className="py-20 bg-navy border-b border-slate-900 relative overflow-hidden text-white">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#0b9bf5_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>
          
          {/* Faded Background Handshake Image Banner */}
          <div className="absolute inset-0 opacity-20 pointer-events-none z-0 overflow-hidden select-none">
            <div className="absolute inset-0 bg-gradient-to-b from-navy/40 via-navy/70 to-navy z-10"></div>
            <img
              src="/banner-handshake.png"
              alt="Professional peer handshake collaboration"
              className="w-full h-full object-cover object-center mix-blend-overlay"
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 relative z-10">
              <span className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-skyblue bg-skyblue/10 px-2.5 py-1 rounded border border-skyblue/25">
                Value Proposition
              </span>
              <h2 className="text-3xl font-serif font-bold text-white">
                Why Chartered Accountants Join CAnnect
              </h2>
              <p className="text-slate-300 text-sm max-w-2xl mx-auto font-light leading-relaxed">
                Designed specifically for CA practitioners, our platform enables professional collaboration without violating anti-solicitation guidelines.
              </p>
            </div>

            <StaggeredFadeIn className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {/* Benefit 1 */}
              <div className="p-6 border border-white/10 rounded-xl hover:border-skyblue/50 hover:shadow-lg transition-smooth bg-white/5 backdrop-blur-md space-y-3">
                <div className="h-10 w-10 bg-skyblue/10 text-skyblue rounded flex items-center justify-center">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-base font-semibold text-white">PAN INDIA Connect</h3>
                <p className="text-xs text-slate-300 leading-relaxed text-justify">
                  Need to complete a physical audit check in Chennai or represent a client before tax authorities in Delhi? Find and collaborate with verified CAs on the ground in any state.
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="p-6 border border-white/10 rounded-xl hover:border-skyblue/50 hover:shadow-lg transition-smooth bg-white/5 backdrop-blur-md space-y-3">
                <div className="h-10 w-10 bg-skyblue/10 text-skyblue rounded flex items-center justify-center">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-serif text-base font-semibold text-white">100% Verified Community</h3>
                <p className="text-xs text-slate-300 leading-relaxed text-justify">
                  Eliminate spam and unverified solicitations. Every directory registration and user account is verified against active ICAI membership numbers.
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="p-6 border border-white/10 rounded-xl hover:border-skyblue/50 hover:shadow-lg transition-smooth bg-white/5 backdrop-blur-md space-y-3">
                <div className="h-10 w-10 bg-skyblue/10 text-skyblue rounded flex items-center justify-center">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-serif text-base font-semibold text-white">Protected Peer Connection</h3>
                <p className="text-xs text-slate-300 leading-relaxed text-justify">
                  Initiate conversations safely. Our secure contact flow ensures compliance with code of ethics guidelines while helping you explore active cooperation.
                </p>
              </div>
            </StaggeredFadeIn>
          </div>
        </section>
      </FadeIn>

      {/* Register Your Firm CTA Section */}
      <FadeIn>
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg p-8 md:p-12 relative overflow-hidden shadow-xl border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
              
              <div className="max-w-xl space-y-6">
                <h2 className="text-2xl md:text-4xl font-serif font-bold text-navy tracking-tight">
                  Register & Get Discovered
                </h2>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                  Enable fellow Chartered Accountants across India to search for your specialized capabilities. Whether you practice in Statutory Audit, GST litigation, Transfer Pricing, or Company Law, listing your firm facilitates subcontracting and local peer referrals.
                </p>
                <div className="flex flex-col gap-3 text-xs text-slate-700 pt-2 font-bold">
                  <span className="flex items-center">
                    <svg className="h-5 w-5 text-skyblue flex-shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Showcase Specialisations
                  </span>
                  <span className="flex items-center">
                    <svg className="h-5 w-5 text-skyblue flex-shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Receive Peer Referrals
                  </span>
                  <span className="flex items-center">
                    <svg className="h-5 w-5 text-skyblue flex-shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Secure Member Messaging
                  </span>
                </div>
                <div className="pt-4">
                  <Link
                    href="/auth/register-type"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded text-white bg-skyblue hover:bg-navy transition-smooth shadow-sm focus-ring"
                  >
                    Register Now &rarr;
                  </Link>
                </div>
              </div>

              <div className="hidden md:block relative h-full min-h-[300px] w-full rounded-xl overflow-hidden shadow-lg border border-slate-100 group">
                <div className="absolute inset-0 bg-navy/10 group-hover:bg-transparent transition-smooth z-10"></div>
                <img 
                  src="/register-banner.png" 
                  alt="Business Growth and Collaboration" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              </div>

            </div>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
