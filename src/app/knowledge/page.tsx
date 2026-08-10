import React from "react";
import { readDb } from "@/lib/db";
import KnowledgePortalClient from "@/components/KnowledgePortalClient";

export const revalidate = 0; // Ensure data is loaded dynamically for test updates

export const dynamic = 'force-dynamic';

export default function KnowledgePage() {
  const db = readDb();
  // Get articles sorted (for mock database, we assume file order is chronological, or reverse it)
  const articles = [...db.articles].reverse();

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Header Banner */}
      <section className="bg-white border-b border-slate-200 py-12 text-navy relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-skyblue">
              Knowledge Hub & Updates
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-navy tracking-tight">
              Tax, Corporate Law & Compliance Portal
            </h1>
            <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-light">
              Access technical bulletins, notifications, tax compliance checklists, and statutory circulars compiled by practicing Chartered Accountants.
            </p>
          </div>
        </div>
      </section>

      {/* Main Contents */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <KnowledgePortalClient initialArticles={articles} />
      </main>
    </div>
  );
}
