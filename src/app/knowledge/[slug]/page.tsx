import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readDb } from "@/lib/db";
import PrintButton from "@/components/PrintButton";

interface ArticleDetailPageProps {
  params: {
    slug: string;
  };
}

export const revalidate = 0;

export default function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const db = readDb();
  const article = db.articles.find((a) => a.slug === params.slug);

  if (!article) {
    notFound();
  }

  // Format content text (replace newlines with paragraphs/breaks, handling bold headers/markdown mock)
  const renderParagraphs = (text: string) => {
    return text.split("\n\n").map((para, idx) => {
      // Simple custom markdown renderer inside the mock content
      if (para.startsWith("### ")) {
        return (
          <h3 key={idx} className="font-serif text-lg font-bold text-navy mt-6 mb-3">
            {para.replace("### ", "")}
          </h3>
        );
      }
      if (para.startsWith("- ") || para.startsWith("1. ")) {
        const lines = para.split("\n");
        const listItems = lines.map((line, lIdx) => {
          const content = line.replace(/^[-*] |\d+\. /, "");
          // Handle bold text in lists (e.g., **Title**: Desc)
          const boldMatch = content.match(/^\*\*(.*?)\*\*(.*)/);
          if (boldMatch) {
            return (
              <li key={lIdx} className="mb-2">
                <strong>{boldMatch[1]}</strong>{boldMatch[2]}
              </li>
            );
          }
          return <li key={lIdx} className="mb-2">{content}</li>;
        });
        
        return para.startsWith("1. ") ? (
          <ol key={idx} className="list-decimal pl-5 text-xs text-slate-600 mb-4 leading-relaxed">
            {listItems}
          </ol>
        ) : (
          <ul key={idx} className="list-disc pl-5 text-xs text-slate-600 mb-4 leading-relaxed">
            {listItems}
          </ul>
        );
      }

      // Default paragraph
      return (
        <p key={idx} className="text-xs md:text-sm text-slate-600 leading-relaxed mb-4 text-justify">
          {para}
        </p>
      );
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Article Navigation Bar */}
      <div className="bg-white border-b border-slate-200 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs">
          <Link
            href="/knowledge"
            className="text-navy hover:text-skyblue transition-smooth font-semibold flex items-center space-x-1"
          >
            <span>&larr;</span>
            <span>Back to Portal</span>
          </Link>
          <div className="text-slate-400">
            Published under: <span className="text-skyblue-dark font-medium">{article.category}</span>
          </div>
        </div>
      </div>

      {/* Main Editorial Container */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 mt-12 bg-white border border-slate-200 rounded p-8 md:p-12 shadow-sm">
        {/* Header Metadata */}
        <header className="space-y-4 border-b border-slate-100 pb-6 mb-8">
          <span className="inline-block bg-navy text-skyblue text-[10px] font-semibold px-2 py-0.5 rounded tracking-wider uppercase">
            {article.category}
          </span>
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-navy tracking-tight leading-tight">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="font-semibold text-navy">By {article.author}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
            <span>Published: {article.date}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
            <span>5 Min Read</span>
          </div>
        </header>

        {/* Content Body */}
        <div className="prose prose-slate max-w-none">
          {renderParagraphs(article.content)}
        </div>

        {/* Print/Download and Share Controls */}
        <div className="border-t border-slate-100 mt-12 pt-6 flex items-center justify-between">
          <PrintButton />
          <div className="flex space-x-2 text-xs">
            <span className="text-slate-400">Disclaimer: Information shared is for peer knowledge exchange only.</span>
          </div>
        </div>
      </article>
    </div>
  );
}
