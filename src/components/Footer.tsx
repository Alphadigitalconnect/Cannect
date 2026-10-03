"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import TermsModal from "@/components/TermsModal";

export default function Footer() {
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <>
      <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-6">
          {/* Top Row: Logo, Nav Links, Socials & Copyright */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="inline-block">
                <Logo darkText={true} />
              </Link>
            </div>

            {/* Center Navigation Links */}
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-600">
              <Link href="/about" className="hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link href="/events" className="hover:text-blue-600 transition-colors">
                Events
              </Link>
              <Link href="/go-digital" className="hover:text-blue-600 transition-colors">
                Go Digital
              </Link>
              <Link href="/app-teaser" className="hover:text-blue-600 transition-colors">
                CAnnect App
              </Link>
              <button
                onClick={() => setTermsOpen(true)}
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setTermsOpen(true)}
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                Terms &amp; Conditions
              </button>
              <a
                href="mailto:alphadigitalconnect@gmail.com"
                className="hover:text-blue-600 transition-colors"
              >
                Contact
              </a>
            </nav>

            {/* Right: Social Icons and Copyright */}
            <div className="flex flex-col items-center lg:items-end gap-2">
              <div className="flex items-center space-x-4 text-slate-500">
                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </a>
                {/* Twitter / X */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors"
                  aria-label="Twitter / X"
                >
                  <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rose-600 transition-colors"
                  aria-label="YouTube"
                >
                  <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-600 transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                  </svg>
                </a>
              </div>
              <span className="text-[11px] text-slate-400">
                &copy; {new Date().getFullYear()} CAnnect. All rights reserved.
              </span>
            </div>
          </div>

          {/* Bottom Regulatory Disclaimer */}
          <div className="pt-4 border-t border-slate-150">
            <p className="text-[10px] text-slate-400 leading-relaxed text-justify">
              <strong>Regulatory Disclaimer:</strong> CAnnect is an independent professional community platform designed to foster connection, information sharing, and collaboration among Chartered Accountants in India. It is not affiliated with, sponsored by, or endorsed by the Institute of Chartered Accountants of India (ICAI). In compliance with the Chartered Accountants Act, 1949 and the ICAI Code of Ethics, directory listings of members and firms do not constitute advertising or solicitation.
            </p>
          </div>
        </div>
      </footer>

      {/* Terms and Privacy Modal */}
      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
    </>
  );
}
