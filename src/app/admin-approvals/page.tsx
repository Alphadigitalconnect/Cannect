"use client";

import React, { useState, useEffect } from "react";
import Logo from "@/components/Logo";
import StaggeredFadeIn from "@/components/StaggeredFadeIn";

export default function AdminApprovalsPage() {
  const [pin, setPin] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState("");

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Load Auth state from sessionStorage on mount
  useEffect(() => {
    const auth = sessionStorage.getItem("cannect_admin_auth");
    if (auth === "true") {
      setIsAuthorized(true);
      fetchPendingUsers();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/approvals");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "250402") {
      sessionStorage.setItem("cannect_admin_auth", "true");
      setIsAuthorized(true);
      setAuthError("");
      fetchPendingUsers();
    } else {
      setAuthError("Incorrect security code.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("cannect_admin_auth");
    setIsAuthorized(false);
    setPin("");
  };

  const handleAction = async (userId: string, status: "approved" | "rejected") => {
    if (status === "rejected" && !confirm("Are you sure you want to reject this user?")) return;
    
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, status })
      });
      if (res.ok) {
        // Remove user from the list
        setUsers(users.filter(u => u.id !== userId));
      } else {
        alert("Action failed. Please try again.");
      }
    } catch (e) {
      alert("Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center px-4 font-sans text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-skyblue/20 via-slate-900 to-slate-900"></div>
        <form
          onSubmit={handlePinSubmit}
          className="relative bg-white/10 backdrop-blur-md border border-white/20 p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-8"
        >
          <div className="text-center">
            <Logo className="justify-center scale-110" />
            <h1 className="text-xl font-bold text-white tracking-widest uppercase mt-6 drop-shadow-sm">
              Approval Gateway
            </h1>
            <p className="text-slate-300 text-sm mt-2 font-light">
              Restricted Area. Enter Admin Passcode.
            </p>
          </div>

          {authError && (
            <div className="bg-rose-500/20 border-l-4 border-rose-500 text-rose-200 p-3 rounded text-sm">
              {authError}
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">
              Passcode
            </label>
            <input
              type="password"
              required
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full text-center text-2xl p-4 bg-black/30 border border-white/20 rounded-xl focus:border-skyblue focus:ring-1 focus:ring-skyblue text-white tracking-widest transition-all outline-none"
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-skyblue to-blue-500 hover:from-blue-500 hover:to-skyblue text-white font-bold text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-skyblue/30 transform hover:-translate-y-0.5"
          >
            Authenticate &rarr;
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-navy">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Logo />
            <div className="h-6 w-px bg-slate-300"></div>
            <div>
              <h1 className="text-sm font-extrabold uppercase tracking-widest text-slate-800">
                Approvals Queue
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">Review new CA registrations</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors uppercase tracking-wider"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-navy tracking-tight">Pending Requests</h2>
            <p className="text-slate-500 mt-1">
              There are <strong className="text-skyblue">{users.length}</strong> users waiting for approval.
            </p>
          </div>
          <button
            onClick={fetchPendingUsers}
            disabled={loading}
            className="px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-skyblue transition-all"
          >
            {loading ? "Refreshing..." : "Refresh Queue"}
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white h-48 rounded-2xl shadow-sm border border-slate-100 animate-pulse"></div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ✓
            </div>
            <h3 className="text-xl font-bold text-navy mb-2">You're all caught up!</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              There are no pending registrations in the queue. New sign-ups will appear here automatically.
            </p>
          </div>
        ) : (
          <StaggeredFadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {users.map(user => (
                <div key={user.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-skyblue/10 text-skyblue rounded-xl flex items-center justify-center font-bold text-xl">
                        {user.caName.charAt(0)}
                      </div>
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-amber-200">
                        Pending
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-navy">{user.caName}</h3>
                    <p className="text-xs text-slate-500 mb-4">{user.email}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-400">ICAI No.</span>
                        <span className="font-mono font-medium text-slate-700">{user.membershipNo}</span>
                      </div>
                      {user.firmName && (
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                          <span className="text-slate-400">Firm</span>
                          <span className="font-medium text-slate-700 text-right max-w-[60%] truncate" title={user.firmName}>
                            {user.firmName}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-400">Location</span>
                        <span className="font-medium text-slate-700">{user.city}, {user.state}</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="text-slate-400">Experience</span>
                        <span className="font-medium text-slate-700">{user.yearsOfPractice} years</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleAction(user.id, "rejected")}
                      disabled={actionLoading}
                      className="py-2.5 rounded-xl text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 text-xs font-bold transition-colors uppercase tracking-wider"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(user.id, "approved")}
                      disabled={actionLoading}
                      className="py-2.5 rounded-xl text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm shadow-emerald-200 text-xs font-bold transition-all transform hover:-translate-y-0.5 uppercase tracking-wider"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </StaggeredFadeIn>
        )}
      </main>
    </div>
  );
}
