"use client";

import React from "react";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";

export default function EventsPage() {
  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">
      
      {/* 1. Hero Announcement Header */}
      <section className="bg-navy border-b border-slate-900 py-16 md:py-24 relative overflow-hidden text-white">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#0b9bf5_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>
        
        {/* Faded Background Events Image Banner with Dark overlay */}
        <div className="absolute inset-0 opacity-25 pointer-events-none z-0 overflow-hidden select-none">
          <div className="absolute inset-0 bg-gradient-to-b from-navy/40 via-navy/70 to-navy z-10"></div>
          <img
            src="/banner-events.png"
            alt="Chartered Accountants Networking Meetup"
            className="w-full h-full object-cover object-center mix-blend-overlay"
          />
        </div>
        
        {/* Glow Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-skyblue/10 rounded-full blur-3xl pointer-events-none z-0"></div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-6">
          <span className="inline-flex items-center space-x-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-white bg-white/10 px-3 py-1 rounded-full border border-white/20 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
            <span>Coming Soon exclusively in Hyderabad</span>
          </span>
          
          <h1 className="text-3xl md:text-5xl font-serif font-extrabold tracking-tight leading-tight max-w-3xl mx-auto opacity-0 animate-fadeIn">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-white to-slate-100 bg-[length:200%_auto] animate-shimmer inline-block">
              Something Big is Brewing
            </span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-skyblue via-sky-300 to-skyblue bg-[length:200%_auto] animate-shimmer inline-block">
              in Hyderabad
            </span>
          </h1>

          <p className="text-slate-300 text-sm md:text-lg leading-relaxed max-w-2xl mx-auto font-light">
            Hyderabad's first-ever networking event exclusively for 1st Gen CA Practitioners is almost here.
          </p>

          <div className="pt-4">
            <div className="inline-flex items-center space-x-2 bg-skyblue text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded shadow-lg border border-skyblue hover:bg-white hover:text-navy hover:border-white transition-smooth">
              <span>📍 Date & Venue — Coming Soon. Stay Tuned</span>
            </div>
          </div>
        </div>
      </section>
      {/* 2. Event Vision & Details Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          {/* Background Image with Dark Overlay */}
          <div className="absolute inset-0 z-0 bg-navy">
            <img 
              src="/event-networking-2.jpg" 
              alt="Networking Background" 
              className="w-full h-full object-cover opacity-40" 
            />
            {/* Gradient overlay to ensure text readability while keeping image visible */}
            <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/50 to-navy/80 z-10"></div>
          </div>

          <FadeIn>
            <div className="relative z-30 max-w-4xl mx-auto px-4 text-center">
            <p className="text-sm md:text-base text-slate-300 leading-relaxed font-light mb-8 max-w-2xl mx-auto">
              We are bringing together Chartered Accountants across India, beginning with First Generation Chartered Accountants in practice.
            </p>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl text-left max-w-lg mx-auto relative overflow-hidden mb-12">
              <div className="absolute top-0 right-0 w-32 h-32 bg-skyblue/20 rounded-full blur-3xl -z-10"></div>
              
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <span className="text-skyblue mt-0.5">✦</span>
                  <span className="text-sm text-slate-300 font-medium">Connect peers across regions</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-skyblue mt-0.5">✦</span>
                  <span className="text-sm text-slate-300 font-medium">Share specialisations and expertise</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-skyblue mt-0.5">✦</span>
                  <span className="text-sm text-slate-300 font-medium">Collaborate on client work to build stronger networks</span>
                </li>
              </ul>
            </div>

            <div className="space-y-8 max-w-3xl mx-auto">
              <p className="text-lg md:text-xl text-white font-medium leading-relaxed">
                <span className="text-2xl mr-2 align-middle">🚀</span>
                This is the first step towards creating the <strong className="text-skyblue font-bold">Indian BIG 4</strong> — a movement where independent practitioners unite to scale their impact.
              </p>
              
              <div className="space-y-2">
                <p className="text-base text-slate-300">
                  <span className="text-amber-400 mr-1">✨</span> Stay tuned for dates and venues!
                </p>
                <p className="text-sm text-slate-400">
                  Be part of this journey to connect, collaborate, and grow together.
                </p>
              </div>
            </div>
            </div>
          </FadeIn>
        </section>

      {/* 3. Secondary Section ("Beyond Hyderabad") */}
        <section className="bg-white border-t border-b border-slate-200 py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h2 className="text-2xl font-serif font-bold text-navy">
                  Beyond Hyderabad
                </h2>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-light">
                  This is just the beginning. More events are on the way, PAN India. Follow us to be the first to know when we launch in your city.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl space-y-4">
                <h3 className="font-serif text-xs font-bold text-navy">
                  Get Notified For Your City
                </h3>
                
                <form onSubmit={(e) => { e.preventDefault(); alert("Thanks! We'll notify you as soon as a meetup planning begins in your city."); }} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Enter your City (e.g. Mumbai, Bengaluru)"
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded focus:ring text-navy placeholder-slate-400 font-medium"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Enter your Email address"
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded focus:ring text-navy placeholder-slate-400 font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-navy hover:bg-skyblue text-white text-xs font-bold uppercase tracking-wider rounded transition-smooth shadow-sm"
                  >
                    Request Meetup
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

    </div>
  );
}
