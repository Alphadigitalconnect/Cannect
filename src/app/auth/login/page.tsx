"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    setLoading(true);
    setError("");

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
      <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-lg shadow-sm space-y-6">
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
              Professional Email Address
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
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Please contact support at support@cannect.in to reset your password.");
                }}
                className="text-[10px] text-slate-500 hover:text-skyblue hover:underline font-medium"
              >
                Forgot Password?
              </a>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-skyblue hover:bg-navy hover:text-white text-white font-bold text-xs rounded transition-smooth shadow-sm focus-ring uppercase tracking-wider"
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>

        {/* Seed helper message to make checking the portal easier */}
        <div className="border-t border-slate-100 pt-4 bg-slate-50 p-3 rounded border text-[11px] text-slate-600">
          <span className="font-semibold text-navy block mb-1">Testing Credentials:</span>
          <span>Email: <strong>ca.rahul@example.com</strong><br />Password: <strong>password123</strong></span>
        </div>

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
