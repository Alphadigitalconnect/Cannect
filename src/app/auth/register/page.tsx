"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const copParam = searchParams.get("cop");
  
  // Determine if registering with CoP or without
  const hasCop = copParam !== "false";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    const user = localStorage.getItem("cannect_user");
    if (user) {
      router.push("/dashboard");
    }
  }, [router]);

  // Form Fields State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  
  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  
  const [caName, setCaName] = useState("");
  const [membershipNo, setMembershipNo] = useState("");
  const [yearsOfPractice, setYearsOfPractice] = useState("1");
  const [otherQualifications, setOtherQualifications] = useState("");
  
  const [firmName, setFirmName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  const specialisationOptions = [
    "Direct Tax",
    "GST & Indirect Tax",
    "Audit & Assurance",
    "Company Law / ROC",
    "International Taxation",
    "Transfer Pricing",
    "Startup Advisory",
    "M&A Advisory"
  ];

  const handleCheckboxChange = (spec: string) => {
    if (selectedSpecs.includes(spec)) {
      setSelectedSpecs(selectedSpecs.filter((s) => s !== spec));
    } else {
      setSelectedSpecs([...selectedSpecs, spec]);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (step === 1) {
      if (!email || !password || !phone) {
        setError("Please complete all fields in Step 1.");
        return;
      }
      if (!email.includes("@")) {
        setError("Please enter a valid email address.");
        return;
      }
      if (!isPhoneVerified) {
        setError("Please verify your mobile number with OTP before proceeding.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!caName || !membershipNo || !yearsOfPractice) {
        setError("Please fill out CA verification fields in Step 2.");
        return;
      }
      if (hasCop) {
        setStep(3);
      } else {
        // If no CoP, step 2 is the final step
        handleRegister(e);
      }
    }
  };

  const handlePrevStep = () => {
    setError("");
    setStep(step - 1);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (hasCop && (!firmName || !city || !state)) {
      setError("Please provide your Firm Name and Location.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          caName,
          membershipNo,
          firmName,
          specialisations: selectedSpecs,
          city,
          state,
          yearsOfPractice: Number(yearsOfPractice),
          phone,
          bio,
          hasCop,
          otherQualifications
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      // Save user session in localStorage
      localStorage.setItem("cannect_user", JSON.stringify(data.user));
      // Dispatch custom event to notify Navbar
      window.dispatchEvent(new Event("cannect_login_state"));
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to register. Please check details.");
    } finally {
      setLoading(false);
    }
  };

  const IndianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white border border-slate-200 p-8 rounded-lg shadow-sm space-y-6">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-lg md:text-xl font-serif font-bold text-navy">
            {hasCop ? "Register Your Practicing Firm" : "Register as a CA Member"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {hasCop 
              ? "Build your peer network and list your specialist services in India." 
              : "Connect with peers, access resources, and build your professional network."}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <span
              className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? "bg-navy text-gold" : "bg-slate-200 text-slate-500"
              }`}
            >
              1
            </span>
            <span className="text-[10px] uppercase font-bold text-navy tracking-wider">Account</span>
          </div>
          <div className="h-0.5 w-8 bg-slate-200"></div>
          <div className="flex items-center space-x-2">
            <span
              className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? "bg-navy text-gold" : "bg-slate-200 text-slate-500"
              }`}
            >
              2
            </span>
            <span className="text-[10px] uppercase font-bold text-navy tracking-wider">ICAI Validation</span>
          </div>
          
          {hasCop && (
            <>
              <div className="h-0.5 w-8 bg-slate-200"></div>
              <div className="flex items-center space-x-2">
                <span
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step >= 3 ? "bg-navy text-gold" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  3
                </span>
                <span className="text-[10px] uppercase font-bold text-navy tracking-wider">Firm Profile</span>
              </div>
            </>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-xs p-3 rounded">
            {error}
          </div>
        )}

        {/* STEP 1: ACCOUNT DETAILS */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                Professional Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. ca.name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                Mobile Number *
              </label>
              <div className="flex space-x-2">
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isPhoneVerified}
                  className={`w-full text-xs p-2.5 border rounded focus-ring ${isPhoneVerified ? 'bg-green-50 border-green-200 text-green-700' : 'border-slate-200 bg-slate-50'}`}
                />
                {!isPhoneVerified && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!phone || phone.replace(/\D/g, '').length < 10) {
                        setError("Please enter a valid 10-digit mobile number.");
                        return;
                      }
                      setOtpSent(true);
                      setError("");
                      alert(`MOCK SMS: Your CAnnect registration OTP is 1234`);
                    }}
                    className="px-4 py-2 bg-slate-200 text-navy hover:bg-slate-300 text-xs font-bold rounded shadow-sm whitespace-nowrap transition-smooth"
                  >
                    Send OTP
                  </button>
                )}
              </div>
              {isPhoneVerified && (
                <p className="text-[10px] text-green-600 font-bold mt-1">✓ Mobile number verified successfully</p>
              )}
            </div>

            {otpSent && !isPhoneVerified && (
              <div className="bg-sky-50 p-4 rounded border border-sky-100">
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Enter OTP sent to {phone}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter 4-digit OTP"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-white tracking-widest text-center font-bold"
                    maxLength={4}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (otpValue === "1234") {
                        setIsPhoneVerified(true);
                        setOtpSent(false);
                        setError("");
                      } else {
                        setError("Invalid OTP. Please enter 1234.");
                      }
                    }}
                    className="px-4 py-2 bg-skyblue text-white hover:bg-navy text-xs font-bold rounded shadow-sm whitespace-nowrap transition-smooth"
                  >
                    Verify
                  </button>
                </div>
              </div>
            )}
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-skyblue text-white hover:bg-navy hover:text-white border border-skyblue hover:border-navy text-xs font-bold rounded transition-smooth shadow-sm"
              >
                Next: Verification &rarr;
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: CA VERIFICATION */}
        {step === 2 && (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="bg-amber-50 border-l-2 border-gold text-[10px] text-amber-900 p-3 rounded">
              Verification details are compared with active ICAI listings. Submitting false membership details is a violation of professional standards.
            </div>
            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                Chartered Accountant Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={caName}
                onChange={(e) => setCaName(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  ICAI Membership No *
                </label>
                <input
                  type="text"
                  required
                  placeholder="6 digit registration"
                  value={membershipNo}
                  onChange={(e) => setMembershipNo(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={yearsOfPractice}
                  onChange={(e) => setYearsOfPractice(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
                />
              </div>
            </div>

            {!hasCop && (
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Other Qualifications (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS, CMA, CPA, LLB, DISA"
                  value={otherQualifications}
                  onChange={(e) => setOtherQualifications(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
                />
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 border border-slate-200 text-xs text-slate-500 hover:text-navy rounded"
              >
                &larr; Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-skyblue text-white hover:bg-navy hover:text-white border border-skyblue hover:border-navy text-xs font-bold rounded transition-smooth shadow-sm"
              >
                {hasCop ? "Next: Firm Profile \u2192" : (loading ? "Registering..." : "Complete Registration")}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: FIRM INFORMATION (ONLY IF HAS COP) */}
        {hasCop && step === 3 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                Firm Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. R. Sharma & Associates"
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  State *
                </label>
                <select
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
                >
                  <option value="">Select State</option>
                  {IndianStates.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
                Specialisations (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2 border border-slate-100 p-3 rounded bg-slate-50">
                {specialisationOptions.map((spec) => (
                  <label key={spec} className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSpecs.includes(spec)}
                      onChange={() => handleCheckboxChange(spec)}
                      className="rounded border-slate-300 text-navy focus:ring-skyblue"
                    />
                    <span>{spec}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                Firm Bio / Profile Summary (Optional)
              </label>
              <textarea
                placeholder="Brief summary of practice credentials, audit experience, or industries served."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full text-xs p-2.5 border border-slate-200 rounded focus-ring bg-slate-50"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 border border-slate-200 text-xs text-slate-500 hover:text-navy rounded"
              >
                &larr; Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-skyblue text-white hover:bg-navy hover:text-white border border-skyblue hover:border-navy text-xs font-bold rounded shadow transition-smooth"
              >
                {loading ? "Registering..." : "Complete Registration"}
              </button>
            </div>
          </form>
        )}

        {/* Existing login link */}
        <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
          <span>Already registered? </span>
          <Link href="/auth/login" className="text-navy font-semibold hover:text-skyblue hover:underline">
            Sign In Here &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 text-navy font-bold">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
