"use client";

import React from "react";

export default function HeroNetworkVisual() {
  // Coordinates in percentage for the SVG connecting lines and node positions
  // 1: Center CA, 2: Top Center, 3: Top Right, 4: Upper Right, 5: Mid Right, 6: Bottom Right, 7: Bottom Center, 8: Mid Left
  const nodes = [
    {
      id: "center",
      x: 58,
      y: 46,
      name: "CA. Rajesh Sharma",
      role: "Tax | Advisory | Audit",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      isCenter: true,
      size: "w-14 h-14 md:w-16 md:h-16",
    },
    {
      id: "top-center",
      x: 50,
      y: 12,
      name: "CA. Amit Verma",
      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80",
      size: "w-8 h-8 md:w-10 md:h-10",
    },
    {
      id: "top-right",
      x: 82,
      y: 10,
      name: "CA. Vikram Singhania",
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80",
      size: "w-8 h-8 md:w-10 md:h-10",
    },
    {
      id: "mid-right-upper",
      x: 90,
      y: 28,
      name: "CA. Priya Kapoor",
      img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80",
      size: "w-8 h-8 md:w-9 md:h-9",
    },
    {
      id: "mid-right-lower",
      x: 98,
      y: 48,
      name: "CA. Sneha Patel",
      img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80",
      size: "w-8 h-8 md:w-10 md:h-10",
    },
    {
      id: "bottom-right",
      x: 88,
      y: 78,
      name: "CA. Sandeep Jain",
      img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80",
      size: "w-8 h-8 md:w-10 md:h-10",
    },
    {
      id: "bottom-center",
      x: 52,
      y: 76,
      name: "CA. Neha Mehta",
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80",
      size: "w-8 h-8 md:w-9 md:h-9",
    },
    {
      id: "mid-left",
      x: 44,
      y: 44,
      name: "CA. Kunal Roy",
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80",
      size: "w-8 h-8 md:w-9 md:h-9",
    },
  ];

  return (
    <div className="relative w-full h-[380px] sm:h-[420px] md:h-[460px] flex items-center justify-center select-none overflow-visible">
      {/* Background subtle radial glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/40 via-blue-50/20 to-transparent rounded-full filter blur-2xl pointer-events-none" />

      {/* Floating Card: Build Your Professional Network */}
      <div className="absolute top-2 right-2 sm:right-4 z-20 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition-smooth flex items-center gap-3">
        <div className="text-left">
          <span className="block text-[11px] text-slate-500 font-medium">Build Your</span>
          <span className="block text-xs font-bold text-navy">Professional Network</span>
        </div>
        <div className="flex items-end gap-1 h-5 w-5 pb-0.5 justify-center">
          <span className="w-1 bg-sky-300 h-2 rounded-t-sm"></span>
          <span className="w-1 bg-sky-400 h-3.5 rounded-t-sm"></span>
          <span className="w-1 bg-blue-600 h-5 rounded-t-sm"></span>
        </div>
      </div>

      {/* SVG Connection Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Lines between network nodes */}
        <line x1="58" y1="46" x2="50" y2="12" stroke="url(#lineGrad)" strokeWidth="0.5" strokeDasharray="1.5 1" />
        <line x1="50" y1="12" x2="82" y2="10" stroke="url(#lineGrad)" strokeWidth="0.5" strokeDasharray="1.5 1" />
        <line x1="82" y1="10" x2="90" y2="28" stroke="url(#lineGrad)" strokeWidth="0.5" strokeDasharray="1.5 1" />
        <line x1="90" y1="28" x2="98" y2="48" stroke="url(#lineGrad)" strokeWidth="0.5" strokeDasharray="1.5 1" />
        <line x1="58" y1="46" x2="90" y2="28" stroke="url(#lineGrad)" strokeWidth="0.5" strokeDasharray="1.5 1" />
        <line x1="58" y1="46" x2="98" y2="48" stroke="url(#lineGrad)" strokeWidth="0.5" strokeDasharray="1.5 1" />
        <line x1="98" y1="48" x2="88" y2="78" stroke="url(#lineGrad)" strokeWidth="0.5" strokeDasharray="1.5 1" />
        <line x1="58" y1="46" x2="88" y2="78" stroke="url(#lineGrad)" strokeWidth="0.5" strokeDasharray="1.5 1" />
        <line x1="58" y1="46" x2="52" y2="76" stroke="url(#lineGrad)" strokeWidth="0.5" strokeDasharray="1.5 1" />
        <line x1="58" y1="46" x2="44" y2="44" stroke="url(#lineGrad)" strokeWidth="0.5" strokeDasharray="1.5 1" />
        <line x1="44" y1="44" x2="50" y2="12" stroke="url(#lineGrad)" strokeWidth="0.5" strokeDasharray="1.5 1" />

        {/* Small subtle connection points */}
        {[
          [58, 46], [50, 12], [82, 10], [90, 28], [98, 48], [88, 78], [52, 76], [44, 44]
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="0.9" fill="#38bdf8" opacity="0.6" />
        ))}
      </svg>

      {/* Nodes / Avatars */}
      {nodes.map((node) => {
        if (node.isCenter) {
          return (
            <div
              key={node.id}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              {/* Center Profile Picture with glowing ring */}
              <div className="relative">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-sky-300 shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={node.img}
                    alt={node.name}
                    className="w-full h-full object-cover rounded-full bg-slate-100"
                  />
                </div>
                {/* Online indicator */}
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>

              {/* Central Details Card Popup */}
              <div className="mt-2 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-lg px-3 py-1.5 shadow-md flex items-center gap-2 group-hover:shadow-lg transition-smooth">
                <span className="bg-blue-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded tracking-wide">
                  CA
                </span>
                <span className="text-[11px] font-medium text-slate-700 whitespace-nowrap">
                  {node.role}
                </span>
              </div>
            </div>
          );
        }

        return (
          <div
            key={node.id}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            title={node.name}
          >
            <div
              className={`${node.size} rounded-full p-0.5 bg-white border border-sky-200 shadow-sm hover:border-blue-500 hover:shadow-md hover:scale-110 transition-transform duration-300 overflow-hidden`}
            >
              <img
                src={node.img}
                alt={node.name}
                className="w-full h-full object-cover rounded-full bg-slate-100"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
