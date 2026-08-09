"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Article } from "@/lib/db";

interface KnowledgeClientProps {
  initialArticles: Article[];
}

export default function KnowledgePortalClient({ initialArticles }: KnowledgeClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Dynamically extract categories that have active blog posts published in the system
  const categories = [
    "All",
    ...Array.from(new Set(initialArticles.map((article) => article.category))).filter(Boolean)
  ];

  // Map category to high-contrast Unsplash image thumbnails
  const categoryImages: { [key: string]: string } = {
    "GST": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600",
    "Income Tax": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600",
    "Company Laws": "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600",
    "Due Dates": "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600"
  };

  const getCategoryImage = (category: string) => {
    return categoryImages[category] || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600";
  };

  // Filter articles by search queries and category pills
  const filteredArticles = initialArticles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory =
      selectedCategory === "All" || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Calculate pagination variables
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to first page when category or search changes
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 150, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-10 font-sans">
      
      {/* Category Pills wrap panel exactly matching Screenshot 1 */}
      <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-navy uppercase tracking-wider">Browse Compliance Topics</span>
          
          {/* Simple search bar */}
          <div className="relative w-48 sm:w-64">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search circulars..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-[11px] py-1 pl-7 pr-2.5 border border-slate-250 rounded focus-ring bg-slate-50 text-navy"
            />
          </div>
        </div>

        {/* Categories wrap grid */}
        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`px-3 py-1.5 rounded text-xs font-medium border transition-smooth ${
                  isSelected
                    ? "bg-navy text-white border-navy shadow-xs"
                    : "bg-white text-slate-650 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Articles matching Screenshot 1 */}
      <div className="space-y-8">
        {currentArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentArticles.map((article) => (
              <article
                key={article.id}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-smooth"
              >
                {/* Image header with top left overlay badge */}
                <div className="relative aspect-[16/10] bg-slate-100 flex-shrink-0">
                  <img
                    src={getCategoryImage(article.category)}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-white/95 text-slate-800 text-[9px] font-bold px-2 py-0.5 rounded shadow-sm border border-slate-100 uppercase tracking-wider">
                    {article.category}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    
                    {/* Author & Date line with SVG icons */}
                    <div className="flex items-center space-x-4 text-[10px] text-slate-400 font-medium">
                      <span className="flex items-center space-x-1">
                        <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{article.author}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{article.date}</span>
                      </span>
                    </div>

                    <h3 className="font-serif text-sm font-bold text-navy line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                    
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed text-justify">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/knowledge/${article.slug}`}
                      className="inline-flex items-center space-x-1 px-4 py-2 bg-navy hover:bg-skyblue text-white text-xs font-bold rounded transition-smooth shadow-xs"
                    >
                      <span>Read More</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded p-12 text-center text-slate-400 text-xs">
            No compliance articles found matching the selected criteria. Try adjusting filters.
          </div>
        )}

        {/* Pagination at the bottom matching Screenshot 1 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 pt-6 border-t border-slate-200">
            {/* Prev page button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-full border transition-smooth ${
                currentPage === 1
                  ? "text-slate-300 border-slate-100 cursor-not-allowed"
                  : "text-slate-650 border-slate-250 hover:bg-slate-50"
              }`}
              aria-label="Previous Page"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page number buttons */}
            {Array.from({ length: totalPages }, (_, idx) => {
              const p = idx + 1;
              const isCurrent = currentPage === p;
              return (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-7 h-7 text-xs font-semibold rounded-full border transition-smooth ${
                    isCurrent
                      ? "bg-navy text-white border-navy"
                      : "bg-white text-slate-650 border-slate-250 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            {/* Next page button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-full border transition-smooth ${
                currentPage === totalPages
                  ? "text-slate-300 border-slate-100 cursor-not-allowed"
                  : "text-slate-650 border-slate-250 hover:bg-slate-50"
              }`}
              aria-label="Next Page"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
