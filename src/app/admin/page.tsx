"use client";

import React, { useState, useEffect } from "react";
import Logo from "@/components/Logo";
import { ADMIN_EMAIL } from "@/lib/admin";

export default function AdminPage() {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [authState, setAuthState] = useState<"loading" | "not_logged_in" | "not_admin" | "authorized">("loading");

  const [activeTab, setActiveTab] = useState("verifications");
  const [dbData, setDbData] = useState<any>({ users: [], firms: [], articles: [], events: [] });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Article Form State
  const [articleForm, setArticleForm] = useState({
    id: "",
    title: "",
    slug: "",
    excerpt: "",
    category: "GST & Indirect Tax",
    author: "",
    content: ""
  });
  const [showArticleForm, setShowArticleForm] = useState(false);

  // Event Form State
  const [eventForm, setEventForm] = useState({
    id: "",
    title: "",
    date: "",
    time: "",
    mode: "Online",
    location: "Zoom Conferencing",
    cpeHours: "3",
    description: "",
    status: "Upcoming"
  });
  const [showEventForm, setShowEventForm] = useState(false);

  // Check logged-in user's role on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("cannect_user");
    if (!storedUser) {
      setAuthState("not_logged_in");
      setLoading(false);
      return;
    }
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.role === "admin" && parsed.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setAdminUser(parsed);
        setAuthState("authorized");
        fetchDbData(parsed.id);
      } else {
        setAdminUser(parsed);
        setAuthState("not_admin");
        setLoading(false);
      }
    } catch (e) {
      setAuthState("not_logged_in");
      setLoading(false);
    }
  }, []);

  const fetchDbData = async (userId?: string) => {
    const uid = userId || adminUser?.id;
    if (!uid) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/data?userId=${uid}`);
      const data = await res.json();
      if (res.ok) {
        setDbData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Toggle CA Verification
  const handleToggleVerification = async (userId: string, currentStatus: boolean) => {
    setActionLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/firms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isVerified: !currentStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message);
        fetchDbData();
      } else {
        setErrorMsg(data.error);
      }
    } catch (e) {
      setErrorMsg("Failed to execute status change.");
    } finally {
      setActionLoading(false);
    }
  };

  // Save/Update Article
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(articleForm)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message);
        setShowArticleForm(false);
        setArticleForm({
          id: "",
          title: "",
          slug: "",
          excerpt: "",
          category: "GST & Indirect Tax",
          author: "",
          content: ""
        });
        fetchDbData();
      } else {
        setErrorMsg(data.error);
      }
    } catch (e) {
      setErrorMsg("Failed to write article.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Article
  const handleDeleteArticle = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    setActionLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/articles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message);
        fetchDbData();
      } else {
        setErrorMsg(data.error);
      }
    } catch (e) {
      setErrorMsg("Deletion failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // Save/Update Event
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventForm)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message);
        setShowEventForm(false);
        setEventForm({
          id: "",
          title: "",
          date: "",
          time: "",
          mode: "Online",
          location: "Zoom Conferencing",
          cpeHours: "3",
          description: "",
          status: "Upcoming"
        });
        fetchDbData();
      } else {
        setErrorMsg(data.error);
      }
    } catch (e) {
      setErrorMsg("Failed to save event details.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setActionLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message);
        fetchDbData();
      } else {
        setErrorMsg(data.error);
      }
    } catch (e) {
      setErrorMsg("Event deletion failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // Pre-fill Forms for Edit
  const openEditArticle = (art: any) => {
    setArticleForm({
      id: art.id,
      title: art.title,
      slug: art.slug,
      excerpt: art.excerpt,
      category: art.category,
      author: art.author,
      content: art.content
    });
    setShowArticleForm(true);
  };

  const openEditEvent = (ev: any) => {
    setEventForm({
      id: ev.id,
      title: ev.title,
      date: ev.date,
      time: ev.time,
      mode: ev.mode,
      location: ev.location,
      cpeHours: String(ev.cpeHours),
      description: ev.description,
      status: ev.status
    });
    setShowEventForm(true);
  };

  // Access Control Gate
  if (authState === "loading") {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center font-sans text-navy">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-skyblue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-slate-500">Verifying admin credentials...</p>
        </div>
      </div>
    );
  }

  if (authState === "not_logged_in") {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center px-4 font-sans text-navy">
        <div className="bg-white border border-slate-200 p-10 rounded-2xl shadow-md w-full max-w-md space-y-6 text-center">
          <Logo className="justify-center" darkText={true} />
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto text-3xl">
            🔒
          </div>
          <h1 className="text-lg font-bold text-navy uppercase tracking-wide">
            Authentication Required
          </h1>
          <p className="text-slate-500 text-sm">
            You need to sign in with an admin account to access this panel.
          </p>
          <a
            href="/auth/login"
            className="inline-block px-6 py-2.5 bg-skyblue hover:bg-navy text-white font-bold text-xs uppercase tracking-widest rounded transition-all shadow-md"
          >
            Sign In &rarr;
          </a>
        </div>
      </div>
    );
  }

  if (authState === "not_admin") {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center px-4 font-sans text-navy">
        <div className="bg-white border border-slate-200 p-10 rounded-2xl shadow-md w-full max-w-md space-y-6 text-center">
          <Logo className="justify-center" darkText={true} />
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto text-3xl">
            ⛔
          </div>
          <h1 className="text-lg font-bold text-navy uppercase tracking-wide">
            Access Denied
          </h1>
          <p className="text-slate-500 text-sm">
            This area is restricted to platform administrators only. Your account ({adminUser?.email}) does not have admin privileges.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-2.5 bg-skyblue hover:bg-navy text-white font-bold text-xs uppercase tracking-widest rounded transition-all shadow-md"
          >
            &larr; Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans text-navy">
      {/* Admin Subheader Panel */}
      <section className="bg-navy border-b border-gold/15 py-8 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <Logo />
            <div className="h-8 w-px bg-slate-700 hidden md:block"></div>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-widest text-skyblue">
                Operations Management Suite
              </h1>
              <p className="text-[10px] text-slate-400">Database updates synchronise in real-time.</p>
            </div>
          </div>
          <a
            href="/dashboard"
            className="px-4 py-2 border border-slate-600 hover:border-skyblue hover:text-skyblue text-slate-200 font-bold text-[10px] rounded uppercase tracking-wider transition-smooth"
          >
            &larr; Back to Dashboard
          </a>
        </div>
      </section>

      {/* Main Operations Frame */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Success/Error Alerts */}
        {successMsg && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs p-3 rounded mb-6 flex justify-between items-center shadow-xs">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg("")} className="font-bold text-[10px] hover:underline">&times; Close</button>
          </div>
        )}
        {errorMsg && (
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-xs p-3 rounded mb-6 flex justify-between items-center shadow-xs">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg("")} className="font-bold text-[10px] hover:underline">&times; Close</button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2 mb-8 overflow-x-auto pb-1.5">
          <button
            onClick={() => setActiveTab("verifications")}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-smooth rounded-t whitespace-nowrap ${
              activeTab === "verifications"
                ? "bg-white border-t border-x border-slate-200 text-navy border-b-2 border-b-skyblue"
                : "text-slate-500 hover:text-skyblue hover:bg-slate-100"
            }`}
          >
            Firm Verifications ({dbData.users.length})
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-smooth rounded-t whitespace-nowrap ${
              activeTab === "events"
                ? "bg-white border-t border-x border-slate-200 text-navy border-b-2 border-b-skyblue"
                : "text-slate-500 hover:text-navy hover:bg-slate-100"
            }`}
          >
            CPE Programs & Meets ({dbData.events.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-xs text-slate-500">
            Synchronising database collection records...
          </div>
        ) : (
          <div>
            {/* TAB 1: VERIFICATIONS */}
            {activeTab === "verifications" && (
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h2 className="font-serif text-sm font-bold text-navy uppercase tracking-wider">
                    CA Members & Practice Listing Directory
                  </h2>
                  <button
                    onClick={() => fetchDbData()}
                    className="text-[10px] bg-white border border-slate-300 hover:bg-slate-100 font-bold px-3 py-1.5 rounded transition-smooth"
                  >
                    Force Refresh
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/60 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <th className="p-4">CA Name</th>
                        <th className="p-4">ICAI No.</th>
                        <th className="p-4">Firm Name</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Registered Email</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dbData.users.map((member: any) => {
                        const matchingFirm = dbData.firms.find((f: any) => f.userId === member.id);
                        const isVerified = member.verified === true || (matchingFirm && matchingFirm.verified === true);
                        return (
                          <tr key={member.id} className="hover:bg-slate-550/5 hover:bg-slate-50/50">
                            <td className="p-4 font-bold text-navy">{member.caName}</td>
                            <td className="p-4 font-mono">{member.membershipNo}</td>
                            <td className="p-4 font-medium text-slate-600">
                              {matchingFirm ? matchingFirm.firmName : <span className="italic text-slate-400">No firm listed</span>}
                            </td>
                            <td className="p-4 text-slate-500">
                              {member.city}, {member.state}
                            </td>
                            <td className="p-4 text-slate-500 font-mono">{member.email}</td>
                            <td className="p-4 text-center">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  isVerified
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-250 border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-250 border-amber-200"
                                }`}
                              >
                                {isVerified ? "Verified" : "Pending"}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                disabled={actionLoading}
                                onClick={() => handleToggleVerification(member.id, isVerified)}
                                className={`text-[10px] font-bold px-3 py-1.5 rounded transition-smooth shadow-xs border ${
                                  isVerified
                                    ? "bg-amber-550 border-amber-300 text-amber-800 hover:bg-amber-100"
                                    : "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700"
                                }`}
                              >
                                {isVerified ? "Revoke Verification" : "Approve CA"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {dbData.users.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-10 text-slate-400">No member accounts listed in database.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: EVENTS CMS */}
            {activeTab === "events" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded shadow-sm">
                  <span className="font-serif text-sm font-bold text-navy uppercase tracking-wider">
                    CPE CPE Hours & Peer Meet Registries
                  </span>
                  <button
                    onClick={() => {
                      setEventForm({
                        id: "",
                        title: "",
                        date: "",
                        time: "",
                        mode: "Online",
                        location: "Zoom Online Platform",
                        cpeHours: "3",
                        description: "",
                        status: "Upcoming"
                      });
                      setShowEventForm(!showEventForm);
                    }}
                    className="px-4 py-2 bg-navy text-skyblue hover:bg-skyblue hover:text-white border border-navy hover:border-skyblue text-xs font-bold rounded transition-smooth shadow-sm uppercase tracking-wider"
                  >
                    {showEventForm ? "Collapse Publishing Console" : "Add New Event"}
                  </button>
                </div>

                {showEventForm && (
                  <form
                    onSubmit={handleSaveEvent}
                    className="bg-white border border-slate-250 border-slate-300 p-6 rounded-lg shadow-md space-y-4"
                  >
                    <h3 className="font-serif text-sm font-bold text-navy border-b border-gold/15 pb-2">
                      {eventForm.id ? "Edit Program Specifications" : "Register New Continuing Education (CPE) Event"}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1">
                          CPE Seminar Title *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Masterclass in GST Anti-Profiteering Litigations"
                          value={eventForm.title}
                          onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1">
                          CPE Credits Offered *
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          max={30}
                          value={eventForm.cpeHours}
                          onChange={(e) => setEventForm({ ...eventForm, cpeHours: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1">
                          Event Date *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. August 24, 2026"
                          value={eventForm.date}
                          onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1">
                          Time *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 10:00 AM - 01:00 PM IST"
                          value={eventForm.time}
                          onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1">
                          Status Category *
                        </label>
                        <select
                          value={eventForm.status}
                          onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
                        >
                          <option value="Upcoming">Upcoming (Active / Registration open)</option>
                          <option value="Past">Past (Concluded Program Gallery)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1">
                          Seminar Category *
                        </label>
                        <select
                          value={eventForm.location.includes("ICAI") ? "ICAI" : "CAnnect"}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "ICAI") {
                              setEventForm({
                                ...eventForm,
                                location: "ICAI Chapter Auditorium"
                              });
                            } else {
                              setEventForm({
                                ...eventForm,
                                location: "CAnnect Platform Room"
                              });
                            }
                          }}
                          className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
                        >
                          <option value="ICAI">ICAI Official CPE Seminar</option>
                          <option value="CAnnect">CAnnect Community Meet</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1">
                          Program Mode *
                        </label>
                        <select
                          value={eventForm.mode}
                          onChange={(e) => setEventForm({ ...eventForm, mode: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
                        >
                          <option value="Online">Online Webinar (Zoom/Teams)</option>
                          <option value="In-Person">In-Person Seminar</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1">
                          Location Details *
                        </label>
                        <input
                          type="text"
                          required
                          value={eventForm.location}
                          onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1">
                        Seminar Outline / Description *
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Brief summary of syllabus points, speakers list, and eligibility..."
                        value={eventForm.description}
                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowEventForm(false)}
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded transition-smooth uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded transition-smooth uppercase tracking-wider shadow"
                      >
                        {eventForm.id ? "Apply Edit Changes" : "Publish Event"}
                      </button>
                    </div>
                  </form>
                )}

                <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100/60 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          <th className="p-4">Event Date</th>
                          <th className="p-4">Seminar Title</th>
                          <th className="p-4">Credits</th>
                          <th className="p-4">Mode / Location</th>
                          <th className="p-4 text-center">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dbData.events.map((ev: any) => (
                          <tr key={ev.id} className="hover:bg-slate-50/50">
                            <td className="p-4 font-mono text-slate-500">{ev.date}</td>
                            <td className="p-4 font-bold text-navy">{ev.title}</td>
                            <td className="p-4 font-mono font-bold text-skyblue-dark">{ev.cpeHours} CPE</td>
                            <td className="p-4 text-slate-600">
                              <span className="font-bold text-[10px] text-slate-400 mr-2">[{ev.mode}]</span>
                              {ev.location}
                            </td>
                            <td className="p-4 text-center">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  ev.status === "Upcoming"
                                    ? "bg-sky-50 text-sky-700 border border-sky-200"
                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                                }`}
                              >
                                {ev.status}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button
                                onClick={() => openEditEvent(ev)}
                                className="text-[10px] font-bold bg-white border border-slate-350 border-slate-300 hover:bg-slate-100 text-navy px-3.5 py-1.5 rounded transition-smooth shadow-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(ev.id)}
                                className="text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 px-3.5 py-1.5 rounded transition-smooth shadow-xs border border-rose-200"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                        {dbData.events.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-10 text-slate-400">No events listed in the database.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
