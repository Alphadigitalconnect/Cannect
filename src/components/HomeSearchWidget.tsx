"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeSearchWidget() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedSpec, setSelectedSpec] = useState("All Specialisations");
  const [selectedPractice, setSelectedPractice] = useState("All Practice Areas");
  const [selectedFirm, setSelectedFirm] = useState("All Firms");
  const [selectedExperience, setSelectedExperience] = useState("All Experience");

  const IndianStates = [
    "All States",
    "Delhi",
    "Maharashtra",
    "Karnataka",
    "Telangana",
    "Tamil Nadu",
    "Gujarat",
    "West Bengal",
    "Uttar Pradesh",
    "Rajasthan",
    "Madhya Pradesh",
    "Punjab",
    "Haryana",
    "Andhra Pradesh",
    "Kerala",
    "Goa",
    "Bihar",
    "Odisha",
    "Assam",
    "Uttarakhand",
    "Jharkhand"
  ];

  const specialisationOptions = [
    "All Specialisations",
    "Direct Tax",
    "GST & Indirect Tax",
    "Audit & Assurance",
    "Company Law / ROC",
    "International Taxation",
    "Transfer Pricing",
    "Startup Advisory",
    "M&A Advisory"
  ];

  const practiceAreaOptions = [
    "All Practice Areas",
    "Statutory & Internal Audit",
    "Tax Audit & Litigation",
    "Corporate & Securities Advisory",
    "FDI & FEMA Compliance",
    "Risk & Governance",
    "Forensic Accounting"
  ];

  const firmTypeOptions = [
    "All Firms",
    "Sole Proprietorship",
    "Partnership Firm",
    "Limited Liability Partnership (LLP)",
    "Boutique Practice",
    "Multi-Disciplinary Firm"
  ];

  const experienceOptions = [
    "All Experience",
    "1 - 5 Years",
    "5 - 10 Years",
    "10 - 15 Years",
    "15+ Years"
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedState !== "All States") params.set("state", selectedState);
    if (selectedSpec !== "All Specialisations") params.set("spec", selectedSpec);
    if (selectedPractice !== "All Practice Areas") params.set("practice", selectedPractice);
    if (selectedFirm !== "All Firms") params.set("firm", selectedFirm);
    if (selectedExperience !== "All Experience") params.set("exp", selectedExperience);

    const queryString = params.toString();
    const destination = queryString
      ? `/dashboard/directory?${queryString}`
      : "/dashboard/directory";
    router.push(destination);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 md:p-8">
      <form onSubmit={handleSearch} className="space-y-5">
        {/* Top Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-grow w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name / firm / city / specialization..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50/70 border border-slate-200 rounded-lg text-sm text-navy placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-smooth cursor-pointer whitespace-nowrap"
          >
            Search
          </button>
        </div>

        {/* Bottom Filter Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {/* State / City */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-500">
              State / City
            </label>
            <div className="relative">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                {IndianStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Specialisation */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-500">
              Specialisation
            </label>
            <div className="relative">
              <select
                value={selectedSpec}
                onChange={(e) => setSelectedSpec(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                {specialisationOptions.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Practice Area */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-500">
              Practice Area
            </label>
            <div className="relative">
              <select
                value={selectedPractice}
                onChange={(e) => setSelectedPractice(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                {practiceAreaOptions.map((pa) => (
                  <option key={pa} value={pa}>
                    {pa}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Firm */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-500">
              Firm
            </label>
            <div className="relative">
              <select
                value={selectedFirm}
                onChange={(e) => setSelectedFirm(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                {firmTypeOptions.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-500">
              Experience
            </label>
            <div className="relative">
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                {experienceOptions.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
