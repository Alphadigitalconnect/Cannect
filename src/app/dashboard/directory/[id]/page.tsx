"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Firm } from "@/lib/db";

interface PageProps {
  params: {
    id: string;
  };
}

export default function FirmDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [firm, setFirm] = useState<Firm | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Connection Modal state
  const [showModal, setShowModal] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [inquiryMsg, setInquiryMsg] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Verify user is logged in
    const storedUser = localStorage.getItem("cannect_user");
    if (!storedUser) {
      router.push("/auth/login");
      return;
    }
    
    const loggedUser = JSON.parse(storedUser);
    setCurrentUser(loggedUser);
    setSenderName(loggedUser.caName || loggedUser.name || "");
    setSenderEmail(loggedUser.email || "");
    setSenderPhone(loggedUser.phone || "");

    const fetchFirmDetails = async () => {
      try {
        const res = await fetch(`/api/firms/${params.id}`);
        const data = await res.json();
        
        if (res.ok && data.firm) {
          setFirm(data.firm);
          
          // Check connection status
          try {
            const connRes = await fetch(`/api/connections?userId=${loggedUser.id}`);
            const connData = await connRes.json();
            if (connRes.ok && connData.accepted) {
              const isConn = connData.accepted.some((c: any) => c.userId === data.firm.userId);
              setIsConnected(isConn);
            }
          } catch (e) {
            console.error("Failed to fetch connection status", e);
          }
        } else {
          router.push("/dashboard/directory");
        }
      } catch (err) {
        console.error("Error loading firm details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFirmDetails();
  }, [params.id, router]);

  // Mask function helpers
  const maskEmail = (email: string) => {
    if (!email) return "";
    const parts = email.split("@");
    if (parts.length < 2) return email;
    const name = parts[0];
    const maskedName = name.length > 2 ? name.substring(0, 2) + "*****" : name + "*****";
    return maskedName + "@" + parts[1];
  };

  const maskPhone = (phone: string) => {
    if (!phone) return "Not provided";
    const clean = phone.trim();
    if (clean.length < 5) return "*****";
    return clean.substring(0, 4) + "******" + clean.substring(clean.length - 2);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/firms/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName,
          senderEmail,
          senderPhone,
          message: inquiryMsg
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Inquiry submission failed.");
      }

      setSuccessMsg(data.message);
      setInquiryMsg("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">
        Retrieving member profile...
      </div>
    );
  }

  if (!firm) return null;

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs">
          <Link
            href="/dashboard/directory"
            className="text-navy hover:text-skyblue transition-smooth font-semibold flex items-center space-x-1"
          >
            <span>&larr;</span>
            <span>Back to Registry Directory</span>
          </Link>
          <div className="text-slate-400">
            ICAI Reg No: <span className="text-navy font-semibold">{firm.membershipNo}</span>
          </div>
        </div>
      </div>
 
      {/* Profile Details Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-10">
        <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-10 shadow-sm space-y-8">
          {/* Header Info */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 border-b border-slate-100 pb-6">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center text-[10px] font-bold text-skyblue uppercase tracking-wider bg-skyblue/10 px-2 py-0.5 rounded border border-skyblue/15">
                  {firm.yearsOfPractice}+ Years of Practice
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-skyblue uppercase tracking-wider bg-sky-50 px-2.5 py-0.5 rounded border border-sky-150">
                  {((firm as any).connectionCount || 0)} Connections
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-navy leading-tight">
                {firm.firmName}
              </h1>
              <p className="text-sm font-semibold text-slate-600">
                Principal Partner: CA. {firm.caName}
              </p>
              <p className="text-xs text-slate-400">
                Location: <strong>{firm.city}, {firm.state}</strong>
              </p>
            </div>
            
            <button
              onClick={() => {
                setShowModal(true);
                setSuccessMsg("");
                setErrorMsg("");
              }}
              className="md:self-start px-5 py-2.5 bg-skyblue hover:bg-skyblue-dark text-white font-bold text-xs rounded transition-smooth shadow-sm focus-ring uppercase tracking-wider"
            >
              Submit Connection Request
            </button>
          </div>

          {/* Masked/Unmasked Contact Details Block */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
              <span className="block text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                {(currentUser?.id === firm.userId || (!firm.isPrivate && isConnected)) ? "Email Address" : "Protected Email"}
              </span>
              <span className="font-semibold text-navy text-sm font-mono">
                {(currentUser?.id === firm.userId || (!firm.isPrivate && isConnected)) ? firm.email : maskEmail(firm.email)}
              </span>
            </div>
            <div className="space-y-1">
              <span className="block text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                {(currentUser?.id === firm.userId || (!firm.isPrivate && isConnected)) ? "Contact Number" : "Protected Contact Number"}
              </span>
              <span className="font-semibold text-navy text-sm font-mono">
                {(currentUser?.id === firm.userId || (!firm.isPrivate && isConnected)) ? firm.phone : maskPhone(firm.phone)}
              </span>
            </div>
            {!(currentUser?.id === firm.userId || (!firm.isPrivate && isConnected)) && (
              <div className="col-span-2 border-t border-slate-200/60 pt-3 text-[10px] text-slate-400 leading-relaxed text-justify">
                *To comply with anti-solicitation guidelines and prevent scrapers from mining partner directories, contact information is masked. You can initiate contact directly through our secure messaging request module.
              </div>
            )}
          </div>

          {/* Professional Experience */}
          {firm.experience && firm.experience.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-navy uppercase tracking-wider">Professional Experience</h3>
              <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 font-bold tracking-wider">Company / Firm Name</th>
                      <th className="px-4 py-3 font-bold tracking-wider w-32">Years</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {firm.experience.map((exp: any, index: number) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-navy">{exp.companyName}</td>
                        <td className="px-4 py-3 text-slate-600 font-medium">{exp.yearsOfExperience} {exp.yearsOfExperience === 1 ? 'Year' : 'Years'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Specialisations Tags */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-navy uppercase tracking-wider">Domain Specialisations</h3>
            <div className="flex flex-wrap gap-2">
              {firm.specialisations.map((spec) => (
                <span
                  key={spec}
                  className="bg-navy/5 text-navy border border-navy/10 text-xs px-3 py-1 rounded font-medium"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Firm Biography */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-navy uppercase tracking-wider">Firm Credentials & Bio</h3>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed text-justify whitespace-pre-line bg-slate-50/50 p-6 rounded border border-slate-100">
              {firm.bio || "No firm biography has been compiled. Contact firm directly for capabilities presentation booklet."}
            </p>
          </div>
        </div>
      </main>

      {/* Connection Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-lg w-full shadow-2xl overflow-hidden relative">
            {/* Modal Header */}
            <div className="bg-white text-navy p-6 border-b border-slate-200">
              <h3 className="font-serif text-lg font-bold text-navy">
                Initiate Secure Connection
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Sending a private message to <strong>{firm.firmName}</strong>.
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {successMsg ? (
                <div className="space-y-4 text-center">
                  <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-navy">Message Dispatched</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {successMsg}
                  </p>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full mt-4 bg-skyblue hover:bg-navy text-white text-xs font-semibold py-2.5 rounded transition-smooth"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="bg-rose-50 text-rose-800 text-xs p-3 rounded">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        disabled
                        value={senderName}
                        className="w-full text-xs p-2 border border-slate-200 rounded bg-slate-100 text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1">
                        Your Email
                      </label>
                      <input
                        type="email"
                        required
                        disabled
                        value={senderEmail}
                        className="w-full text-xs p-2 border border-slate-200 rounded bg-slate-100 text-slate-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1">
                      Your Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full text-xs p-2 border border-slate-200 rounded focus-ring bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1">
                      Inquiry Message (Reason for connecting) *
                    </label>
                    <textarea
                      required
                      placeholder="Detail the collaboration proposal, sub-contracting inquiry, or peer referral context here..."
                      value={inquiryMsg}
                      onChange={(e) => setInquiryMsg(e.target.value)}
                      rows={4}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
                    />
                  </div>

                  <div className="text-[10px] text-slate-400 leading-relaxed border-l-2 border-gold pl-2">
                    CAnnect will route this message directly to the firm partner's email. Your registered credentials will be enclosed to verify your membership status.
                  </div>

                  <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="text-xs text-slate-500 hover:text-navy px-3 py-2 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-skyblue text-white hover:bg-navy hover:border-navy border border-skyblue px-4 py-2 text-xs font-bold rounded shadow transition-smooth"
                    >
                      {submitting ? "Delivering..." : "Send Request"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Close Button Top Right */}
            <button
              onClick={() => setShowModal(false)}
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
