"use client";

import React, { useState, useEffect, useRef } from "react";

// Intersection Observer Scene Wrapper
interface SceneProps {
  children: (isActive: boolean) => React.ReactNode;
}

function Scene({ children }: SceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setIsActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
      },
      {
        threshold: 0.25,
        rootMargin: "-10% 0px -15% 0px"
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div ref={ref} className="w-full">
      {children(isActive)}
    </div>
  );
}

// Features metadata (Sky Blue gradients instead of slate dark)
const features = [
  {
    id: 1,
    title: "All-in-One CA & Client Portal",
    description: "A secure, unified entry point for both Chartered Accountants and their clients. Eliminates fragmented communications across SMS, emails, and spreadsheet logs.",
    badge: "Unified Workspace",
    mockupType: "portal"
  },
  {
    id: 2,
    title: "One Dashboard for All Clients",
    description: "Get real-time operational oversight. View filing statuses, pending documentation requests, and chronological audits for your complete client roster in a single consolidated screen.",
    badge: "Practice Control",
    mockupType: "dashboard"
  },
  {
    id: 3,
    title: "Automated Due-Date Reminders",
    description: "Never miss a statutory filing window. The platform tracks tax deadlines (GST, ROC, ITR) and automatically triggers SMS, WhatsApp, and email alerts to clients for document submissions.",
    badge: "Compliance Assurance",
    mockupType: "reminders"
  },
  {
    id: 4,
    title: "Centralized Data Collection",
    description: "Frictionless, secure document vaults. Clients upload TDS certificates, bank records, and challans directly into dedicated tax year folders, with structural audit trails.",
    badge: "Secure Document Vault",
    mockupType: "storage"
  },
  {
    id: 5,
    title: "Integrated Invoicing & Follow-Up",
    description: "Draft professional invoices linked to compliance tasks. Automatically schedule gentle payment reminders for completed statutory audits and filings, saving administrative hours.",
    badge: "Billing Automation",
    mockupType: "invoicing"
  },
  {
    id: 6,
    title: "Unified Scheduling & Secure Mail",
    description: "Schedule consultations, engage via encrypted chat, and send official email notifications, all without exposing personal mobile numbers or moving off-platform.",
    badge: "Secure Communication",
    mockupType: "messaging"
  }
];

