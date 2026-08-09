"use client";

import React, { useState, useEffect } from "react";
import { EventItem } from "@/lib/db";

interface EventsPortalClientProps {
  initialEvents: EventItem[];
}

export default function EventsPortalClient({ initialEvents }: EventsPortalClientProps) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // RSVP Form States
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpEmail, setRsvpEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rsvpSuccessMsg, setRsvpSuccessMsg] = useState("");

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("cannect_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUser(u);
        setRsvpName(u.caName || "");
        setRsvpEmail(u.email || "");
      } catch (e) {
        console.error("Error reading stored user:", e);
      }
    }
  }, []);

  const openRsvpModal = (event: EventItem) => {
    setSelectedEvent(event);
    setRsvpSuccessMsg("");
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/events?id=${selectedEvent.id}&action=rsvp`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: rsvpEmail, name: rsvpName })
      });
      const data = await res.json();

      if (res.ok) {
        // Save locally to persist state for this user
        const rsvps = JSON.parse(localStorage.getItem(`cannect_rsvp_${selectedEvent.id}`) || "[]");
        rsvps.push({ email: rsvpEmail, name: rsvpName });
        localStorage.setItem(`cannect_rsvp_${selectedEvent.id}`, JSON.stringify(rsvps));

        setRsvpSuccessMsg(`RSVP confirmed! Registration credentials have been sent to ${rsvpEmail}.`);
        
        // Refresh event data
        const updated = events.map((ev) => {
          if (ev.id === selectedEvent.id) {
            return { ...ev, rsvps: [...(ev.rsvps || []), rsvpEmail] };
          }
          return ev;
        });
        setEvents(updated);
      } else {
        alert(data.error || "Failed to register RSVP.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong during RSVP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const upcomingEvents = events.filter((e) => e.status === "Upcoming");
  const pastEvents = events.filter((e) => e.status === "Past");

  return (
    <div className="space-y-8">
      {/* Tabs Selector */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`pb-4 text-sm font-sans font-bold tracking-wide border-b-2 transition-smooth ${
              activeTab === "upcoming"
                ? "border-skyblue text-navy"
                : "border-transparent text-slate-400 hover:text-skyblue hover:border-skyblue/30"
            }`}
          >
            Upcoming CAnnect Events ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`pb-4 text-sm font-sans font-bold tracking-wide border-b-2 transition-smooth ${
              activeTab === "past"
                ? "border-skyblue text-navy"
                : "border-transparent text-slate-400 hover:text-skyblue hover:border-skyblue/30"
            }`}
          >
            Past Events Gallery ({pastEvents.length})
          </button>
        </div>
      </div>

      {/* Upcoming Events Grid */}
      {activeTab === "upcoming" && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-200 pb-2">
            <div className="h-2 w-2 rounded-full bg-skyblue"></div>
            <h3 className="font-serif text-base font-bold text-navy uppercase tracking-wider">
              CAnnect Community Webinars & Meets
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {upcomingEvents.map((event) => {
              const isRegistered = typeof window !== "undefined" && 
                JSON.parse(localStorage.getItem(`cannect_rsvp_${event.id}`) || "[]")
                  .some((r: any) => r.email === (user?.email || ""));

              return (
                <div
                  key={event.id}
                  className="bg-white border border-slate-200 rounded p-6 md:p-8 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold tracking-wider text-skyblue bg-sky-50 px-2.5 py-0.5 rounded border border-sky-100 uppercase">
                        {event.mode} Meeting
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-navy mb-2">
                      {event.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed text-justify">
                      {event.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mb-6 text-xs text-slate-500">
                      <div>
                        <span className="block font-semibold text-slate-400 text-[10px] uppercase">Date & Time</span>
                        <span className="font-medium text-navy">{event.date}</span>
                        <span className="block text-[10px]">{event.time}</span>
                      </div>
                      <div>
                        <span className="block font-semibold text-slate-400 text-[10px] uppercase">Location</span>
                        <span className="font-medium text-navy">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 italic">
                      Includes peer networking session.
                    </span>
                    {isRegistered ? (
                      <span className="inline-flex items-center space-x-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1.5 rounded">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Registered</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => openRsvpModal(event)}
                        className="px-4 py-2 bg-skyblue text-white hover:bg-navy border border-skyblue hover:border-navy text-xs font-semibold rounded transition-smooth shadow-sm focus-ring"
                      >
                        RSVP / Register
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Events Gallery */}
      {activeTab === "past" && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-200 pb-2">
            <div className="h-2 w-2 rounded-full bg-skyblue"></div>
            <h3 className="font-serif text-base font-bold text-navy uppercase tracking-wider">
              Concluded CAnnect Conferences
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div className="bg-slate-50 h-40 flex items-center justify-center relative px-6 text-center border-b border-slate-200">
                  <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#0b9bf5_1px,transparent_1px)] [background-size:12px_12px]"></div>
                  <span className="font-serif text-sm font-bold text-navy tracking-tight relative z-10">
                    {event.title.split(":")[0]}
                  </span>
                </div>
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase mb-2">
                      Concluded: {event.date}
                    </div>
                    <h3 className="font-serif text-sm font-bold text-navy mb-2">
                      {event.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 text-justify">
                      {event.description}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span>CAnnect Series</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RSVP Modal Overlay */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full shadow-2xl overflow-hidden relative">
            {/* Modal Header */}
            <div className="bg-white text-navy p-6 border-b border-slate-200">
              <h3 className="font-serif text-lg font-bold text-navy">
                Confirm Registration
              </h3>
              <p className="text-xs text-slate-650 mt-1 line-clamp-1">
                {selectedEvent.title}
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {rsvpSuccessMsg ? (
                <div className="space-y-4 text-center">
                  <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-navy">Registration Logged</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {rsvpSuccessMsg}
                  </p>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="w-full mt-4 bg-skyblue hover:bg-navy text-white text-xs font-semibold py-2 rounded transition-smooth"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                      Chartered Accountant Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CA. Rahul Sharma"
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded focus-ring bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                      Professional Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@firm.in"
                      value={rsvpEmail}
                      onChange={(e) => setRsvpEmail(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded focus-ring bg-slate-50"
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 leading-relaxed border-l-2 border-skyblue pl-2">
                    By submitting this RSVP, you declare that you hold a valid membership card or Certificate of Practice.
                  </div>
                  <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(null)}
                      className="text-xs text-slate-500 hover:text-navy px-3 py-2 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-skyblue hover:bg-navy text-white border border-skyblue hover:border-navy px-4 py-2 text-xs font-bold rounded shadow transition-smooth"
                    >
                      {isSubmitting ? "Processing..." : "Confirm RSVP"}
                    </button>
                  </div>
                </form>
              )}
            </div>
            
            {/* Close Button Top Right */}
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-navy"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
