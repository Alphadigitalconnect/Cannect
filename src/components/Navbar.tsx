"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [pendingConnectionsCount, setPendingConnectionsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  // Close dropdowns on route change
  useEffect(() => {
    setNotificationsOpen(false);
    setIsOpen(false);
  }, [pathname]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/connections?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          let incoming = data.incoming || [];
          const seenStr = localStorage.getItem("cannect_seen_connections");
          if (seenStr) {
            try {
              const seenIds = JSON.parse(seenStr);
              incoming = incoming.filter((req: any) => !seenIds.includes(req.id));
            } catch (e) {}
          }
          setPendingConnectionsCount(incoming.length);
        }
      } catch (e) {}

      const msgs = localStorage.getItem("cannect_chat_messages");
      if (msgs) {
        try {
          const parsed = JSON.parse(msgs);
          const myUnread = parsed.filter((m: any) => m.receiverId === user.id && m.isRead === false);
          setUnreadMessagesCount(myUnread.length);
        } catch (e) {}
      }
    };

    if (user?.id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  // Listen to login/logout changes
  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("cannect_user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();
    // Add custom event listener for storage/login changes
    window.addEventListener("cannect_login_state", checkUser);
    window.addEventListener("storage", checkUser);
    
    return () => {
      window.removeEventListener("cannect_login_state", checkUser);
      window.removeEventListener("storage", checkUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("cannect_user");
    setUser(null);
    // Dispatch event to update other components
    window.dispatchEvent(new Event("cannect_login_state"));
    router.push("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Events", path: "/events" },
    { name: "Go Digital", path: "/go-digital" },
    { name: "CAnnect App", path: "/app-teaser" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <Logo darkText={true} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`text-sm font-medium transition-smooth ${
                    isActive
                      ? "text-skyblue border-b-2 border-skyblue pb-1"
                      : "text-slate-600 hover:text-skyblue hover:border-b-2 hover:border-skyblue/50 pb-1"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Dashboard Link if Logged In */}
            {user && (
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-smooth ${
                  pathname.startsWith("/dashboard")
                    ? "text-skyblue border-b-2 border-skyblue pb-1"
                    : "text-slate-600 hover:text-skyblue hover:border-b-2 hover:border-skyblue/50 pb-1"
                }`}
              >
                Dashboard
              </Link>
            )}

            {/* Admin Approvals Link */}
            {user && user.role === "admin" && (
              <Link
                href="/admin-approvals"
                className={`text-sm font-medium transition-smooth ${
                  pathname.startsWith("/admin-approvals")
                    ? "text-skyblue border-b-2 border-skyblue pb-1"
                    : "text-slate-600 hover:text-skyblue hover:border-b-2 hover:border-skyblue/50 pb-1"
                }`}
              >
                Approvals
              </Link>
            )}
          </nav>

          {/* CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-1.5 text-slate-500 hover:text-skyblue transition-smooth focus-ring rounded-full"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {(pendingConnectionsCount > 0 || unreadMessagesCount > 0) && (
                      <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
                    )}
                  </button>
                  
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-slate-200 overflow-hidden z-50">
                      <div className="py-2 px-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-navy uppercase tracking-wider">
                        Notifications
                      </div>
                      <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                        {pendingConnectionsCount === 0 && unreadMessagesCount === 0 ? (
                          <div className="p-4 text-center text-[11px] text-slate-500">
                            No new notifications
                          </div>
                        ) : (
                          <>
                            {pendingConnectionsCount > 0 && (
                              <Link
                                href="/dashboard?tab=connections"
                                className="block p-3 hover:bg-slate-50 transition-smooth"
                              >
                                <p className="text-[11px] font-semibold text-navy">
                                  {pendingConnectionsCount} new connection request{pendingConnectionsCount > 1 ? 's' : ''}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Click to view and respond</p>
                              </Link>
                            )}
                            {unreadMessagesCount > 0 && (
                              <Link
                                href="/dashboard?tab=chat"
                                className="block p-3 hover:bg-slate-50 transition-smooth"
                              >
                                <p className="text-[11px] font-semibold text-navy">
                                  {unreadMessagesCount} unread message{unreadMessagesCount > 1 ? 's' : ''}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Check your inbox</p>
                              </Link>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-xs text-slate-600 font-medium max-w-[120px] truncate">
                  CA. {user.caName || user.name || "Member"}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-slate-600 hover:text-slate-900 transition-smooth border border-slate-300 hover:border-slate-400 px-3 py-1.5 rounded"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-smooth"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register-type"
                  className="inline-flex items-center justify-center px-4 py-2 border border-skyblue text-sm font-medium rounded text-white bg-skyblue hover:bg-skyblue-dark hover:border-skyblue-dark transition-smooth shadow-sm focus-ring"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-ring"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-200" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded text-base font-medium ${
                  pathname === link.path
                    ? "bg-slate-100 text-skyblue"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {user && (
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded text-base font-medium ${
                  pathname.startsWith("/dashboard")
                    ? "bg-slate-100 text-skyblue"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                Dashboard
              </Link>
            )}

            {user && user.role === "admin" && (
              <>
                <Link
                  href="/admin-approvals"
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded text-base font-medium ${
                    pathname.startsWith("/admin-approvals")
                      ? "bg-slate-100 text-skyblue"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  Approvals
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded text-base font-medium ${
                    pathname.startsWith("/admin") && !pathname.startsWith("/admin-approvals")
                      ? "bg-slate-100 text-skyblue"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  Admin Panel
                </Link>
              </>
            )}
          </div>
          
          <div className="pt-4 pb-4 border-t border-slate-100 px-5">
            {user ? (
              <div className="space-y-3">
                <div className="text-sm text-slate-600 font-medium">
                  CA. {user.caName || user.name || "Member"}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-center block px-3 py-2 rounded text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center block px-3 py-2 rounded text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsOpen(false)}
                  className="text-center block px-4 py-2 border border-skyblue rounded text-base font-medium text-white bg-skyblue hover:bg-skyblue-dark transition-smooth"
                >
                  Register Your Firm
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
