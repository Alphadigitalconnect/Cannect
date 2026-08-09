import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="bg-navy border-t border-slate-800 text-slate-300 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand and Tagline */}
          <div className="space-y-4">
            <Link href="/" className="inline-block opacity-95">
              <Logo darkText={false} />
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 mt-4">
              India's premier professional network designed exclusively for Chartered Accountants. Linking practice, knowledge, and community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Platform
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-skyblue transition-smooth text-xs">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-skyblue transition-smooth text-xs">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-skyblue transition-smooth text-xs">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/go-digital" className="hover:text-skyblue transition-smooth text-xs">
                  Go Digital (Practice Websites)
                </Link>
              </li>
              <li>
                <Link href="/app-teaser" className="hover:text-skyblue transition-smooth text-xs">
                  CAnnect Client App
                </Link>
              </li>
            </ul>
          </div>



          {/* Contact Details */}
          <div>
            <h3 className="font-serif text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Contact
            </h3>
            <p className="text-xs text-slate-400 mb-2 leading-relaxed">
              Location: Banjara hills, Hyderabad, 500034
            </p>
            <p className="text-xs text-slate-400 mb-4">
              Contact: <a href="mailto:alphadigitalconnect@gmail.com" className="text-skyblue hover:underline">alphadigitalconnect@gmail.com</a>
            </p>
          </div>
        </div>

        {/* Regulatory Disclaimer and Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800 space-y-4">
          <p className="text-[11px] text-slate-400 leading-relaxed text-justify">
            <strong>Regulatory Disclaimer:</strong> CAnnect is an independent professional community platform designed to foster connection, information sharing, and collaboration among Chartered Accountants in India. It is not affiliated with, sponsored by, or endorsed by the Institute of Chartered Accountants of India (ICAI). In compliance with the Chartered Accountants Act, 1949 and the ICAI Code of Ethics, the directory listings of members and firms do not constitute professional advertising, solicitation, or an offer to secure professional work. Users of this platform are advised to verify the credentials and status of any practitioner independently.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-2">
            <p>&copy; {new Date().getFullYear()} CAnnect India. All rights reserved.</p>
            <div className="flex space-x-4 mt-2 sm:mt-0">
              <a href="#" className="hover:underline">Terms of Use</a>
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Code of Conduct</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
