"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";

export default function GoDigitalPage() {
  const contactFormRef = useRef<HTMLFormElement>(null);
  const websitePricingRef = useRef<HTMLDivElement>(null);
  const posterPricingRef = useRef<HTMLDivElement>(null);
  const whyGoDigitalRef = useRef<HTMLDivElement>(null);
  
  // Interactive UI States
  const [selectedPlan, setSelectedPlan] = useState("Pro Website Template");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [posterBillingPeriod, setPosterBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const selectPlanAndScroll = (planName: string) => {
    setSelectedPlan(planName);
    contactFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!name || !phone) {
      setErrorMsg("Please complete the required fields (Name and Mobile Number).");
      setLoading(false);
      return;
    }

    const waNumber = "918074134879";
    const text = `Hi, I am interested in the ${selectedPlan}.\nName: ${name}\nPhone: ${phone}\nMessage: ${message || "None"}`;
    const encodedText = encodeURIComponent(text);
    const waUrl = `https://wa.me/${waNumber}?text=${encodedText}`;
    
    window.open(waUrl, '_blank');
    
    setSuccessMsg(`Redirecting you to WhatsApp...`);
    setName("");
    setPhone("");
    setMessage("");
    setLoading(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-navy antialiased selection:bg-skyblue/20">
      


      {/* 2. HERO SECTION */}
      <section className="bg-navy border-b border-slate-900 py-16 md:py-24 relative overflow-hidden text-white">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#0ea5e9_1.5px,transparent_1.5px)] [background-size:24px_24px] z-0"></div>
        
        {/* Faded Background Rotating Globe Image Banner */}
        <div className="absolute inset-0 opacity-20 pointer-events-none z-0 overflow-hidden select-none flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-navy/55 via-navy/80 to-navy z-10"></div>
          <img
            src="/banner-globe.jpg"
            alt="Global Digital Network and Practice Scale"
            className="absolute w-[150vw] h-[150vw] md:w-[120vw] md:h-[120vw] object-cover object-center mix-blend-overlay animate-[spin_120s_linear_infinite]"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Info */}
            <div className="lg:col-span-7 space-y-6 text-left relative z-10">
              <span className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-white bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20">
                <span>⭐ BUILD YOUR ONLINE REPUTATION</span>
              </span>
              <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight leading-tight opacity-0 animate-fadeIn">
                <span className="text-skyblue">Digital Growth Solutions</span> <span className="text-white">for Chartered Accountants</span>
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xl font-light text-justify">
                Helping CAs focus on practice while we manage their digital presence.
              </p>
              
              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => document.getElementById('solutions-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-3.5 bg-skyblue hover:bg-white hover:text-navy text-white border border-skyblue hover:border-white font-bold text-xs rounded transition-smooth shadow-md uppercase tracking-wider focus-ring"
                >
                  Get Started
                </button>
                <button
                  onClick={() => websitePricingRef.current?.scrollIntoView({ behavior: "smooth" })}
                  className="px-6 py-3.5 bg-white hover:bg-sky-50 text-navy border border-white hover:border-sky-50 font-bold text-xs rounded transition-smooth shadow-md uppercase tracking-wider focus-ring"
                >
                  Build My Presence
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. WHY GO DIGITAL SECTION */}
      <section ref={whyGoDigitalRef} className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-16">
        <div className="bg-gradient-to-br from-skyblue to-sky-600 border border-sky-400 rounded-2xl p-8 md:p-12 text-white shadow-md space-y-8">
          <div className="text-center">
            <span className="text-[10px] text-sky-100 font-bold uppercase tracking-wider block mb-2">
              Practice Benefits
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white border-b border-white/20 pb-4 inline-block">
              Why Build a Digital Practice Presence?
            </h2>
            <p className="text-xs text-sky-50 mt-4 max-w-2xl mx-auto">
              Establish authority and service client expectations efficiently in a digital-first market.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                icon: "🛡️",
                title: "Credibility",
                desc: "ICAI-compliant professional profile validates your credentials instantly to potential corporate clients."
              },
              {
                icon: "🌍",
                title: "Visibility",
                desc: "Allows corporate partners and directories across India to easily find and connect with your expertise."
              },
              {
                icon: "⏳",
                title: "Time-Saving",
                desc: "Automates client greeting dispatches, due-date checklists, and compliance bulletins generation in seconds."
              },
              {
                icon: "🚀",
                title: "Competitive Edge",
                desc: "Presents a tech-savvy, state-of-the-art firm appearance that outshines traditional paper-based competitors."
              },
              {
                icon: "📈",
                title: "Lead Generation",
                desc: "Securely route online service inquiries and callbacks directly into your designated WhatsApp pipeline."
              }
            ].map((feat, idx) => (
              <FadeIn key={idx} delay={idx * 150} className="h-full">
                <div className="border border-white/20 rounded-xl p-5 bg-white/10 backdrop-blur-xs text-center h-full flex flex-col justify-center hover:bg-white/20 transition-all shadow-sm">
                  <span className="block text-3xl mb-3 drop-shadow-sm">{feat.icon}</span>
                  <h3 className="font-serif text-sm font-bold text-white mb-2 drop-shadow-sm">{feat.title}</h3>
                  <p className="text-[10px] text-sky-100 leading-relaxed font-sans">{feat.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TWO-PATH SECTION (WEBSITES VS POSTERS SPLIT OPTIONS) */}
      <section id="solutions-section" className="py-16 bg-slate-50 border-y border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy">
              Two Modern Solutions to Scale
            </h2>
            <p className="text-xs text-slate-500 max-w-xl mx-auto">
              Select one or combine both into a unified bundle to maximize client coverage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-4">
            {/* Website Path Card */}
            <div className="bg-white border-2 border-skyblue p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-left flex flex-col justify-between space-y-6 group relative overflow-hidden">
              <div className="space-y-3 relative z-10">
                <span className="text-4xl group-hover:scale-110 transition-transform inline-block drop-shadow-sm">💻</span>
                <h3 className="font-serif text-xl font-bold text-navy">Website Platform</h3>
                <p className="text-xs text-slate-600 leading-relaxed text-justify font-medium">
                  Launch a high-end, dynamic website template initialized for your firm. Update team biographies, showcase custom credentials, and accept client consultation inquiries.
                </p>
              </div>
              <button
                type="button"
                onClick={() => websitePricingRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="relative z-10 w-fit px-5 py-2.5 bg-skyblue hover:bg-navy text-white text-xs font-bold rounded-lg transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md uppercase tracking-wider"
              >
                See Website Plans <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>
            </div>

            {/* Poster Path Card */}
            <div className="bg-white border-2 border-[#0a1f44] p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-left flex flex-col justify-between space-y-6 group relative overflow-hidden">
              <div className="space-y-3 relative z-10">
                <span className="text-4xl group-hover:scale-110 transition-transform inline-block drop-shadow-sm">🎨</span>
                <h3 className="font-serif text-xl font-bold text-[#0a1f44]">Poster Platform</h3>
                <p className="text-xs text-slate-600 leading-relaxed text-justify font-medium">
                  Generate branded compliance announcements, tax rate briefs, and festival greeting posters automatically watermarked with your firm details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => posterPricingRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="relative z-10 w-fit px-5 py-2.5 bg-[#0a1f44] hover:bg-skyblue text-white text-xs font-bold rounded-lg transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md uppercase tracking-wider"
              >
                See Poster Plans <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WEBSITE PRICING TABLE (3 COLUMNS) */}
      <section ref={websitePricingRef} className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy">
            Website Platform Pricing
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            ICAI-compliant templates hosted on secure cloud environments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white border border-slate-300 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-400 transition-all duration-300 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Basic</h4>
                <div className="mt-2 flex items-baseline">
                  <span className="text-3xl font-serif font-bold text-navy">₹2,999</span>
                  <span className="text-slate-400 text-xs font-medium ml-1">/ year</span>
                </div>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-4 font-medium">
                <li className="flex items-start gap-2"><span className="text-skyblue">✓</span> Responsive One Page</li>
                <li className="flex items-start gap-2"><span className="text-skyblue">✓</span> Free Domain Name (1 year)</li>
                <li className="flex items-start gap-2"><span className="text-skyblue">✓</span> Social Media Integration</li>
                <li className="flex items-start gap-2"><span className="text-skyblue">✓</span> Responsive Mobile-Friendly Layout</li>
                <li className="flex items-start gap-2"><span className="text-skyblue">✓</span> Enquiry Form</li>
                <li className="flex items-start gap-2"><span className="text-skyblue">✓</span> 24/7 Customer Support</li>
              </ul>
            </div>
            <button
              onClick={() => selectPlanAndScroll("Basic Website Template")}
              className="w-full mt-6 py-2.5 bg-transparent hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-skyblue text-xs font-bold rounded-xl transition-all duration-300 uppercase tracking-wider"
            >
              Choose Basic
            </button>
          </div>

          {/* Pro Plan (Most Popular Highlighted) */}
          <div className="bg-white border-2 border-skyblue p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 relative flex flex-col justify-between z-10">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-skyblue text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-sm z-20 whitespace-nowrap">
              Most Popular
            </span>
            
            <div className="space-y-4 pt-2">
              <div>
                <h4 className="text-xs font-bold text-skyblue uppercase tracking-widest">Pro</h4>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-serif font-bold text-navy">₹6,999</span>
                  <span className="text-slate-400 text-xs font-medium ml-1">/ year</span>
                </div>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-4 font-medium">
                <li className="flex items-start gap-2"><span className="text-gold font-bold">★</span> <strong>Responsive Five Page</strong></li>
                <li className="flex items-start gap-2"><span className="text-skyblue">✓</span> Free Domain Name (1 year)</li>
                <li className="flex items-start gap-2"><span className="text-skyblue">✓</span> Social Media Integration</li>
                <li className="flex items-start gap-2"><span className="text-skyblue">✓</span> Whatsapp Chat Integration</li>
                <li className="flex items-start gap-2"><span className="text-skyblue">✓</span> Responsive Mobile-Friendly Layout</li>
                <li className="flex items-start gap-2"><span className="text-skyblue">✓</span> Enquiry Form</li>
                <li className="flex items-start gap-2"><span className="text-gold font-bold">★</span> <strong>24/7 Customer Priority Support</strong></li>
              </ul>
            </div>
            <button
              onClick={() => selectPlanAndScroll("Pro Website Template")}
              className="w-full mt-6 py-3 bg-skyblue hover:bg-navy text-white border border-transparent text-xs font-bold rounded-xl transition-all duration-300 uppercase tracking-wider shadow-lg hover:shadow-xl"
            >
              Choose Pro
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-white border-2 border-navy p-6 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-navy uppercase tracking-widest">Premium</h4>
                <div className="mt-2 flex items-baseline">
                  <span className="text-3xl font-serif font-bold text-navy">₹14,999</span>
                  <span className="text-slate-400 text-xs font-medium ml-1">/ year</span>
                </div>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-4 font-medium">
                <li className="flex items-start gap-2"><span className="text-navy">✓</span> <strong>Responsive Multi Pages (Customised)</strong></li>
                <li className="flex items-start gap-2"><span className="text-navy">✓</span> Free Domain Name (1 year)</li>
                <li className="flex items-start gap-2"><span className="text-navy">✓</span> GST, Income Tax latest Updates</li>
                <li className="flex items-start gap-2"><span className="text-navy">✓</span> Social Media Integration</li>
                <li className="flex items-start gap-2"><span className="text-navy">✓</span> Whatsapp Chat Integration</li>
                <li className="flex items-start gap-2"><span className="text-navy">✓</span> Responsive Mobile-Friendly Layout</li>
                <li className="flex items-start gap-2"><span className="text-navy">✓</span> Enquiry Form</li>
                <li className="flex items-start gap-2"><span className="text-navy">✓</span> <strong>24/7 Customer Priority Support</strong></li>
              </ul>
            </div>
            <button
              onClick={() => selectPlanAndScroll("Pro Max Website Template")}
              className="w-full mt-6 py-2.5 bg-navy hover:bg-skyblue text-white border border-transparent text-xs font-bold rounded-xl transition-all duration-300 uppercase tracking-wider shadow-md hover:shadow-lg"
            >
              Choose Premium
            </button>
          </div>
        </div>
      </section>

      {/* OUR CLIENTS SECTION */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy mb-2">
            Our Clients
          </h2>
          <p className="text-xs text-slate-500 mb-8 uppercase tracking-widest font-bold">
            (Click for Sample Website Templates)
          </p>
          <div className="flex justify-center items-center">
            <a 
              href="https://alphabetaconsultants.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-smooth flex items-center justify-center w-64 h-32 mx-auto group-hover:border-skyblue">
                <img 
                  src="/client-alpha-beta.png" 
                  alt="Alpha Beta Consultancy LLP" 
                  className="max-h-full max-w-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <p className="mt-4 text-xs font-bold text-slate-500 group-hover:text-skyblue transition-colors uppercase tracking-wider text-center">
                ALPHA BETA CONSULTANCY LLP
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* 6. POSTER PRICING TABLE (4 CATEGORIES IN GRID + BUNDLE CARD) */}
      <section ref={posterPricingRef} className="py-16 bg-white border-t border-b border-slate-200 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy">
              Poster Platform Pricing
            </h2>
            <p className="text-xs text-slate-500 mt-2 mb-6">
              Branded, compliance-oriented designs auto-filled with your firm credentials.
            </p>
            
            <div className="inline-flex bg-slate-100 p-1 rounded-full border border-slate-200">
              <button
                onClick={() => setPosterBillingPeriod("monthly")}
                className={`px-5 py-1.5 rounded-full text-[10px] font-bold transition-smooth uppercase tracking-wider ${
                  posterBillingPeriod === "monthly" ? "bg-skyblue text-white shadow-sm" : "text-slate-500 hover:text-skyblue"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPosterBillingPeriod("yearly")}
                className={`px-5 py-1.5 rounded-full text-[10px] font-bold transition-smooth uppercase tracking-wider ${
                  posterBillingPeriod === "yearly" ? "bg-skyblue text-white shadow-sm" : "text-slate-500 hover:text-skyblue"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          {/* 4 Category Cards in Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
            {[
              { cat: "Tax Updates", desc: "Weekly summaries of GST & Direct Tax notifications.", img: "/poster-tax-updates.png" },
              { cat: "Case Laws", desc: "Simplified case briefs from High Courts & ITAT.", img: "/poster-case-laws.png" },
              { cat: "Due Date Updates", desc: "Monthly compliance calendars & timeline alerts.", img: "/poster-due-date.png" },
              { cat: "Festival Cards", desc: "Holiday greetings branded with your firm logo.", img: "/poster-festivals.png" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border-2 border-skyblue p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-[#0a1f44] transition-all duration-300 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.cat}</h4>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-3xl font-serif font-bold text-navy">
                        {posterBillingPeriod === "monthly" ? "₹999" : "₹9,999"}
                      </span>
                      <span className="text-slate-400 text-xs font-medium ml-1">
                        / {posterBillingPeriod === "monthly" ? "month" : "year"}
                      </span>
                    </div>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-4 font-medium">
                    <li className="flex items-start gap-2"><span className="text-[#0a1f44]">✓</span> {item.desc}</li>
                    <li className="flex items-start gap-2"><span className="text-[#0a1f44]">✓</span> Unlimited Downloads</li>
                    <li className="flex items-start gap-2"><span className="text-[#0a1f44]">✓</span> Custom Firm Branding</li>
                    <li className="flex items-start gap-2"><span className="text-[#0a1f44]">✓</span> Shareable Formats</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => selectPlanAndScroll("Poster Platform Subscription")}
                  className="w-full mt-6 py-2.5 bg-skyblue hover:bg-navy text-white border border-transparent text-xs font-bold rounded-xl transition-all duration-300 uppercase tracking-wider shadow-sm hover:shadow-md"
                >
                  Enquire Now
                </button>
              </div>
            ))}
          </div>



          {/* Feature Icons Row */}
          <div className="max-w-4xl mx-auto pt-12 border-t border-slate-200 mt-12 grid grid-cols-2 md:grid-cols-5 gap-6 text-center text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <div>
              <span className="text-lg block mb-1">🚫</span>
              <span>Watermark Free</span>
            </div>
            <div>
              <span className="text-lg block mb-1">🔄</span>
              <span>Unlimited Posters</span>
            </div>
            <div>
              <span className="text-lg block mb-1">📐</span>
              <span>Custom Logo</span>
            </div>
            <div>
              <span className="text-lg block mb-1">✨</span>
              <span>Premium Designs</span>
            </div>
            <div className="col-span-2 md:col-span-1">
              <span className="text-lg block mb-1">📞</span>
              <span>Priority Support</span>
            </div>
          </div>

          {/* Sample Campaigns Showcase */}
          <div className="max-w-5xl mx-auto pt-16 mt-16 border-t border-slate-200">
            <div className="text-center mb-10">
              <h3 className="text-xl md:text-2xl font-serif font-bold text-navy">
                Sample Posters
              </h3>
              <p className="text-xs text-slate-500 mt-2">
                High-quality, compliance-ready designs ready to be branded with your firm's details.
              </p>
            </div>
            
            <div className="w-full py-8 max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {[
                  { img: '/sample-due-date-1.jpg', alt: 'Sample Due Date Poster 1' },
                  { img: '/sample-due-date-2.jpg', alt: 'Sample Due Date Poster 2' },
                  { img: '/sample-festival-1.jpg', alt: 'Sample Festival Poster 1' },
                  { img: '/sample-festival-2.jpg', alt: 'Sample Festival Poster 2' },
                  { img: '/sample-case-laws-1.jpg', alt: 'Sample Case Law Poster 1' }
                ].map((poster, idx) => (
                  <div key={`gallery-${idx}`} className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="overflow-hidden rounded-lg bg-slate-50 relative aspect-[4/5]">
                      <img 
                        src={poster.img} 
                        alt={poster.alt} 
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. SOCIAL PROOF / TRUST SECTION */}
      <section id="testimonials" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          
          <div className="space-y-3">
            <span className="inline-flex items-center text-[10px] font-bold text-skyblue bg-sky-50 px-3 py-1 rounded-full border border-sky-100 shadow-2xs">
              ⚡ 500+ CAs ONBOARDED
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy">
              Trusted by CAs & Legal Practitioners
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto text-left">
            {/* Testimonial 1 */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed text-justify">
                "Our firm's new dynamic web portal went live within 3 days. Our corporate auditing clients have praised the clean interface, and the custom intake forms have significantly streamlined our initial documentation gathering workflow."
              </p>
              <div className="border-t border-slate-200 pt-3 flex items-center space-x-3">
                <div className="h-8 w-8 bg-skyblue rounded-full text-white flex items-center justify-center font-bold text-xs uppercase">AM</div>
                <div>
                  <h4 className="text-xs font-bold text-navy">CA. Amit Mehta</h4>
                  <p className="text-[9px] text-slate-400">Senior Partner &bull; Mehta & Associates</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl space-y-4">
              <p className="text-xs text-slate-605 leading-relaxed text-justify">
                "We share branded tax compliance reminders to our client groups on WhatsApp weekly. The automated logo and phone placeholder positioning saves us hours of layout alignment work. The designs are incredibly professional."
              </p>
              <div className="border-t border-slate-200 pt-3 flex items-center space-x-3">
                <div className="h-8 w-8 bg-skyblue rounded-full text-white flex items-center justify-center font-bold text-xs uppercase">SI</div>
                <div>
                  <h4 className="text-xs font-bold text-navy">CA. Savitha Iyer</h4>
                  <p className="text-[9px] text-slate-400">Proprietor &bull; S. Iyer & Co</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 8. FINAL CTA SECTION (COMPETITOR FOCUSED) */}
      <section className="py-20 bg-gradient-to-r from-navy via-navy-light to-navy relative text-white text-center overflow-hidden border-t border-slate-800">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <h2 className="text-2xl md:text-4xl font-serif font-bold tracking-tight leading-tight">
            Your clients are already online. <br />
            Will they find you — or your competitor?
          </h2>
          <p className="text-xs text-slate-350 max-w-md mx-auto leading-relaxed font-light">
            Do not let traditional marketing bottlenecks hold your practice back. Initiate your digital onboarding setup today.
          </p>
          <button
            onClick={() => selectPlanAndScroll("Custom Bundle Plan")}
            className="px-6 py-3.5 bg-skyblue hover:bg-white hover:text-navy text-white font-bold text-xs rounded transition-smooth shadow-md uppercase tracking-wider focus-ring"
          >
            Build My Presence
          </button>
        </div>
      </section>

      {/* 9. INTEGRATED ONBOARDING INQUIRY FORM */}
      <section className="max-w-xl mx-auto px-4 py-16 scroll-mt-24">
        <form
          ref={contactFormRef}
          onSubmit={handleInquirySubmit}
          className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xl space-y-6"
        >
          <div className="text-center border-b border-slate-100 pb-4">
            <h3 className="font-serif text-lg font-bold text-navy">
              Initiate Onboarding Inquiry
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Submit your package preference and details to connect with our onboarding team.
            </p>
          </div>

          {successMsg && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs p-3 rounded">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-xs p-3 rounded">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4 text-left">
            <div>
              <label className="block text-[9px] font-bold text-navy uppercase tracking-wider mb-1">
                Select Package Preference *
              </label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50 text-navy font-semibold"
              >
                <option value="Basic Website Template">Basic Website Template (₹2,999/Year)</option>
                <option value="Pro Website Template">Pro Website Template (₹6,999/Year)</option>
                <option value="Pro Max Website Template">Pro Max Website Template (₹14,999/Year)</option>
                <option value="Poster Platform Subscription">Poster Platform Subscription (Enquire)</option>
                <option value="Social Media Handling Plan">Social Media Management (Enquire)</option>
                <option value="Custom Bundle Plan">Custom Bundle Plan (Website + Banners)</option>
                <option value="General Digital Enquiry">General Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-navy uppercase tracking-wider mb-1">
                Practitioner Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CA. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50 text-navy"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-navy uppercase tracking-wider mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50 text-navy"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-navy uppercase tracking-wider mb-1">
                Inquiry Details (Optional)
              </label>
              <textarea
                placeholder="Details of preferred .in or .com domains, or specific designs updates concerns..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50 text-navy leading-relaxed"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-navy hover:bg-skyblue text-white hover:text-navy border border-navy hover:border-skyblue text-xs font-bold rounded transition-smooth shadow uppercase tracking-widest focus-ring"
          >
            {loading ? "Registering..." : "Submit to WhatsApp"}
          </button>
        </form>
      </section>



    </div>
  );
}
