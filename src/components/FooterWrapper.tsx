"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterWrapper() {
  const pathname = usePathname();
  
  // Hide the footer on the dashboard and its subroutes
  if (pathname && pathname.startsWith("/dashboard")) {
    return null;
  }
  
  return <Footer />;
}