export default function AppTeaserPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleNotifyMe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/app-teaser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Request failed.");
      }

      setMessage(data.message);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  // Sub-component to render stylized mockup dashboard representations inside a device frame
  const renderMockup = (type: string, isActive: boolean) => {
    const activeClass = isActive ? "opacity-100 scale-100 translate-y-0" : "opacity-40 scale-95 translate-y-4";
    
    return (
      <div className={`w-full max-w-md mx-auto aspect-[16/10] bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-2xl relative overflow-hidden transition-all duration-700 ease-out ${activeClass}`}>
        {/* Device Header Bar */}
        <div className="flex items-center space-x-1.5 border-b border-slate-800 pb-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-rose-450"></div>
          <div className="h-2 w-2 rounded-full bg-amber-450"></div>
          <div className="h-2 w-2 rounded-full bg-emerald-450"></div>
          <div className="text-[8px] text-slate-500 font-mono pl-2">cannect-portal.app</div>
        </div>

        {/* Mockup Screen Details */}
        {type === "portal" && (
          <div className="grid grid-cols-12 gap-2 h-[82%] text-[9px] text-slate-300">
            {/* Sidebar */}
            <div className="col-span-3 border-r border-slate-800 pr-2 space-y-1">
              <div className="h-2 w-full bg-skyblue/20 rounded"></div>
              <div className="h-1.5 w-3/4 bg-slate-800 rounded"></div>
              <div className="h-1.5 w-1/2 bg-slate-800 rounded"></div>
              <div className="h-1.5 w-2/3 bg-slate-800 rounded mt-4"></div>
            </div>
            {/* Chat/Interface Panel */}
            <div className="col-span-9 flex flex-col justify-between h-full bg-slate-950 p-2 rounded border border-slate-800">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[7px] text-slate-400 font-semibold">
                  <span>Audit Chat Session</span>
                  <span className="text-skyblue font-bold">Secure AES-256</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-1.5 rounded max-w-[80%] text-[8px] text-slate-300 shadow-xs">
                  Please upload the signed Board Resolutions for FY26 Q4 audit reconciliation.
                </div>
                <div className="bg-skyblue/10 border border-skyblue/20 p-1.5 rounded max-w-[80%] ml-auto text-[8px] text-sky-200 font-medium">
                  Sure CA Rahul, uploading resolution.pdf (512 KB) right now.
                </div>
              </div>
              <div className="h-4 bg-slate-900 border border-slate-800 rounded flex items-center px-1.5 justify-between">
                <span className="text-slate-500 text-[7px]">Type secure reply...</span>
                <span className="h-2 w-2 rounded bg-skyblue"></span>
              </div>
            </div>
          </div>
        )}

        {type === "dashboard" && (
          <div className="h-[82%] space-y-3 text-[9px] text-slate-300">
            <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
              <span className="font-semibold text-white">Client Directory Oversight</span>
              <span className="text-[7px] text-slate-400 font-bold">6 Active Files</span>
            </div>
            <div className="space-y-1.5">
              <div className="grid grid-cols-12 gap-2 items-center p-1.5 bg-slate-950 rounded border border-slate-800 border-l-2 border-l-skyblue">
                <span className="col-span-4 text-white truncate font-semibold">Acme Industries Ltd</span>
                <span className="col-span-4 text-slate-400 font-mono text-[8px]">GST Return</span>
                <span className="col-span-4 text-right text-skyblue font-bold">Pending Review</span>
              </div>
              <div className="grid grid-cols-12 gap-2 items-center p-1.5 bg-slate-900 border border-slate-850 rounded">
                <span className="col-span-4 text-slate-300 truncate font-semibold">Pooja Builders & Devs</span>
                <span className="col-span-4 text-slate-400 font-mono text-[8px]">ITR-6 Filing</span>
                <span className="col-span-4 text-right text-emerald-500 font-bold">Approved</span>
              </div>
              <div className="grid grid-cols-12 gap-2 items-center p-1.5 bg-slate-900 border border-slate-850 rounded">
                <span className="col-span-4 text-slate-300 truncate font-semibold">TechnoSoft Solutions LLP</span>
                <span className="col-span-4 text-slate-400 font-mono text-[8px]">MCA Annual Return</span>
                <span className="col-span-4 text-right text-amber-500 font-bold">In Progress</span>
              </div>
            </div>
          </div>
        )}

        {type === "reminders" && (
          <div className="h-[82%] text-[9px] text-slate-300 space-y-2.5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1">
              <span className="text-white font-bold">Due-Date Compliance Reminders</span>
              <span className="text-[7.5px] text-skyblue">August Checklist</span>
            </div>
            
            {/* Reminders List */}
            <div className="space-y-1.5">
              <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white">GSTR-3B Filing Reminder</div>
                  <div className="text-[7.5px] text-slate-450">Due date: Aug 20</div>
                </div>
                <span className="text-[7.5px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold uppercase tracking-wider">SMS Vetted</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white font-sans">TDS Deposit Challen 281</div>
                  <div className="text-[7.5px] text-slate-450 font-sans">Due date: Aug 07</div>
                </div>
                <span className="text-[7.5px] bg-skyblue/10 text-skyblue px-1.5 py-0.5 rounded border border-skyblue/20 font-bold uppercase tracking-wider">WhatsApp Vetted</span>
              </div>
            </div>
          </div>
        )}

        {type === "storage" && (
          <div className="h-[82%] text-[9px] text-slate-300 space-y-2">
            <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
              <span className="font-semibold text-white">Secure Storage / Document Vault</span>
              <span className="text-skyblue text-[8px] font-bold">Client Resolving</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center space-y-1">
                <span className="text-[7px] text-slate-500 block uppercase tracking-wider">Income Tax ITD</span>
                <span className="text-white font-semibold block text-[7.5px]">FY 2025-26</span>
                <span className="text-[6.5px] text-slate-400 block font-mono">14 Files uploaded</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center space-y-1">
                <span className="text-[7px] text-slate-500 block uppercase tracking-wider">GST Audit Files</span>
                <span className="text-white font-semibold block text-[7.5px]">Q2 Reconciliations</span>
                <span className="text-[6.5px] text-slate-400 block font-mono">8 Files uploaded</span>
              </div>
            </div>
          </div>
        )}

        {type === "invoicing" && (
          <div className="h-[82%] text-[9px] text-slate-300 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
              <span className="font-bold text-white">Billing & Invoicing Panel</span>
              <span className="text-emerald-500 font-bold">₹18,500 Collected</span>
            </div>
            <div className="space-y-1.5">
              <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-white font-semibold block">Inv #2026-089 (GST Filing)</span>
                  <span className="text-[7px] text-slate-500 font-mono">Sent to CA Priya Iyer</span>
                </div>
                <span className="text-[8px] text-emerald-400 font-bold font-sans">Paid</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-white font-semibold block">Inv #2026-090 (ROC Compliance)</span>
                  <span className="text-[7px] text-slate-500 font-mono">Sent to CA Priya Iyer</span>
                </div>
                <span className="text-[8px] text-amber-400 font-bold font-sans">Pending</span>
              </div>
            </div>
          </div>
        )}

        {type === "messaging" && (
          <div className="h-[82%] text-[9px] text-slate-300 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-white font-bold">Video Consultations</span>
              <span className="h-1.5 w-1.5 rounded-full bg-skyblue"></span>
            </div>
            
            {/* Scheduler Card */}
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-bold">Audit Alignment Session</span>
                <span className="text-[7px] text-skyblue bg-skyblue/10 px-1.5 py-0.5 rounded font-bold border border-skyblue/20">Scheduled</span>
              </div>
              <p className="text-slate-400 text-[7px] leading-tight">
                Scheduled for Aug 18 at 11:30 AM IST. Virtual room credentials sent to CA Rahul & Client Partner.
              </p>
              <button type="button" className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 text-[7.5px] py-1 rounded">
                Open Meeting Link
              </button>
            </div>
          </div>
        )}

        {/* Ambient Glows */}
        <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-sky-450/5 blur-xl"></div>
        <div className="absolute -top-8 -left-8 h-20 w-20 rounded-full bg-sky-400/5 blur-xl"></div>
      </div>
    );
  };

  return (
    <div className="bg-slate-950 text-slate-100 font-sans overflow-x-hidden">
      
      {/* 1. HERO SCENE */}
      <section className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-950 to-slate-900 relative px-4 py-8">
        {/* Glow Element */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 md:w-96 h-72 md:h-96 rounded-full bg-skyblue/10 blur-[80px] md:blur-[120px] pointer-events-none z-0"></div>

        <div className="h-10"></div>

        {/* Hero Content */}
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10 my-auto">
          {/* Pulsing Badge */}
          <div>
            <span className="inline-flex items-center space-x-2 border border-skyblue/20 text-skyblue bg-skyblue/10 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-skyblue"></span>
              <span>Launching Soon</span>
            </span>
          </div>

          <h1 className="text-4xl md:text-7xl font-sans font-extrabold tracking-tight text-white leading-tight">
            CAnnect App
          </h1>
          
          <p className="text-sm md:text-lg text-slate-300 max-w-xl mx-auto font-light leading-relaxed">
            The all-in-one portal connecting Chartered Accountants and their clients.
          </p>

          <div className="pt-8 max-w-sm mx-auto opacity-75">
            <div className="h-1 bg-gradient-to-r from-transparent via-sky-400/40 to-transparent w-full"></div>
          </div>
        </div>

        {/* Scroll Cue */}
        <div className="text-center space-y-2 z-10 animate-bounce">
          <span className="text-[10px] text-slate-455 uppercase tracking-widest block font-bold">
            Scroll to Explore
          </span>
          <svg className="h-4 w-4 text-skyblue mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* 2. SCROLL REVEAL FEATURE SEQUENCE */}
      {features.map((feature, idx) => (
        <Scene key={feature.id}>
          {(isActive) => (
            <section className={`min-h-screen flex items-center justify-center py-20 px-4 md:px-8 bg-gradient-to-b ${
              feature.id % 2 === 0 ? "from-slate-900 to-slate-950" : "from-slate-950 to-slate-900"
            } transition-colors duration-1000 border-b border-slate-900`}>
              <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Visual Representation (Left Column on Desktop) - Staggered entrance */}
                <div className={`lg:col-span-6 transition-all duration-700 delay-100 ease-out ${
                  isActive ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
                }`}>
                  {renderMockup(feature.mockupType, isActive)}
                </div>

                {/* Content description (Right Column on Desktop) - Staggered entrance */}
                <div className="lg:col-span-6 space-y-4">
                  <div className={`transition-all duration-700 delay-300 ease-out ${
                    isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"
                  }`}>
                    <span className="text-[10px] md:text-xs font-bold text-skyblue uppercase tracking-wider">
                      {feature.badge}
                    </span>
                  </div>

                  <h2 className={`text-2xl md:text-4xl font-sans font-extrabold text-white tracking-tight leading-snug transition-all duration-700 delay-400 ease-out ${
                    isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"
                  }`}>
                    {feature.title}
                  </h2>

                  <p className={`text-xs md:text-sm text-slate-350 leading-relaxed text-justify transition-all duration-700 delay-500 ease-out ${
                    isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"
                  }`}>
                    {feature.description}
                  </p>
                </div>
              </div>
            </section>
          )}
        </Scene>
      ))}

      {/* 3. RECAP / SUMMARY STRIP */}
      <section className="py-20 bg-slate-950 border-b border-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-bold text-skyblue uppercase tracking-wider bg-skyblue/10 px-2 py-0.5 rounded border border-skyblue/20">
              Feature Matrix
            </span>
            <h2 className="text-2xl md:text-4xl font-sans font-extrabold tracking-tight text-white">
              An All-in-One Collaboration Suite
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every system built to modernize, secure, and accelerate CA practices in India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feat) => (
              <div
                key={feat.id}
                className="bg-slate-900 border border-slate-800 p-6 rounded-lg hover:border-skyblue/40 hover:bg-slate-850 transition-smooth space-y-3 relative group shadow-sm"
              >
                <div className="absolute top-4 right-4 text-slate-650 font-mono text-[9px] group-hover:text-skyblue transition-smooth font-bold">
                  0{feat.id}
                </div>
                <h3 className="font-sans text-sm font-bold text-white tracking-wide">
                  {feat.title.replace("Automated ", "")}
                </h3>
                <p className="text-[11px] text-slate-300 leading-relaxed text-justify">
                  {feat.description.split(".")[0]}.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CLOSING CTA SECTION */}
      <section className="py-24 bg-slate-900 relative px-4">
        {/* Glow Element */}
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-skyblue/5 blur-[100px] pointer-events-none z-0"></div>

        <div className="max-w-md mx-auto text-center space-y-6 relative z-10 border border-slate-800 p-8 rounded-lg bg-slate-950 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-sans font-extrabold text-white tracking-tight">
            Get Notified On Launch
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Be among the first Chartered Accountants and clients to experience the updated CAnnect ecosystem. Register for private beta slots today.
          </p>

          <form onSubmit={handleNotifyMe} className="space-y-3">
            <input
              type="email"
              required
              placeholder="Enter your professional email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs p-3 bg-slate-900 border border-slate-800 rounded focus-ring text-white placeholder-slate-500 focus:border-skyblue"
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-skyblue hover:bg-sky-600 text-white font-bold text-xs rounded transition-smooth shadow-md focus-ring uppercase tracking-wider"
            >
              {loading ? "Registering..." : "Notify Me"}
            </button>
          </form>

          {message && (
            <div className="bg-emerald-950/40 text-emerald-400 text-xs p-3 rounded border border-emerald-800/30">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-rose-950/40 text-rose-450 text-xs p-3 rounded border border-rose-800/30">
              {error}
            </div>
          )}

          <div className="pt-2">
            <p className="text-[10px] text-slate-450 leading-relaxed">
              *Private beta invites are limited. Priority is allocated strictly to active directory firm partners.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
