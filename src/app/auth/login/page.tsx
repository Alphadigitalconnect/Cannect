"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TermsModal from "@/components/TermsModal";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    const user = localStorage.getItem("cannect_user");
    if (user) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreedToTerms) {
      setError("Please consent to the Terms & Privacy sharing agreement before signing in.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      // Save user session in localStorage
      localStorage.setItem("cannect_user", JSON.stringify(data.user));
      // Dispatch custom event to notify Navbar
      window.dispatchEvent(new Event("cannect_login_state"));
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
      
      <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-2xl shadow-sm space-y-6">
        {/* Title */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center mb-4">
            <img src="/logo.png" alt="CAnnect Logo" className="h-14 w-auto object-contain mx-auto" />
          </Link>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-navy">
            Sign In to Your Account
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your firm profile and the Pan-India member directory.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-xs p-3 rounded">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. ca.name@firm.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-navy uppercase tracking-wider">
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-[10px] text-slate-500 hover:text-skyblue hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
            />
          </div>

          {/* Privacy and Sharing Consent Agreement */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-skyblue focus:ring-skyblue cursor-pointer accent-skyblue"
            />
            <label htmlFor="terms" className="text-[11px] text-slate-600 leading-snug cursor-pointer select-none">
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-skyblue font-bold underline hover:text-navy"
              >
                Terms of Service & Privacy Policy
              </button>
              , and consent to sharing my professional profile with verified CAs on CAnnect.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-skyblue hover:bg-navy hover:text-white text-white font-bold text-xs rounded transition-smooth shadow-sm focus-ring uppercase tracking-wider disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>


        {/* Register CTA */}
        <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
          <span>New to CAnnect? </span>
          <Link href="/auth/register-type" className="text-navy font-semibold hover:text-skyblue hover:underline">
            Register &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
