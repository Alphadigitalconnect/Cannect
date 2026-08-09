import React from "react";

interface LogoProps {
  className?: string;
  darkText?: boolean;
}

export default function Logo({ className = "", darkText = true }: LogoProps) {
  const logoSrc = darkText ? "/logo.png" : "/logo-dark.png";
  // Only use multiply if we are rendering dark text (to remove white bg if any). 
  // For dark mode, we assume logo-dark.png has a transparent bg or matches the dark theme.
  const blendMode = darkText ? "mix-blend-multiply" : "";

  return (
    <div className={`flex items-center select-none ${className}`}>
      <img
        src={logoSrc}
        alt="CAnnect Logo"
        className={`h-14 md:h-16 w-auto object-contain ${blendMode} opacity-95`}
      />
    </div>
  );
}
