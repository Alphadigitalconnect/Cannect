"use client";

import React from "react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-150 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-skyblue"></span>
            <h2 className="font-serif text-base font-bold text-navy">
              CAnnect Platform Terms & Privacy Guidelines
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-navy hover:bg-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600 leading-relaxed">
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 text-sky-900">
            <h4 className="font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>🛡️</span> Key Commitment: Your Privacy & Profile Visibility
            </h4>
            <p className="text-[11px] leading-relaxed">
              By accessing CAnnect, you consent to sharing your verified professional profile (Name, Firm, Specialisations, City) with other registered Chartered Accountants for professional collaboration and peer referral.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-serif font-bold text-navy text-sm mb-1">
                1. Information Shared in the Directory
              </h3>
              <p>
                When you register, your name, firm affiliation, areas of specialisation, city, state, and years of practice will be visible in the internal Pan-India CA directory. This allows colleagues across India to discover your practice strengths for mutual referrals and advisory.
              </p>
            </div>

            <div>
              <h3 className="font-serif font-bold text-navy text-sm mb-1">
                2. Strict Contact Information Safeguard
              </h3>
              <p>
                Your direct phone number and email address are never exposed publicly on directory listings or network summaries. Direct contact details are strictly revealed only when you connect with a fellow practitioner and they view your profile inside the platform. You may also toggle your account to private mode at any time in Profile Settings.
              </p>
            </div>

            <div>
              <h3 className="font-serif font-bold text-navy text-sm mb-1">
                3. Zero Commercial Solicitation & No-Spam Rule
              </h3>
              <p>
                CAnnect is strictly an internal peer networking and knowledge exchange platform. Using member directories for unsolicited marketing, bulk spamming, automated scraping, or commercial client solicitation is strictly prohibited and will lead to immediate account termination.
              </p>
            </div>

            <div>
              <h3 className="font-serif font-bold text-navy text-sm mb-1">
                4. Compliance with ICAI Code of Ethics
              </h3>
              <p>
                In compliance with the Chartered Accountants Act, 1949 and guidelines issued by the Institute of Chartered Accountants of India (ICAI), listings on this platform do not constitute professional advertising or an offer to secure audit work from the public.
              </p>
            </div>

            <div>
              <h3 className="font-serif font-bold text-navy text-sm mb-1">
                5. Community Content & Discussions
              </h3>
              <p>
                When posting case law interpretations, queries, or practice experiences, members must maintain confidentiality regarding sensitive client identification particulars.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-150 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-navy hover:bg-skyblue text-white font-bold text-xs rounded-lg transition-colors uppercase tracking-wider"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}
