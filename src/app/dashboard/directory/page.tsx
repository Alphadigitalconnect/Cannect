"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Firm } from "@/lib/db";

export default function DirectoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [firms, setFirms] = useState<Firm[]>([]);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [experienceRange, setExperienceRange] = useState("All");

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

  const IndianStates = [
    "Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "West Bengal", "Gujarat", "Uttar Pradesh"
  ];

  useEffect(() => {
    const user = localStorage.getItem("cannect_user");
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchFirms = async () => {
      try {
        const res = await fetch("/api/firms");
        const data = await res.json();
        if (res.ok && data.firms) {
          setFirms(data.firms);
        }
      } catch (error) {
        console.error("Error fetching firms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFirms();
  }, [router]);

  const handleCheckboxChange = (spec: string) => {
    if (selectedSpecs.includes(spec)) {
      setSelectedSpecs(selectedSpecs.filter((s) => s !== spec));
    } else {
      setSelectedSpecs([...selectedSpecs, spec]);
    }
  };

  // Filter firms
  const filteredFirms = firms.filter((firm) => {
    // 1. Text Search
    const matchesSearch =
      firm.firmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      firm.caName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      firm.bio.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. City Filter
    const matchesCity =
      !selectedCity || firm.city.toLowerCase().includes(selectedCity.toLowerCase());

    // 3. State Filter
    const matchesState =
      !selectedState || firm.state.toLowerCase() === selectedState.toLowerCase();

    // 4. Specialisation Filters (matches if firm has all selected options)
    const matchesSpecs =
      selectedSpecs.length === 0 ||
      selectedSpecs.every((spec) => firm.specialisations.includes(spec));

    // 5. Experience Filter
    let matchesExp = true;
    if (experienceRange === "0-5") {
      matchesExp = firm.yearsOfPractice <= 5;
    } else if (experienceRange === "5-15") {
      matchesExp = firm.yearsOfPractice > 5 && firm.yearsOfPractice <= 15;
    } else if (experienceRange === "15+") {
      matchesExp = firm.yearsOfPractice > 15;
    }

    return matchesSearch && matchesCity && matchesState && matchesSpecs && matchesExp;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">
        Loading platform directory database...
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Top Banner */}
      <section className="bg-white border-b border-slate-200 py-10 text-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-[10px] font-bold text-skyblue uppercase tracking-wider">
              Pan-India Directory
            </span>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-navy tracking-tight">
              CA Practicing Firm Registry
            </h1>
            <p className="text-xs text-slate-500">
              Discover and establish contact pipelines with peer firms based on location and practice specialisation.
            </p>
          </div>
        </div>
      </section>

      {/* Directory Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Search & Filters sidebar (3 cols) */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-slate-200 p-5 rounded shadow-sm space-y-6">
              <h3 className="font-serif text-sm font-bold text-navy uppercase tracking-wider border-b border-gold/10 pb-3">
                Search Filters
              </h3>
              
              {/* Location Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-navy uppercase tracking-wider">City</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded focus-ring bg-slate-50"
                />
              </div>

              {/* State Select */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-navy uppercase tracking-wider">State</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded focus-ring bg-slate-50"
                >
                  <option value="">All States</option>
                  {IndianStates.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Ranges */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-navy uppercase tracking-wider">Experience Level</label>
                <select
                  value={experienceRange}
                  onChange={(e) => setExperienceRange(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded focus-ring bg-slate-50"
                >
                  <option value="All">All Years</option>
                  <option value="0-5">0 - 5 Years of practice</option>
                  <option value="5-15">5 - 15 Years of practice</option>
                  <option value="15+">15+ Years of practice</option>
                </select>
              </div>

              {/* Specialisation Checkboxes */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-navy uppercase tracking-wider">Specialisations</label>
                <div className="space-y-1.5 pt-1">
                  {specialisationOptions.map((spec) => (
                    <label key={spec} className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSpecs.includes(spec)}
                        onChange={() => handleCheckboxChange(spec)}
                        className="rounded border-slate-300 text-navy focus:ring-gold"
                      />
                      <span>{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCity("");
                  setSelectedState("");
                  setSelectedSpecs([]);
                  setExperienceRange("All");
                }}
                className="w-full text-center py-2 text-[10px] font-bold text-slate-500 hover:text-navy transition-smooth border border-slate-200 hover:border-slate-300 rounded uppercase tracking-wider"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Right Column: Listing Cards (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            {/* Search Input Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by firm name, CA name, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded text-xs focus-ring bg-white shadow-xs"
              />
            </div>

            {/* Results count info */}
            <div className="text-xs text-slate-500 font-medium">
              Showing <strong>{filteredFirms.length}</strong> practicing firms match your search.
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredFirms.length > 0 ? (
                filteredFirms.map((firm) => (
                  <div
                    key={firm.id}
                    className="bg-white border border-slate-200 p-6 rounded shadow-sm hover:shadow-md transition-smooth flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-3">
                        <span>{firm.city}, {firm.state} &bull; <span className="text-skyblue font-extrabold">{(firm as any).connectionCount || 0} Connections</span></span>
                        <span>{firm.yearsOfPractice} Yrs Practice</span>
                      </div>
                      <h3 className="font-serif text-base font-bold text-navy mb-1 line-clamp-1">
                        {firm.firmName}
                      </h3>
                      <p className="text-xs text-slate-605 font-semibold mb-3">
                        CA. {firm.caName}
                      </p>
                      
                      {/* Specialisation Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {firm.specialisations.slice(0, 3).map((spec) => (
                          <span
                            key={spec}
                            className="bg-navy/5 text-navy border border-navy/10 text-[9px] px-2 py-0.5 rounded font-medium"
                          >
                            {spec}
                          </span>
                        ))}
                        {firm.specialisations.length > 3 && (
                          <span className="bg-slate-100 text-slate-500 text-[9px] px-2 py-0.5 rounded font-medium">
                            +{firm.specialisations.length - 3} More
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-3 mb-6 leading-relaxed">
                        {firm.bio || "No biography provided. Click View Profile to submit a connection request."}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-medium">
                        Reg No: {firm.membershipNo}
                      </span>
                      <Link
                        href={`/dashboard/directory/${firm.id}`}
                        className="px-3.5 py-1.5 bg-navy text-skyblue hover:bg-skyblue hover:text-white border border-navy hover:border-skyblue text-[11px] font-semibold rounded transition-smooth shadow-xs"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 bg-white border border-slate-200 rounded p-12 text-center text-slate-400 text-xs shadow-xs">
                  No practicing CA firms match your filter combination. Try clearing your search parameters.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
