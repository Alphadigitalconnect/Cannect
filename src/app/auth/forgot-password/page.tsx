"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [simulatedLink, setSimulatedLink] = useState(""); // Only for testing without real email

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setSimulatedLink("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process request.");
      }

      setSuccess(true);
      if (data._simulatedLink) {
        setSimulatedLink(data._simulatedLink);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-lg shadow-sm space-y-6">
        {/* Title */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center mb-4">
            <img src="/logo.png" alt="CAnnect Logo" className="h-14 w-auto object-contain mx-auto" />
          </Link>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-navy">
            Reset Your Password
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-xs p-3 rounded">
            {error}
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs p-3 rounded space-y-2">
            <p>If an account exists with that email, a password reset link has been sent.</p>
            {simulatedLink && (
              <div className="mt-3 pt-3 border-t border-emerald-200">
                <p className="font-semibold text-[10px] uppercase tracking-wider text-emerald-700 mb-1">Simulated Email Link (For Testing):</p>
                <a href={simulatedLink} className="text-blue-600 underline break-all font-medium">
                  Click here to reset password
                </a>
              </div>
            )}
          </div>
        )}

        {/* Forgot Password Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                Registered Email Address
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-skyblue hover:bg-navy hover:text-white text-white font-bold text-xs rounded transition-smooth shadow-sm focus-ring uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
          <Link href="/auth/login" className="text-navy font-semibold hover:text-skyblue hover:underline">
            &larr; Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
