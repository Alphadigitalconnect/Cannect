"use client";

import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function RegisterTypePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4">
        <h2 className="text-center text-2xl font-serif font-extrabold text-black">
          Registration Type
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Please select your membership status to continue.
        </p>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-10 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/auth/register?cop=true"
              className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-200 rounded-xl hover:border-skyblue hover:bg-skyblue transition-all duration-300 cursor-pointer text-center shadow-sm hover:shadow-lg"
            >
              <div className="h-16 w-16 bg-skyblue/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-white transition-all shadow-sm">
                <svg className="h-8 w-8 text-skyblue group-hover:text-skyblue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-navy group-hover:text-white mb-2 transition-colors">Certificate of Practice</h3>
              <p className="text-xs text-slate-500 group-hover:text-white/90 transition-colors">I have a valid CoP and wish to register my practicing firm.</p>
            </Link>

            <Link
              href="/auth/register?cop=false"
              className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-200 rounded-xl hover:border-skyblue hover:bg-skyblue transition-all duration-300 cursor-pointer text-center shadow-sm hover:shadow-lg"
            >
              <div className="h-16 w-16 bg-skyblue/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-white transition-all shadow-sm">
                <svg className="h-8 w-8 text-skyblue group-hover:text-skyblue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-navy group-hover:text-white mb-2 transition-colors">No Certificate of Practice</h3>
              <p className="text-xs text-slate-500 group-hover:text-white/90 transition-colors">I am a CA member looking to connect, but I do not have a CoP.</p>
            </Link>
          </div>

          <div className="mt-8 text-center text-sm">
            <Link href="/" className="text-skyblue hover:text-navy transition-smooth font-medium">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
