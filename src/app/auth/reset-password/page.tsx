"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-lg shadow-sm space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center mb-4">
            <img src="/logo.png" alt="CAnnect Logo" className="h-14 w-auto object-contain mx-auto" />
          </Link>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-navy">
            Create New Password
          </h2>
        </div>

        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-xs p-3 rounded">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs p-3 rounded text-center">
            <p className="font-semibold text-sm mb-1">Password Reset Successful!</p>
            <p>You can now log in with your new password. Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                disabled={!token}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                disabled={!token}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-2.5 bg-skyblue hover:bg-navy hover:text-white text-white font-bold text-xs rounded transition-smooth shadow-sm focus-ring uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
