"use client";

import React, { useState, useEffect, useRef } from "react";

export default function StaggeredFadeIn({ children, className = "grid grid-cols-1 md:grid-cols-4 gap-6" }: { children: React.ReactNode, className?: string }) {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
      }
    }, { threshold: 0.1 });

    const current = containerRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {React.Children.map(children, (child, idx) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<any>, {
          className: `${child.props.className || ""} transition-all duration-700 ease-out transform ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`,
          style: {
            ...child.props.style,
            transitionDelay: `${idx * 150}ms`
          }
        });
      })}
    </div>
  );
}
