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
  
  const { data: eventsData } = await supabase
    .from('events')
    .select('cpeHours')
    .eq('status', 'Past');
  const totalCpeHours = (eventsData || []).reduce((sum: number, e: any) => sum + (e.cpeHours || 0), 0);

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Page Header */}
      <section className="bg-navy border-b border-slate-900 py-16 text-white relative overflow-hidden">
        {/* Faded Background India Map Image Banner */}
        <div className="absolute inset-0 opacity-20 pointer-events-none z-0 overflow-hidden select-none">
          <div className="absolute inset-0 bg-gradient-to-b from-navy/30 via-navy/60 to-navy z-10"></div>
          <img
            src="/banner-india-map.jpg"
            alt="India's Dedicated CA Community Platform"
            className="w-full h-full object-cover object-center mix-blend-overlay"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-skyblue bg-skyblue/10 px-2.5 py-1 rounded border border-skyblue/25 inline-block">
              About the Platform
            </span>
            <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight opacity-0 animate-fadeIn">
              <span className="text-white block mb-2">India's Dedicated</span>
              <span className="text-skyblue block">CA Community Platform</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl font-light">
              Connecting Chartered Accountants across cities to share tax insights, align practice specialities, and foster professional growth.
            </p>
          </div>
        </div>
      </section>

      {/* Positioning / Mission & Vision */}
      <FadeIn>
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Main Statement */}
            <div className="lg:col-span-8 space-y-6">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy border-b border-gold/10 pb-4">
                Our Mission
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed text-justify">
                CAnnect was conceptualized to address a persistent gap in the Indian accounting landscape: the isolation of independent practitioners operating in regional nodes. While large accounting firms have integrated networks, independent practicing Chartered Accountants often lack an institutional, advertising-compliant framework to discover and coordinate with peers.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed text-justify">
                By listing your firm's specialized credentials, identifying potential connections in other cities, and engaging in secure peer messaging, you can expand the scope and agility of your practice while operating under the strict standards of professional ethics.
              </p>
            </div>

            {/* Right Sidebar - Platform Milestones Grid */}
            <div className="lg:col-span-4 bg-gradient-to-br from-skyblue to-sky-600 border border-sky-400 rounded-lg p-6 text-white shadow-md space-y-6">
              <div>
                <span className="text-[10px] text-sky-100 font-bold uppercase tracking-wider block mb-1">
                  Ecosystem Metrics
                </span>
                <h3 className="font-serif text-base font-bold text-white border-b border-white/20 pb-3">
                  Platform Milestones
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-white/10 rounded p-3 bg-white/10 backdrop-blur-xs text-center">
                  <span className="block text-2xl font-serif font-bold text-white">
                    {registeredFirmsCount || 0}+
                  </span>
                  <span className="text-[10px] text-sky-100 font-medium font-sans block">CA Firms Listed</span>
                </div>
                <div className="border border-white/10 rounded p-3 bg-white/10 backdrop-blur-xs text-center">
                  <span className="block text-2xl font-serif font-bold text-white">
                    {verifiedCAsCount || 0}+
                  </span>
                  <span className="text-[10px] text-sky-100 font-medium font-sans block">CA Members</span>
                </div>
                <div className="border border-white/10 rounded p-3 bg-white/10 backdrop-blur-xs text-center col-span-2">
                  <span className="block text-2xl font-serif font-bold text-white">
                    {citiesCount || 0}+
                  </span>
                  <span className="text-[10px] text-sky-100 font-medium font-sans block">Indian Cities Active</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* How It Works Section */}
      <FadeIn>
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy">
              How It Works
            </h2>
            <div className="w-12 h-1 bg-skyblue mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-sky-100 hidden md:block"></div>
            
            <div className="space-y-12 md:space-y-0">
              
              {/* Step 1: Register */}
              <div className="flex flex-col md:flex-row items-center justify-between group md:py-8">
                <div className="md:w-5/12 text-center md:text-right mb-6 md:mb-0">
                  <span className="text-skyblue font-bold text-5xl opacity-10 block mb-[-18px]">01</span>
                  <h3 className="text-lg font-serif font-bold text-navy mb-2">Register Yourself</h3>
                  <p className="text-xs text-slate-600">Sign up to be part of the community.</p>
                </div>
                <div className="hidden md:flex w-2/12 justify-center relative">
                  <div className="w-4 h-4 rounded-full bg-skyblue ring-4 ring-white shadow-sm z-10 transition-transform group-hover:scale-125"></div>
                </div>
                <div className="md:w-5/12"></div>
              </div>

              {/* Step 2: Choose Your Path */}
              <div className="flex flex-col md:flex-row-reverse items-center justify-between group md:py-8">
                <div className="md:w-5/12 text-center md:text-left mb-6 md:mb-0">
                  <span className="text-skyblue font-bold text-5xl opacity-10 block mb-[-18px]">02</span>
                  <h3 className="text-lg font-serif font-bold text-navy mb-2">Choose Your Path</h3>
                  <p className="text-xs text-slate-600">Select whether you are a COP (Chartered Accountant in Practice) or No COP.</p>
                </div>
                <div className="hidden md:flex w-2/12 justify-center relative">
                  <div className="w-4 h-4 rounded-full bg-skyblue ring-4 ring-white shadow-sm z-10 transition-transform group-hover:scale-125"></div>
                </div>
                <div className="md:w-5/12"></div>
              </div>

              {/* Step 3: Fill Details */}
              <div className="flex flex-col md:flex-row items-center justify-between group md:py-8">
                <div className="md:w-5/12 text-center md:text-right mb-6 md:mb-0">
                  <span className="text-skyblue font-bold text-5xl opacity-10 block mb-[-18px]">03</span>
                  <h3 className="text-lg font-serif font-bold text-navy mb-2">Fill in the Details</h3>
                  <p className="text-xs text-slate-600">Provide your professional information and areas of specialisation.</p>
                </div>
                <div className="hidden md:flex w-2/12 justify-center relative">
                  <div className="w-4 h-4 rounded-full bg-skyblue ring-4 ring-white shadow-sm z-10 transition-transform group-hover:scale-125"></div>
                </div>
                <div className="md:w-5/12"></div>
              </div>

              {/* Step 4: Search & Connect */}
              <div className="flex flex-col md:flex-row-reverse items-center justify-between group md:py-8">
                <div className="md:w-5/12 text-center md:text-left mb-6 md:mb-0">
                  <span className="text-skyblue font-bold text-5xl opacity-10 block mb-[-18px]">04</span>
                  <h3 className="text-lg font-serif font-bold text-navy mb-2">Search & Connect</h3>
                  <p className="text-xs text-slate-600">Use filters such as Name of the Member, City, or Specialisation to find peers.</p>
                </div>
                <div className="hidden md:flex w-2/12 justify-center relative">
                  <div className="w-4 h-4 rounded-full bg-skyblue ring-4 ring-white shadow-sm z-10 transition-transform group-hover:scale-125"></div>
                </div>
                <div className="md:w-5/12"></div>
              </div>

              {/* Step 5: Click Connect */}
              <div className="flex flex-col md:flex-row items-center justify-between group md:py-8">
                <div className="md:w-5/12 text-center md:text-right mb-6 md:mb-0">
                  <span className="text-skyblue font-bold text-5xl opacity-10 block mb-[-18px]">05</span>
                  <h3 className="text-lg font-serif font-bold text-navy mb-2">Click Connect</h3>
                  <p className="text-xs text-slate-600">Instantly connect with fellow Chartered Accountants.</p>
                </div>
                <div className="hidden md:flex w-2/12 justify-center relative">
                  <div className="w-4 h-4 rounded-full bg-skyblue ring-4 ring-white shadow-sm z-10 transition-transform group-hover:scale-125"></div>
                </div>
                <div className="md:w-5/12"></div>
              </div>

              {/* Step 6: Message & Collaborate */}
              <div className="flex flex-col md:flex-row-reverse items-center justify-between group md:py-8">
                <div className="md:w-5/12 text-center md:text-left mb-6 md:mb-0">
                  <span className="text-skyblue font-bold text-5xl opacity-10 block mb-[-18px]">06</span>
                  <h3 className="text-lg font-serif font-bold text-navy mb-2">Message & Collaborate</h3>
                  <p className="text-xs text-slate-600">Start conversations, share expertise, and explore opportunities to work together.</p>
                </div>
                <div className="hidden md:flex w-2/12 justify-center relative">
                  <div className="w-4 h-4 rounded-full bg-skyblue ring-4 ring-white shadow-sm z-10 transition-transform group-hover:scale-125"></div>
                </div>
                <div className="md:w-5/12"></div>
              </div>

            </div>
          </div>
        </section>
      </FadeIn>

      {/* What We Offer */}
      <FadeIn>
        <section className="bg-slate-100 py-16 border-t border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy mb-8 text-center">
              Platform Capabilities & Core Modules
            </h2>
            <StaggeredFadeIn>
              <div className="bg-white p-6 border border-slate-200 rounded text-center">
                <h3 className="font-serif text-sm font-bold text-skyblue mb-2">Firm Directories</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Filter practicing firms by specialized domain expertises and geographic regions.
                </p>
              </div>
              <div className="bg-white p-6 border border-slate-200 rounded text-center">
                <h3 className="font-serif text-sm font-bold text-skyblue mb-2">Practice Websites</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Launch modern, mobile-responsive practice websites with built-in statutory ICAI disclaimer overlays.
                </p>
              </div>
              <div className="bg-white p-6 border border-slate-200 rounded text-center">
                <h3 className="font-serif text-sm font-bold text-skyblue mb-2">CAnnect Meetups</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Register for corporate tax panels, practice management webinars, and physical roundtables.
                </p>
              </div>
              <div className="bg-white p-6 border border-slate-200 rounded text-center">
                <h3 className="font-serif text-sm font-bold text-skyblue mb-2">Client App Teaser</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Prepare for the launch of the upcoming secure client communication app.
                </p>
              </div>
            </StaggeredFadeIn>
          </div>
        </section>
      </FadeIn>

      {/* Trust Signalling Banner */}
      <FadeIn>
        <section className="pt-16 max-w-5xl mx-auto px-4 text-center">
          <div className="border-l-4 border-skyblue bg-white p-8 rounded shadow-sm text-left">
            <h3 className="font-serif text-lg font-bold text-navy mb-2">
              Built on Professional Ethics
            </h3>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              We hold ourselves to the highest standards of professional conduct. In compliance with ethical guidelines of the Institute of Chartered Accountants of India (ICAI), CAnnect does not promote, advertise, or review individual firms. The search tools are designed strictly as an internal referral discovery tool for registered practitioners.
            </p>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
