import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-white min-h-[70vh] flex items-center justify-center py-20 px-4 text-navy relative">
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#0b9bf5_1px,transparent_1px)] [background-size:20px_20px]"></div>
      
      <div className="max-w-md w-full text-center space-y-6 relative z-10 border border-slate-200 p-8 rounded-lg bg-white shadow-md">
        <span className="inline-flex items-center text-[10px] font-bold text-skyblue uppercase tracking-widest bg-skyblue/10 px-2.5 py-1 rounded border border-skyblue/25">
          Error Code: 404
        </span>
        
        <h1 className="text-3xl font-serif font-bold text-navy tracking-tight leading-tight">
          Resource Not Found
        </h1>
        
        <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-light">
          The regulatory resource, member directory profile, or update page you are attempting to access could not be located. It may have been re-indexed, archived, or removed in compliance with platform audits.
        </p>
 
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 bg-skyblue hover:bg-navy text-white font-bold text-xs rounded transition-smooth"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
