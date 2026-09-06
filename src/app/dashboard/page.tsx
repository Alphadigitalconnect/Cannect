"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(t);
  }, []);

  // Tabs: search (Directory), connections (My Network), chat (Direct Messages), profile (My Profile), admin (Admin Panel)
  const [activeTab, setActiveTab] = useState<"search" | "connections" | "chat" | "profile" | "blogs" | "admin">("search");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["search", "connections", "chat", "profile", "blogs", "admin"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);



  // Tab 1: Search Directory states
  const [directoryUsers, setDirectoryUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchArea, setSearchArea] = useState("");
  const [searchSpec, setSearchSpec] = useState("");

  // Tab 2: Connections states
  const [incomingReqs, setIncomingReqs] = useState<any[]>([]);
  const [outgoingReqs, setOutgoingReqs] = useState<any[]>([]);
  const [connectedPeers, setConnectedPeers] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  // Tab 3: Direct Messaging & Group Chat states
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatGroups, setChatGroups] = useState<any[]>([]);
  const [selectedChatPeer, setSelectedChatPeer] = useState<any>(null); // peer or group
  const [newMessageText, setNewMessageText] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState<string | null>(null);
  const [shareCardPeer, setShareCardPeer] = useState<any>(null);
  const [viewProfilePeer, setViewProfilePeer] = useState<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat without jumping the whole page
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, selectedChatPeer]);

  // Mark connection requests as seen
  useEffect(() => {
    if (activeTab === "connections" && incomingReqs.length > 0) {
      const seenStr = localStorage.getItem("cannect_seen_connections");
      const seenIds = seenStr ? JSON.parse(seenStr) : [];
      let updated = false;
      incomingReqs.forEach((req: any) => {
        if (!seenIds.includes(req.id)) {
          seenIds.push(req.id);
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem("cannect_seen_connections", JSON.stringify(seenIds));
      }
    }
  }, [activeTab, incomingReqs]);

  // Group creation modal states
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);

  // Tab 4: Profile edit states
  const [isEditing, setIsEditing] = useState(false);
  const [caName, setCaName] = useState("");
  const [firmName, setFirmName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [yearsOfPractice, setYearsOfPractice] = useState("1");
  const [bio, setBio] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [experienceList, setExperienceList] = useState<{companyName: string, fromYear: string, toYear: string}[]>([]);

  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  // Blog / Expertise Discussion Tab states
  const [myBlogs, setMyBlogs] = useState<any[]>([]);
  const [allBlogs, setAllBlogs] = useState<any[]>([]);
  const [blogFeedTab, setBlogFeedTab] = useState<"feed" | "create" | "mine">("feed");
  const [blogTitle, setBlogTitle] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogTags, setBlogTags] = useState<string[]>([]);
  const [blogImage, setBlogImage] = useState<string>("");
  const [blogImagePreview, setBlogImagePreview] = useState<string>("");
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogSuccess, setBlogSuccess] = useState("");
  const [blogError, setBlogError] = useState("");
  const [profileBlogs, setProfileBlogs] = useState<any[]>([]);
  const [expandedBlogId, setExpandedBlogId] = useState<string | null>(null);

  // Network filter & search states
  const [networkSearchQuery, setNetworkSearchQuery] = useState("");
  const [networkFilterSpec, setNetworkFilterSpec] = useState("all");
  const [confirmRemovePeerId, setConfirmRemovePeerId] = useState<string | null>(null);

  // Live Sync & Notifications states
  const [liveSyncTime, setLiveSyncTime] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Admin Tab states
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminFirms, setAdminFirms] = useState<any[]>([]);
  const [adminFilterStatus, setAdminFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const fetchAdminUsers = async () => {
    if (user?.role !== "admin") return;
    try {
      const res = await fetch(`/api/admin/users?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data.users || []);
        setAdminFirms(data.firms || []);
      }
    } catch (e) {
      console.error("Error fetching admin users:", e);
    }
  };

  useEffect(() => {
    if (activeTab === "admin" && user?.role === "admin") {
      fetchAdminUsers();
    }
  }, [activeTab, user]);

  // Fetch blogs for current user
  const fetchMyBlogs = async (userId: string) => {
    try {
      const res = await fetch(`/api/blogs?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setMyBlogs(data.blogs || []);
      }
    } catch (e) {
      console.error("Error fetching blogs:", e);
    }
  };

  // Fetch all community discussion posts
  const fetchAllBlogs = async () => {
    try {
      const res = await fetch("/api/blogs");
      if (res.ok) {
        const data = await res.json();
        setAllBlogs(data.blogs || []);
      }
    } catch (e) {
      console.error("Error fetching community posts:", e);
    }
  };

  // Fetch blogs for a specific user (for profile modal)
  const fetchProfileBlogs = async (userId: string) => {
    try {
      const res = await fetch(`/api/blogs?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProfileBlogs(data.blogs || []);
      }
    } catch (e) {
      console.error("Error fetching profile blogs:", e);
      setProfileBlogs([]);
    }
  };

  // Handle post image file upload
  const handlePostImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setBlogError("Selected image exceeds 5MB limit. Please upload a smaller image file.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setBlogImage(reader.result as string);
      setBlogImagePreview(reader.result as string);
      setBlogError("");
    };
    reader.readAsDataURL(file);
  };

  // Create a new post / discussion
  const handlePublishBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlogError("");
    setBlogSuccess("");
    if (!blogTitle.trim() || !blogContent.trim()) {
      setBlogError("Post title and content are required.");
      return;
    }
    setBlogLoading(true);
    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title: blogTitle.trim(),
          content: blogContent.trim(),
          tags: blogTags,
          imageUrl: blogImage || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish post.");
      setBlogSuccess("Your expertise / issue post was published successfully!");
      setBlogTitle("");
      setBlogContent("");
      setBlogTags([]);
      setBlogImage("");
      setBlogImagePreview("");
      setBlogFeedTab("feed");
      fetchMyBlogs(user.id);
      fetchAllBlogs();
    } catch (err: any) {
      setBlogError(err.message || "Failed to publish post.");
    } finally {
      setBlogLoading(false);
    }
  };

  // Delete a post
  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm("Are you sure you want to remove this published post?")) return;
    try {
      const res = await fetch(`/api/blogs?blogId=${blogId}&userId=${user.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchMyBlogs(user.id);
        fetchAllBlogs();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete post.");
      }
    } catch (e) {
      console.error("Error deleting post:", e);
    }
  };

  // Post tag toggle
  const handleBlogTagToggle = (tag: string) => {
    if (blogTags.includes(tag)) {
      setBlogTags(blogTags.filter((t) => t !== tag));
    } else {
      setBlogTags([...blogTags, tag]);
    }
  };

  // Load blogs and discussions when switching to blogs tab
  useEffect(() => {
    if (activeTab === "blogs" && user) {
      fetchMyBlogs(user.id);
      fetchAllBlogs();
    }
  }, [activeTab, user]);

  // Fetch profile blogs when viewing a profile
  useEffect(() => {
    if (viewProfilePeer) {
      const peerId = viewProfilePeer.userId || viewProfilePeer.id;
      fetchProfileBlogs(peerId);
    } else {
      setProfileBlogs([]);
      setExpandedBlogId(null);
    }
  }, [viewProfilePeer]);

  // Realtime Live Updates for Directory Users & Firms
  useEffect(() => {
    if (!user?.id) return;
    setLiveSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    let channel: any = null;
    try {
      if (supabase && typeof supabase.channel === "function") {
        channel = supabase
          .channel("directory-live-sync")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "users" },
            () => {
              fetchDirectoryUsers(user.id);
              setLiveSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "firms" },
            () => {
              fetchDirectoryUsers(user.id);
              setLiveSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            }
          )
          .subscribe();
      }
    } catch (err) {
      console.warn("Realtime channel subscription error, falling back to interval:", err);
    }

    // Fast polling fallback every 12 seconds
    const interval = setInterval(() => {
      fetchDirectoryUsers(user.id);
      fetchConnections(user.id);
      setLiveSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 12000);

    return () => {
      if (channel && supabase && typeof supabase.removeChannel === "function") {
        try {
          supabase.removeChannel(channel);
        } catch (e) {
          // ignore
        }
      }
      clearInterval(interval);
    };
  }, [user?.id]);

  // Manual Directory Live Refresh
  const handleManualDirectoryRefresh = async () => {
    if (!user?.id) return;
    setIsSyncing(true);
    await Promise.all([
      fetchDirectoryUsers(user.id),
      fetchConnections(user.id)
    ]);
    setLiveSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setTimeout(() => setIsSyncing(false), 600);
  };

  // Polite remove connection handler
  const handleRemoveConnection = async (peerUserId: string) => {
    if (!confirm("Are you sure you want to remove this connection from your network?")) return;
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "disconnect",
          userId: user.id,
          peerUserId
        })
      });
      if (res.ok) {
        fetchConnections(user.id);
        fetchDirectoryUsers(user.id);
        if (selectedChatPeer && (selectedChatPeer.userId === peerUserId || selectedChatPeer.id === peerUserId)) {
          setSelectedChatPeer(null);
        }
        if (viewProfilePeer && (viewProfilePeer.userId === peerUserId || viewProfilePeer.id === peerUserId)) {
          setViewProfilePeer(null);
        }
      } else {
        const data = await res.json();
        alert(data.error || "Failed to remove connection.");
      }
    } catch (e) {
      console.error("Error removing connection:", e);
    }
  };

  // Poll for new messages every 5 seconds when chat tab is active
  useEffect(() => {
    if (activeTab !== "chat" || !user) return;
    const interval = setInterval(() => {
      fetchMessages(user.id);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab, user]);

  const [isUpdating, setIsUpdating] = useState(false);

  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Statistics
  const [totalFirms, setTotalFirms] = useState(3);
  const [totalUsers, setTotalUsers] = useState(3);

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
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  const mockAvatarOptions: any[] = [];

  // Primary Data Loading
  useEffect(() => {
    const storedUser = localStorage.getItem("cannect_user");
    if (!storedUser) {
      router.push("/auth/login");
      return;
    }

    try {
      const u = JSON.parse(storedUser);
      setUser(u);

      // Initialize Profile Form fields
      setCaName(u.caName || "");
      setFirmName(u.firmName || "");
      setCity(u.city || "");
      setState(u.state || "");
      setArea(u.area || "");
      setPhone(u.phone || "");
      setYearsOfPractice(String(u.yearsOfPractice || 1));
      setBio(u.bio || "");
      setSelectedSpecs(u.specialisations || []);
      setSelectedAvatar(u.avatarUrl || "");
      setIsPrivate(u.isPrivate === true);
      setExperienceList(u.experience || []);
      setLinkedInUrl(u.linkedInUrl || "");
      setTwitterUrl(u.twitterUrl || "");
      setWebsiteUrl(u.websiteUrl || "");

      // Fetch directory CAs & connection lists
      fetchConnections(u.id);
      fetchDirectoryUsers(u.id);
      fetchInquiries(u.id);

      // Load messages & groups from the server DB (persistent backup)
      fetchMessages(u.id);
    } catch (e) {
      localStorage.removeItem("cannect_user");
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  }, []);

  // Directory API fetches
  const fetchDirectoryUsers = async (currentUserId: string) => {
    try {
      const res = await fetch("/api/firms");
      const data = await res.json();
      if (res.ok && data.firms) {
        const peers = data.firms.filter((f: any) => f.userId !== currentUserId);
        setDirectoryUsers(peers);
        setTotalFirms(data.firms.length);
        setTotalUsers(data.firms.length + 1);
      }
    } catch (e) {
      console.error("Error loading directory users:", e);
    }
  };

  // Connection API fetches
  const fetchConnections = async (currentUserId: string) => {
    try {
      const res = await fetch(`/api/connections?userId=${currentUserId}`);
      const data = await res.json();
      if (res.ok) {
        setIncomingReqs(data.incoming || []);
        setOutgoingReqs(data.outgoing || []);
        setConnectedPeers(data.accepted || []);
      }
    } catch (e) {
      console.error("Error loading connections:", e);
    }
  };

  // Fetch messages & groups from the server (permanent storage)
  const fetchMessages = async (currentUserId: string) => {
    try {
      const res = await fetch(`/api/messages?userId=${currentUserId}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data.messages || []);
        setChatGroups(data.chatGroups || []);
      }
    } catch (e) {
      console.error("Error loading messages:", e);
    }
  };

  // Send request
  const handleSendConnectRequest = async (receiverId: string) => {
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request",
          senderId: user.id,
          receiverId
        })
      });
      const data = await res.json();
      if (res.ok) {
        fetchConnections(user.id);
      } else {
        alert(data.error || "Failed to send request.");
      }
    } catch (e) {
      console.error("Error connecting:", e);
    }
  };

  // Respond connection request
  const handleRespondToRequest = async (connectionId: string, status: "accepted" | "rejected") => {
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "respond",
          connectionId,
          status
        })
      });
      if (res.ok) {
        fetchConnections(user.id);
        fetchDirectoryUsers(user.id);
      }
    } catch (e) {
      console.error("Error responding to connection request:", e);
    }
  };

  // Disconnect / delete connection
  const handleDisconnect = async (peerUserId: string) => {
    if (!confirm("Are you sure you want to disconnect this CA from your network?")) return;
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "disconnect",
          userId: user.id,
          peerUserId
        })
      });
      if (res.ok) {
        fetchConnections(user.id);
        fetchDirectoryUsers(user.id);
        if (selectedChatPeer && (selectedChatPeer.userId === peerUserId || selectedChatPeer.id === peerUserId)) {
          setSelectedChatPeer(null);
        }
      } else {
        const data = await res.json();
        alert(data.error || "Failed to disconnect.");
      }
    } catch (e) {
      console.error("Error disconnecting:", e);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Please select an image smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Please select an image smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Chat message submit
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessageText.trim() && !pendingAttachment) || !selectedChatPeer) return;

    const targetId = selectedChatPeer.isGroup ? selectedChatPeer.id : (selectedChatPeer.userId || selectedChatPeer.id);
    const msgContent = newMessageText.trim();
    const imgUrl = pendingAttachment;

    // Optimistically update local state
    const newMsg: any = {
      id: "msg_" + Date.now(),
      senderId: user.id,
      senderName: "CA. " + user.caName,
      receiverId: targetId,
      content: msgContent,
      imageUrl: imgUrl || undefined,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setChatMessages((prev: any[]) => [...prev, newMsg]);
    setNewMessageText("");
    setPendingAttachment(null);

    // Save to server (permanent backup)
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: user.id,
          senderName: "CA. " + user.caName,
          receiverId: targetId,
          content: msgContent,
          imageUrl: imgUrl || undefined,
        })
      });
    } catch (e) {
      console.error("Failed to save message to server:", e);
    }
  };

  const handleSelectChatPeer = async (peerOrGroup: any) => {
    setSelectedChatPeer(peerOrGroup);
    
    const targetId = peerOrGroup.isGroup ? peerOrGroup.id : (peerOrGroup.userId || peerOrGroup.id);
    // Optimistically mark as read in local state
    setChatMessages((prev: any[]) => prev.map(m => {
      if (!m.isRead) {
        if (peerOrGroup.isGroup && m.receiverId === targetId && m.senderId !== user.id) return { ...m, isRead: true };
        if (!peerOrGroup.isGroup && m.senderId === targetId && m.receiverId === user.id) return { ...m, isRead: true };
      }
      return m;
    }));

    // Mark as read on the server
    try {
      await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, peerId: targetId, isGroup: !!peerOrGroup.isGroup })
      });
    } catch (e) {
      console.error("Failed to mark messages as read:", e);
    }
  };

  // Create Group Chat
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const memberIds = [user.id, ...selectedGroupMembers];

    // Save to server (permanent)
    try {
      const res = await fetch("/api/chat-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroupName, memberIds })
      });
      if (res.ok) {
        const data = await res.json();
        const newGroup = data.chatGroup;
        setChatGroups((prev: any[]) => [...prev, newGroup]);
        setSelectedChatPeer(newGroup);
      }
    } catch (e) {
      console.error("Failed to create group:", e);
    }

    // Reset modal
    setNewGroupName("");
    setSelectedGroupMembers([]);
    setShowCreateGroupModal(false);
  };

  const handleGroupMemberCheckbox = (peerId: string) => {
    if (selectedGroupMembers.includes(peerId)) {
      setSelectedGroupMembers(selectedGroupMembers.filter((id) => id !== peerId));
    } else {
      setSelectedGroupMembers([...selectedGroupMembers, peerId]);
    }
  };

  // Profile checkbox updates
  const handleCheckboxChange = (spec: string) => {
    if (selectedSpecs.includes(spec)) {
      setSelectedSpecs(selectedSpecs.filter((s) => s !== spec));
    } else {
      setSelectedSpecs([...selectedSpecs, spec]);
    }
  };

  // Experience handlers
  const handleAddExperience = () => {
    setExperienceList([...experienceList, { companyName: "", fromYear: "", toYear: "" }]);
  };

  const handleRemoveExperience = (index: number) => {
    setExperienceList(experienceList.filter((_, i) => i !== index));
  };

  const handleExperienceChange = (index: number, field: string, value: string | number) => {
    const newList = [...experienceList];
    newList[index] = { ...newList[index], [field]: value };
    setExperienceList(newList);
  };

  // Submit Profile updates
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");

    try {
      const res = await fetch("/api/firms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          caName,
          firmName,
          city,
          state,
          area,
          phone,
          yearsOfPractice: Number(yearsOfPractice),
          bio,
          specialisations: selectedSpecs,
          avatarUrl: selectedAvatar,
          isPrivate,
          experience: experienceList,
          linkedInUrl,
          twitterUrl,
          websiteUrl
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Profile update failed.");
      }

      localStorage.setItem("cannect_user", JSON.stringify(data.user));
      setUser(data.user);
      
      setUpdateSuccess("Your professional profile has been updated successfully.");
      setIsEditing(false);
      
      window.dispatchEvent(new Event("cannect_login_state"));
    } catch (err: any) {
      setUpdateError(err.message || "Failed to update profile. Try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cannect_user");
    window.dispatchEvent(new Event("cannect_login_state"));
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "DANGER: Are you absolutely sure you want to permanently delete your account? All your connections, messages, and firm data will be erased. This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Your account has been successfully deleted.");
        handleLogout();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete account.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting your account.");
    }
  };

  const fetchInquiries = async (currentUserId: string) => {
    try {
      const res = await fetch(`/api/contact-requests?userId=${currentUserId}`);
      const data = await res.json();
      if (res.ok && data.requests) {
        setInquiries(data.requests);
      }
    } catch (e) {
      console.error("Error loading inquiries:", e);
    }
  };

  // Search/Filters logic
  const filteredPeers = directoryUsers.filter((peer) => {
    const q = (searchQuery || "").toLowerCase().trim();
    const caNameStr = (peer.caName || "").toLowerCase();
    const firmNameStr = (peer.firmName || "").toLowerCase();
    const bioStr = (peer.bio || "").toLowerCase();

    const matchesQuery = q === "" ||
      caNameStr.includes(q) ||
      firmNameStr.includes(q) ||
      bioStr.includes(q);
    
    const c = (searchCity || "").toLowerCase().trim();
    const cityStr = (peer.city || "").toLowerCase();
    const stateStr = (peer.state || "").toLowerCase();

    const matchesCity = c === "" ||
      cityStr.includes(c) ||
      stateStr.includes(c);

    const specialisationsList = Array.isArray(peer.specialisations) ? peer.specialisations : [];
    const matchesSpec = searchSpec === "" ||
      specialisationsList.includes(searchSpec);

    return matchesQuery && matchesCity && matchesSpec;
  });

  const getConnectionStatus = (peerUserId: string) => {
    const isConnected = connectedPeers.some((c) => c.userId === peerUserId);
    if (isConnected) return "Connected";

    const isPendingIncoming = incomingReqs.some((c) => c.userId === peerUserId);
    if (isPendingIncoming) return "Respond";

    const isPendingOutgoing = outgoingReqs.some((c) => c.userId === peerUserId);
    if (isPendingOutgoing) return "Pending Approval";

    return "Connect";
  };

  if (loading || showSplash) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-8 overflow-hidden relative">
        <img src="/logo.png" alt="CAnnect Logo" className="h-24 md:h-32 w-auto object-contain animate-pulse" />
        <div className="w-fit inline-block">
          <h1 className="text-xl md:text-3xl font-bold text-navy overflow-hidden whitespace-nowrap border-r-[3px] border-skyblue pr-2 animate-[typing_1.5s_steps(40,end),blink_.75s_step-end_infinite]">
            Let's Connect with the fellow CAs
          </h1>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Filter messages for active chat peer or group
  const activeChatMessages = chatMessages.filter((m) => {
    if (!selectedChatPeer) return false;
    if (selectedChatPeer.isGroup) {
      return m.receiverId === selectedChatPeer.id;
    } else {
      const peerId = selectedChatPeer.userId || selectedChatPeer.id;
      return (
        (m.senderId === user.id && m.receiverId === peerId) ||
        (m.senderId === peerId && m.receiverId === user.id)
      );
    }
  });

  return (
    <div className="bg-slate-100 h-screen overflow-hidden ">
      
      {/* Conditional Layout for Pending/Rejected status */}
      {user?.status === "pending" ? (
        <div className="max-w-4xl mx-auto mt-20 p-8 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
          <h2 className="text-2xl font-bold text-navy mb-4">Account Pending Verification</h2>
          <p className="text-slate-600 mb-6">Your registration details are currently being reviewed by our administrators to verify your ICAI membership.</p>
          <p className="text-slate-500 text-sm">This usually takes 1-2 business days. You will receive an email once your account is approved.</p>
        </div>
      ) : user?.status === "rejected" ? (
        <div className="max-w-4xl mx-auto mt-20 p-8 bg-white border border-rose-200 rounded-xl shadow-sm text-center">
          <h2 className="text-2xl font-bold text-rose-700 mb-4">Verification Rejected</h2>
          <p className="text-rose-600 mb-6">We could not verify your ICAI membership details with our records. Please contact support for further assistance.</p>
        </div>
      ) : (
      <>
        {/* ==================== NOTIFICATIONS MODAL / DRAWER ==================== */}
        {showNotificationsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-sky-50 text-skyblue border border-sky-100">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-navy">Notifications & Activity</h3>
                    <p className="text-[11px] text-slate-400">Connection requests, messages, and platform activity</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-navy hover:bg-slate-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                {/* Incoming Connection Requests */}
                <div>
                  <h4 className="font-bold text-navy uppercase tracking-wider text-[10px] mb-2 flex items-center justify-between">
                    <span>Pending Connection Requests ({incomingReqs.length})</span>
                  </h4>
                  {incomingReqs.length > 0 ? (
                    <div className="space-y-2.5">
                      {incomingReqs.map((req) => (
                        <div key={req.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={req.avatarUrl || `https://ui-avatars.com/api/?name=${req.senderName || 'CA'}&background=e0f2fe&color=0284c7&size=150`}
                              alt={req.caName}
                              className="h-9 w-9 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <p className="font-bold text-navy text-xs">CA. {req.caName}</p>
                              <p className="text-[10px] text-slate-400">{req.city}, {req.state}</p>
                            </div>
                          </div>
                          <div className="flex space-x-1.5">
                            <button
                              onClick={() => {
                                handleRespondToRequest(req.id, "accepted");
                                setShowNotificationsModal(false);
                              }}
                              className="px-2.5 py-1 bg-skyblue hover:bg-navy text-white font-bold text-[10px] rounded uppercase tracking-wider"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRespondToRequest(req.id, "rejected")}
                              className="px-2 py-1 border border-slate-250 text-slate-500 hover:bg-slate-100 font-bold text-[10px] rounded uppercase tracking-wider"
                            >
                              Ignore
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 py-2 italic">No pending connection requests.</p>
                  )}
                </div>

                {/* Directory Live Status Alert */}
                <div className="border border-emerald-150 rounded-xl p-3 bg-emerald-50/50 flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 animate-pulse flex-shrink-0"></span>
                  <div>
                    <p className="font-bold text-emerald-900 text-xs">Live Directory Sync Active</p>
                    <p className="text-[11px] text-emerald-700 leading-relaxed mt-0.5">
                      Your directory and network connections are continuously synchronized with the Pan-India database in real time.
                    </p>
                  </div>
                </div>

                {/* Community Discussions Activity */}
                <div className="border border-sky-150 rounded-xl p-3 bg-sky-50/50 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center text-skyblue flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-sky-950 text-xs">Expertise & Issues Discussions</p>
                    <p className="text-[11px] text-sky-800 leading-relaxed mt-0.5">
                      Share challenges or case-law queries faced in your practice with images and documents in the Expertise tab.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-slate-150 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 md:py-6 h-full flex flex-col">
          
          {/* ==================== MOBILE TOP BAR & NAVIGATION ==================== */}
          <div className="block lg:hidden mb-4 space-y-3 flex-shrink-0">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.caName || 'CA'}&background=e0f2fe&color=0284c7&size=150`}
                  alt={user.caName}
                  className="h-10 w-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                />
                <div className="truncate">
                  <h3 className="text-xs font-bold text-navy flex items-center space-x-1 truncate">
                    <span>CA. {user.caName}</span>
                    {user.hasCop && <span title="CoP Practitioner" className="text-amber-500 font-bold">★</span>}
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate max-w-[170px]">
                    {user.firmName || "Independent Practice"} &bull; {user.city}
                  </p>
                </div>
              </div>

              {/* Mobile Bell Button */}
              <button
                type="button"
                onClick={() => setShowNotificationsModal(true)}
                className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-skyblue border border-slate-200 transition-colors flex-shrink-0"
                title="Notifications"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {incomingReqs.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs">
                    {incomingReqs.length}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Horizontal Tabs Pill Scroller */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[
                { id: "search", label: "Directory", icon: "🔍" },
                { id: "connections", label: `My Network (${connectedPeers.length})`, icon: "👥", badge: incomingReqs.length },
                { id: "chat", label: "Chats", icon: "💬" },
                { id: "blogs", label: "Share Expertise", icon: "✍️" },
                { id: "profile", label: "Profile", icon: "👤" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center space-x-1.5 flex-shrink-0 ${
                    activeTab === tab.id
                      ? "bg-skyblue text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {Boolean(tab.badge && tab.badge > 0) && (
                    <span className="h-4 w-4 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full flex-grow overflow-hidden">
            
            {/* ==================== LEFT COLUMN SIDEBAR (DESKTOP) ==================== */}
            <aside className="hidden lg:flex lg:col-span-3 space-y-6 flex-col h-full overflow-y-auto pr-2 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              
              {/* Profile Brief Info Card */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                <div className="h-12 bg-gradient-to-br from-skyblue to-sky-600"></div>
                <div className="px-5 pb-4 text-center relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <img
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.caName || 'CA'}&background=e0f2fe&color=0284c7&size=150`}
                      alt={user.caName}
                      className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-sm"
                    />
                  </div>
                  <div className="pt-8">
                    <h3 className="text-xs font-bold text-navy flex items-center justify-center space-x-1">
                      <span>CA. {user.caName}</span>
                      {user.hasCop ? (
                        <span title="Certificate of Practice" className="inline-flex items-center justify-center h-4 w-4 bg-yellow-400 text-white rounded-full text-[9px] shadow-sm cursor-help">
                          ★
                        </span>
                      ) : (
                        <span title="Member" className="inline-flex items-center justify-center h-4 w-4 bg-slate-400 text-white rounded-full text-[9px] shadow-sm cursor-help">
                          ★
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed truncate px-1">
                      {user.specialisations?.slice(0, 1).join(" | ") || "Practice Specialist"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {user.city}, {user.state}
                    </p>
                    <div className="flex flex-col items-center mt-2 space-y-2">
                      <span className="inline-block bg-sky-50 text-skyblue border border-sky-100 text-[11px] px-2.5 py-1 rounded font-bold shadow-xs">
                        {connectedPeers.length} Connections
                      </span>
                      <button
                        onClick={() => setShareCardPeer(user)}
                        className="text-[9px] font-bold text-navy uppercase tracking-widest hover:text-skyblue flex items-center space-x-1 transition-smooth"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        <span>Share Profile</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Navigation */}
              <nav className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-1">
                <button
                  onClick={() => setActiveTab("search")}
                  className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded transition-smooth text-xs font-semibold ${
                    activeTab === "search"
                      ? "bg-sky-50 text-skyblue border border-sky-100 shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-navy"
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search the Directory</span>
                </button>

                <button
                  onClick={() => setActiveTab("connections")}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded transition-smooth text-xs font-semibold ${
                    activeTab === "connections"
                      ? "bg-sky-50 text-skyblue border border-sky-100 shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-navy"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>My Network</span>
                  </div>
                  {incomingReqs.length > 0 && (
                    <span className="h-5 w-5 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                      {incomingReqs.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setActiveTab("chat");
                    if (connectedPeers.length > 0 && !selectedChatPeer) {
                      setSelectedChatPeer(connectedPeers[0]);
                    }
                  }}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded transition-smooth text-xs font-semibold ${
                    activeTab === "chat"
                      ? "bg-sky-50 text-skyblue border border-sky-100 shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-navy"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Chats & Groups</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("blogs")}
                  className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded transition-smooth text-xs font-semibold ${
                    activeTab === "blogs"
                      ? "bg-sky-50 text-skyblue border border-sky-100 shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-navy"
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <span>Share Expertise & Posts</span>
                </button>

                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded transition-smooth text-xs font-semibold ${
                    activeTab === "profile"
                      ? "bg-sky-50 text-skyblue border border-sky-100 shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-navy"
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>My Profile</span>
                </button>

                {/* Notifications Trigger in Sidebar */}
                <button
                  onClick={() => setShowNotificationsModal(true)}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded transition-smooth text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-navy"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span>Notifications</span>
                  </div>
                  {incomingReqs.length > 0 && (
                    <span className="h-5 w-5 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                      {incomingReqs.length}
                    </span>
                  )}
                </button>
                
                {user?.role === "admin" && (
                  <button
                    onClick={() => setActiveTab("admin")}
                    className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded transition-smooth text-xs font-semibold ${
                      activeTab === "admin"
                        ? "bg-amber-50 text-amber-600 border border-amber-200 shadow-xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-navy"
                    }`}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                    <span>Admin Panel</span>
                  </button>
                )}
              </nav>

            </aside>

            {/* ==================== MAIN WORKSPACE CENTER COLUMN ==================== */}
            <section className="lg:col-span-9 h-full overflow-y-auto pb-20 pr-1 sm:pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] space-y-6">
            
            {/* ==================== TAB 1: DIRECTORY SEARCH ==================== */}
            {activeTab === "search" && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
                  <div className="border-b border-slate-150 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg md:text-xl font-serif font-bold text-navy">Pan-India Member Directory</h2>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Live Updation Active</span>
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                        Discover verified Chartered Accountants • Auto-syncs in real time when new members join
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={handleManualDirectoryRefresh}
                        disabled={isSyncing}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-skyblue bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 px-3 py-1.5 rounded-lg transition-colors shadow-2xs cursor-pointer"
                        title="Sync latest members from database"
                      >
                        <svg className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-skyblue" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
                      </button>
                      <span className="text-xs text-slate-600 font-bold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                        {filteredPeers.length} Members
                      </span>
                    </div>
                  </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[8px] font-bold text-navy uppercase tracking-wider mb-1">Keywords</label>
                    <input
                      type="text"
                      placeholder="Name, firm, bio..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-[11px] p-2 border border-slate-200 rounded focus-ring bg-slate-50 text-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-navy uppercase tracking-wider mb-1">City/State</label>
                    <input
                      type="text"
                      placeholder="e.g. Hyderabad"
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className="w-full text-[11px] p-2 border border-slate-200 rounded focus-ring bg-slate-50 text-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-navy uppercase tracking-wider mb-1">Specialisation</label>
                    <select
                      value={searchSpec}
                      onChange={(e) => setSearchSpec(e.target.value)}
                      className="w-full text-[11px] p-2 border border-slate-200 rounded focus-ring bg-slate-50 text-navy"
                    >
                      <option value="">All Fields</option>
                      {specialisationOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  {filteredPeers.length > 0 ? (
                    filteredPeers.map((peer) => {
                      const status = getConnectionStatus(peer.userId);
                      return (
                        <div key={peer.id} className="border border-slate-200 p-4 rounded hover:border-skyblue/50 transition-smooth flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white shadow-xs">
                          <div className="flex items-start space-x-3">
                            <img
                              src={peer.avatarUrl || `https://ui-avatars.com/api/?name=${peer.caName || 'CA'}&background=e0f2fe&color=0284c7&size=150`}
                              alt={peer.caName}
                              className="h-11 w-11 rounded-full object-cover border border-slate-100 flex-shrink-0"
                            />
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-navy">CA. {peer.caName}</h3>
                              <p className="text-[11px] text-slate-600 font-semibold leading-tight flex items-center space-x-2 flex-wrap">
                                <span>{peer.firmName}</span>
                                <span className="text-slate-300">&bull;</span>
                                <span>{peer.city}, {peer.state}</span>
                                <span className="text-slate-300">&bull;</span>
                                <span className="text-skyblue font-bold">{peer.connectionCount || 0} connections</span>
                              </p>
                              <div className="mt-1">
                                <button
                                  onClick={() => setShareCardPeer(peer)}
                                  className="text-[9px] font-bold text-navy uppercase tracking-widest hover:text-skyblue flex items-center space-x-1 transition-smooth"
                                >
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                  </svg>
                                  <span>Share Profile</span>
                                </button>
                              </div>
                              <p className="text-xs text-slate-500 font-normal leading-relaxed line-clamp-2">
                                {peer.bio}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {peer.specialisations?.map((spec: string) => (
                                  <span key={spec} className="bg-sky-50 text-skyblue border border-sky-100 text-[11px] px-2 py-1 rounded font-medium">
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 self-end md:self-center flex-shrink-0">
                            <button
                              onClick={() => setViewProfilePeer(peer)}
                              className="px-3.5 py-1.5 border border-slate-200 text-navy hover:bg-slate-50 text-[11px] font-bold rounded transition-smooth shadow-xs uppercase tracking-wider"
                            >
                              View Profile
                            </button>

                            {status === "Connect" && (
                              <button
                                onClick={() => handleSendConnectRequest(peer.userId)}
                                className="px-4 py-1.5 bg-skyblue hover:bg-navy text-white font-bold text-[11px] rounded transition-smooth shadow-xs uppercase tracking-wider"
                              >
                                Connect
                              </button>
                            )}
                            {status === "Pending Approval" && (
                              <span className="px-4 py-1.5 bg-slate-100 border border-slate-200 text-slate-500 font-bold text-[11px] rounded">
                                Pending
                              </span>
                            )}
                            {status === "Respond" && (
                              <button
                                onClick={() => setActiveTab("connections")}
                                className="px-4 py-1.5 bg-amber-500 text-white font-bold text-[11px] rounded hover:bg-amber-600 transition-smooth shadow-xs uppercase tracking-wider"
                              >
                                Respond
                              </button>
                            )}
                            {status === "Connected" && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedChatPeer(peer);
                                    setActiveTab("chat");
                                  }}
                                  className="px-3.5 py-1.5 bg-skyblue text-white text-[11px] font-bold rounded hover:bg-navy transition-smooth shadow-xs uppercase tracking-wider"
                                >
                                  Message
                                </button>
                                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] rounded flex items-center space-x-1">
                                  <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Connected</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-[11px]">
                      No matching Chartered Accountants in the directory listings. Try adjusting filters.
                    </div>
                  )}
                </div>
              </div>
            </div>
            )}

            {/* ==================== TAB 2: CONNECTIONS (My Network) ==================== */}
            {activeTab === "connections" && (
              <div className="space-y-6">
                
                {/* Incoming Requests Section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-serif font-bold text-navy">
                        Pending Connection Requests
                      </h3>
                      {incomingReqs.length > 0 && (
                        <span className="h-5 px-2 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                          {incomingReqs.length}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Review requests sent by fellow practitioners
                    </span>
                  </div>

                  {incomingReqs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {incomingReqs.map((req) => (
                        <div key={req.id} className="border border-slate-200/90 hover:border-skyblue/50 rounded-xl p-4 bg-slate-50/50 hover:bg-white transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs">
                          <div className="flex items-center space-x-3">
                            <img
                              src={req.avatarUrl || `https://ui-avatars.com/api/?name=${req.senderName || 'CA'}&background=e0f2fe&color=0284c7&size=150`}
                              alt={req.caName}
                              className="h-11 w-11 rounded-full object-cover border border-slate-200 flex-shrink-0"
                            />
                            <div>
                              <h4 className="text-xs font-bold text-navy">CA. {req.caName}</h4>
                              <p className="text-[11px] text-slate-500 leading-tight">{req.city}, {req.state}</p>
                              {req.firmName && (
                                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{req.firmName}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2 w-full sm:w-auto justify-end pt-1 sm:pt-0">
                            <button
                              onClick={() => handleRespondToRequest(req.id, "accepted")}
                              className="px-3.5 py-1.5 bg-skyblue hover:bg-navy text-white font-bold text-[11px] rounded-lg uppercase tracking-wider transition-colors shadow-2xs"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRespondToRequest(req.id, "rejected")}
                              className="px-3 py-1.5 border border-slate-250 text-slate-500 hover:bg-slate-100 font-bold text-[11px] rounded-lg uppercase tracking-wider transition-colors"
                            >
                              Ignore
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4 italic">No pending connection requests at this time.</p>
                  )}
                </div>

                {/* Network Overview & Search */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
                  <div className="border-b border-slate-150 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-serif font-bold text-navy">
                          My Professional Network
                        </h3>
                        <span className="text-xs font-bold text-skyblue bg-sky-50 border border-sky-100 px-2.5 py-0.5 rounded-full">
                          {connectedPeers.length} {connectedPeers.length === 1 ? "Connection" : "Connections"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Colleagues in your verified circle. Click &ldquo;View Profile&rdquo; to access verified contact particulars.
                      </p>
                    </div>

                    {/* Network Search Input */}
                    <div className="w-full sm:w-72">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search in network (name, city)..."
                          value={networkSearchQuery}
                          onChange={(e) => setNetworkSearchQuery(e.target.value)}
                          className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus-ring text-navy"
                        />
                        <svg className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {connectedPeers.length > 0 ? (
                    <div className="space-y-6">
                      {/* Filter by Category */}
                      {([
                        { id: "all", name: "All Specialties" },
                        { id: "direct-tax", name: "Direct Tax", specs: ["Direct Tax"] },
                        { id: "indirect-tax", name: "Indirect Tax", specs: ["GST & Indirect Tax", "Indirect Tax", "GST & Indirect Taxation"] },
                        { id: "transfer-pricing", name: "Transfer Pricing", specs: ["Transfer Pricing"] },
                        { id: "audit-assurance", name: "Audit & Assurance", specs: ["Audit & Assurance", "Audit and Assurance"] },
                        { id: "roc-compliances", name: "ROC & Company Law", specs: ["Company Law / ROC", "ROC Compliances", "ROC"] },
                        { id: "startup", name: "Startup Advisory", specs: ["Startup Advisory", "Startup"] },
                      ] as { id: string; name: string; specs?: string[] }[]).map((cat) => {
                        // Filter peers by search query and category
                        const peers = connectedPeers.filter((peer) => {
                          const matchesSearch = !networkSearchQuery.trim() || 
                            (peer.caName || "").toLowerCase().includes(networkSearchQuery.toLowerCase()) ||
                            (peer.firmName || "").toLowerCase().includes(networkSearchQuery.toLowerCase()) ||
                            (peer.city || "").toLowerCase().includes(networkSearchQuery.toLowerCase()) ||
                            (peer.state || "").toLowerCase().includes(networkSearchQuery.toLowerCase());
                          
                          if (!matchesSearch) return false;

                          if (cat.id === "all") return true;

                          return peer.specialisations && peer.specialisations.some((s: string) => cat.specs?.includes(s));
                        });

                        // Only show non-empty category sections, or only show the "All" section if searching
                        if (cat.id !== "all" && networkSearchQuery.trim()) return null;
                        if (cat.id === "all" && !networkSearchQuery.trim() && connectedPeers.length > 0) return null;
                        if (peers.length === 0) return null;

                        return (
                          <div key={cat.id} className="border border-slate-200/90 rounded-2xl p-4 sm:p-5 bg-slate-50/40 space-y-4 shadow-2xs">
                            <div className="flex items-center justify-between border-b border-slate-150 pb-2.5">
                              <h4 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center space-x-2">
                                <span className="h-2 w-2 rounded-full bg-skyblue"></span>
                                <span>{cat.name}</span>
                              </h4>
                              <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                                {peers.length} {peers.length === 1 ? "Practitioner" : "Practitioners"}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {peers.map((peer) => (
                                <div
                                  key={peer.id}
                                  className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-4 flex flex-col justify-between hover:border-skyblue/50 hover:shadow-md transition-all duration-200"
                                >
                                  <div className="space-y-3">
                                    {/* Member Header (No direct phone or email on card) */}
                                    <div className="flex items-start space-x-3">
                                      <img
                                        src={peer.avatarUrl || `https://ui-avatars.com/api/?name=${peer.caName || 'CA'}&background=e0f2fe&color=0284c7&size=150`}
                                        alt={peer.caName}
                                        className="h-12 w-12 rounded-full object-cover border border-slate-200 flex-shrink-0 shadow-2xs"
                                      />
                                      <div className="flex-grow min-w-0">
                                        <div className="flex items-center space-x-1.5 flex-wrap">
                                          <h4 className="text-sm font-bold text-navy truncate">CA. {peer.caName}</h4>
                                          {peer.hasCop ? (
                                            <span title="Certificate of Practice Holder" className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                                              COP
                                            </span>
                                          ) : (
                                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                                              Member
                                            </span>
                                          )}
                                        </div>

                                        <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                                          {peer.firmName || "Independent Practice"}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                                          <span>📍 {peer.city}, {peer.state}</span>
                                          {peer.yearsOfPractice && (
                                            <span>&bull; {peer.yearsOfPractice} Yrs Practice</span>
                                          )}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Specialisation badges */}
                                    {peer.specialisations && peer.specialisations.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 pt-1">
                                        {peer.specialisations.slice(0, 3).map((spec: string) => (
                                          <span key={spec} className="bg-sky-50 text-skyblue border border-sky-150 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                                            {spec}
                                          </span>
                                        ))}
                                        {peer.specialisations.length > 3 && (
                                          <span className="text-[10px] text-slate-400 px-1 font-semibold self-center">
                                            +{peer.specialisations.length - 3} more
                                          </span>
                                        )}
                                      </div>
                                    )}

                                    {/* Privacy Note: Contact info strictly in profile */}
                                    <div className="bg-slate-50/80 border border-slate-150/70 px-3 py-2 rounded-lg text-[11px] text-slate-500 flex items-center justify-between">
                                      <span className="flex items-center gap-1 text-slate-500">
                                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <span>Direct Contact Particulars</span>
                                      </span>
                                      <span className="text-navy font-bold text-[10px] uppercase tracking-wider">
                                        Protected &bull; In Profile
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Action Buttons */}
                                  <div className="flex items-center justify-between pt-3 border-t border-slate-150/80 gap-2">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => {
                                          setSelectedChatPeer(peer);
                                          setActiveTab("chat");
                                        }}
                                        className="px-3.5 py-1.5 bg-skyblue hover:bg-navy text-white font-bold text-xs rounded-lg shadow-2xs uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <span>Message</span>
                                      </button>
                                      
                                      <button
                                        onClick={() => setViewProfilePeer(peer)}
                                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-navy font-bold text-xs rounded-lg shadow-2xs uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                                      >
                                        <span>View Profile</span>
                                      </button>
                                    </div>

                                    {/* Polite Remove Connection Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveConnection(peer.userId)}
                                      className="text-[11px] text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded transition-colors font-semibold uppercase tracking-wider"
                                      title="Remove from my network connections"
                                    >
                                      Remove Connection
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-sky-50 text-skyblue mx-auto flex items-center justify-center text-xl">
                        👥
                      </div>
                      <p className="text-xs text-slate-500 font-medium">No network connections established yet.</p>
                      <button
                        onClick={() => setActiveTab("search")}
                        className="px-4 py-2 bg-skyblue text-white text-xs font-bold rounded-lg uppercase tracking-wider hover:bg-navy transition-colors shadow-2xs"
                      >
                        Search Directory to Connect &rarr;
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ==================== TAB 3: CHATS & GROUPS ==================== */}
            {activeTab === "chat" && (
              <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden flex flex-col h-[580px]">
                
                {/* DM / Group Chat Header */}
                <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between flex-shrink-0 shadow-xs">
                  <div className="flex items-center space-x-3">
                    {selectedChatPeer ? (
                      <>
                        <img
                          src={selectedChatPeer.avatarUrl || `https://ui-avatars.com/api/?name=${selectedChatPeer.caName || 'CA'}&background=e0f2fe&color=0284c7&size=150`}
                          alt={selectedChatPeer.name || selectedChatPeer.caName}
                          className="h-10 w-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <h3 className="text-xs font-bold text-navy flex items-center space-x-2">
                            <span>{selectedChatPeer.isGroup ? selectedChatPeer.name : `CA. ${selectedChatPeer.caName}`}</span>
                          </h3>
                          <span className="text-[11px] text-emerald-500 flex items-center space-x-1.5 font-semibold mt-0.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                            <span>{selectedChatPeer.isGroup ? `${selectedChatPeer.memberIds.length} Members` : "Online"}</span>
                          </span>
                        </div>
                      </>
                    ) : (
                      <h3 className="text-xs font-bold text-navy flex items-center space-x-2">
                        <span>Direct Messaging & Groups</span>
                      </h3>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {selectedChatPeer && !selectedChatPeer.isGroup && (
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to block this user and report their profile? This action will remove them from your network.")) {
                            handleDisconnect(selectedChatPeer.userId || selectedChatPeer.id);
                          }
                        }}
                        className="px-3 py-1.5 border border-rose-200 text-rose-500 hover:bg-rose-50 text-[10px] font-bold rounded shadow-xs uppercase tracking-wider transition-smooth"
                      >
                        Block / Report
                      </button>
                    )}
                    <button
                      onClick={() => setShowCreateGroupModal(true)}
                      className="px-3 py-1.5 bg-skyblue hover:bg-navy text-white text-[10px] font-bold rounded shadow-xs uppercase tracking-wider flex items-center space-x-1"
                    >
                      <span>+</span>
                      <span>Create Group</span>
                    </button>
                  </div>
                </div>

                {/* Dual Panel Body */}
                <div className="flex flex-grow overflow-hidden">
                  
                  {/* Left Sidebar: Conversations & Groups list */}
                  <div className="w-1/3 border-r border-slate-200 bg-slate-50/50 overflow-y-auto flex flex-col">
                    
                    {/* Groups Section */}
                    {chatGroups.length > 0 && (
                      <div className="border-b border-slate-200 pb-2">
                        <div className="bg-slate-100/80 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200/50">
                          Group Channels
                        </div>
                        {chatGroups.map((group) => {
                          const isSelected = selectedChatPeer && selectedChatPeer.id === group.id;
                          const unreadCount = chatMessages.filter((m: any) => m.receiverId === group.id && m.senderId !== user.id && !m.isRead).length;
                          return (
                            <button
                              key={group.id}
                              onClick={() => handleSelectChatPeer(group)}
                              className={`w-full text-left p-3 flex items-center space-x-3 transition-smooth border-b border-slate-100 relative ${
                                isSelected ? "bg-sky-50/70 border-l-4 border-l-skyblue" : "hover:bg-slate-100"
                              }`}
                            >
                              <div className="h-8 w-8 rounded bg-gradient-to-br from-indigo-500 to-sky-500 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0 shadow-inner">
                                👥
                              </div>
                              <div className="truncate flex-grow">
                                <h4 className="text-xs font-bold text-navy truncate">{group.name}</h4>
                                <span className="text-[11px] text-slate-400 block truncate">{group.memberIds.length} members</span>
                              </div>
                              {unreadCount > 0 && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-rose-500 rounded-full shadow-sm"></div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Direct Messages Section */}
                    <div>
                      <div className="bg-slate-100/80 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200/50">
                        Direct Messages
                      </div>
                      {connectedPeers.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {connectedPeers.map((peer) => {
                            const isSelected = selectedChatPeer && !selectedChatPeer.isGroup && (selectedChatPeer.userId === peer.userId || selectedChatPeer.id === peer.id);
                            const peerId = peer.userId || peer.id;
                            const unreadCount = chatMessages.filter((m: any) => m.senderId === peerId && m.receiverId === user.id && !m.isRead).length;
                            return (
                              <button
                                key={peer.id}
                                onClick={() => handleSelectChatPeer(peer)}
                                className={`w-full text-left p-3 flex items-center space-x-3 transition-smooth relative ${
                                  isSelected ? "bg-sky-50/70 border-l-4 border-l-skyblue" : "hover:bg-slate-100"
                                }`}
                              >
                                <img
                                  src={peer.avatarUrl || `https://ui-avatars.com/api/?name=${peer.caName || 'CA'}&background=e0f2fe&color=0284c7&size=150`}
                                  alt={peer.caName}
                                  className="h-8 w-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                                />
                                <div className="truncate flex-grow">
                                  <h4 className="text-xs font-bold text-navy truncate">CA. {peer.caName}</h4>
                                  <span className="text-[11px] text-slate-400 block truncate">{peer.firmName}</span>
                                </div>
                                {unreadCount > 0 && (
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-rose-500 rounded-full shadow-sm"></div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 text-center py-4">No network CAs connected yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Right chat logs pane */}
                  <div className="w-2/3 flex flex-col justify-between h-full bg-white relative">
                    {selectedChatPeer ? (
                      <>
                        <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto max-h-[440px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                          
                          <div className="text-center space-y-2">
                            <div>
                              <span className="text-[10px] bg-slate-150 text-slate-500 px-3 py-1 rounded border border-slate-200 font-bold uppercase tracking-wider">
                                {selectedChatPeer.isGroup ? "CA GROUP NETWORKING FORUM" : "SECURE CLIENT REFERRAL PATHWAY"}
                              </span>
                            </div>
                          </div>

                          {activeChatMessages.map((msg) => {
                            const isMe = msg.senderId === user.id;
                            return (
                              <div
                                key={msg.id}
                                className={`flex flex-col max-w-[85%] space-y-1 ${
                                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                                }`}
                              >
                                <span className="text-[8px] text-slate-400 font-semibold px-1">
                                  {msg.senderName}
                                </span>
                                <div
                                  className={`p-2.5 rounded text-[11px] leading-relaxed text-justify ${
                                    isMe
                                      ? "bg-skyblue text-white rounded-br-none"
                                      : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200"
                                  }`}
                                >
                                  {msg.imageUrl && (
                                    <img src={msg.imageUrl} alt="attachment" className="max-w-full h-auto rounded mb-2 border border-black/10 shadow-sm" style={{ maxHeight: '200px' }} />
                                  )}
                                  {msg.content && (
                                    <span>
                                      {msg.content.split(/(https?:\/\/[^\s]+)/g).map((part: string, i: number) => 
                                        part.match(/(https?:\/\/[^\s]+)/g) ? (
                                          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline font-medium hover:opacity-80 break-all">{part}</a>
                                        ) : (
                                          <span key={i}>{part}</span>
                                        )
                                      )}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[7px] text-slate-400 pl-1">
                                  {new Date(msg.timestamp).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Input Area */}
                        {pendingAttachment && (
                          <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center space-x-3">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Image Attached:</span>
                            <img src={pendingAttachment} className="h-10 w-10 object-cover rounded shadow-sm border border-slate-300" />
                            <button onClick={() => setPendingAttachment(null)} className="text-rose-500 hover:text-rose-700 text-xs font-bold uppercase transition-smooth">
                              Remove
                            </button>
                          </div>
                        )}
                        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-slate-50 flex items-center space-x-2 flex-shrink-0">
                          <label className="cursor-pointer p-2 text-slate-400 hover:text-skyblue transition-smooth focus-ring rounded-full hover:bg-slate-200">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                          </label>
                          <input
                            type="text"
                            placeholder={selectedChatPeer.isGroup ? "Post a query or update to the group..." : "Discuss referral files or client details..."}
                            value={newMessageText}
                            onChange={(e) => setNewMessageText(e.target.value)}
                            className="flex-grow text-[11px] p-2 bg-white border border-slate-200 rounded focus-ring text-navy"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-skyblue hover:bg-navy text-white text-[11px] font-bold rounded shadow-xs uppercase tracking-wider"
                          >
                            Send
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-450 text-[11px] p-6 text-center space-y-2">
                        <span>Select a connection profile or a group panel to start chatting.</span>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* ==================== TAB 4: MY PROFILE ==================== */}
            {activeTab === "profile" && (
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-6">
                
                {updateSuccess && (
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-[11px] p-3 rounded">
                    {updateSuccess}
                  </div>
                )}
                {updateError && (
                  <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-[11px] p-3 rounded">
                    {updateError}
                  </div>
                )}

                {!isEditing ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <h2 className="text-lg font-bold text-navy">CA Profile Details</h2>
                        {user.firmName && <p className="text-[11px] text-slate-500 font-bold mt-1">{user.firmName}</p>}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShareCardPeer(user)}
                          className="text-[11px] bg-skyblue text-white rounded px-4 py-2 font-bold hover:bg-navy transition-smooth shadow-xs flex items-center space-x-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          <span>Share Profile</span>
                        </button>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="text-[11px] border border-slate-200 rounded px-4 py-2 font-bold text-navy hover:bg-slate-50 transition-smooth shadow-xs"
                        >
                          Edit Details
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 text-xs">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">COP Practice Experience</span>
                        <span className="font-bold text-navy">{user.yearsOfPractice} Years of Active COP</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Verification Number</span>
                        <span className="font-bold text-navy">ICAI MRN: {user.membershipNo}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Contact Mobile</span>
                        <span className="font-bold text-navy">{user.phone}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sub-location Area</span>
                        <span className="font-bold text-navy">{user.area || "Not provided"}</span>
                      </div>
                      {!user.hasCop && user.otherQualifications && (
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Other Qualifications</span>
                          <span className="font-bold text-navy">{user.otherQualifications}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specialised Domains</span>
                      <div className="flex flex-wrap gap-2">
                        {user.specialisations?.map((spec: string) => (
                          <span key={spec} className="bg-sky-50 text-skyblue border border-sky-100 text-[11px] px-2.5 py-1 rounded font-semibold">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {(user.linkedInUrl || user.twitterUrl || user.websiteUrl) && (
                      <div className="space-y-2">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Social & Web Links</span>
                        <div className="flex flex-wrap gap-3">
                          {user.linkedInUrl && (
                            <a href={user.linkedInUrl} target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 text-[11px] font-bold text-navy hover:text-skyblue transition-smooth bg-slate-50 border border-slate-150 px-3 py-1.5 rounded shadow-xs">
                              <svg className="w-3.5 h-3.5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                              <span>LinkedIn</span>
                            </a>
                          )}
                          {user.twitterUrl && (
                            <a href={user.twitterUrl} target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 text-[11px] font-bold text-navy hover:text-skyblue transition-smooth bg-slate-50 border border-slate-150 px-3 py-1.5 rounded shadow-xs">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                              <span>Twitter/X</span>
                            </a>
                          )}
                          {user.websiteUrl && (
                            <a href={user.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 text-[11px] font-bold text-navy hover:text-skyblue transition-smooth bg-slate-50 border border-slate-150 px-3 py-1.5 rounded shadow-xs">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                              <span>Website</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Firm Description / Bio</span>
                      <p className="text-xs text-slate-600 leading-relaxed text-justify whitespace-pre-line bg-slate-50 p-4 rounded border border-slate-150">
                        {user.bio || "No firm bio provided yet."}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={handleDeleteAccount}
                        className="text-[11px] text-slate-400 hover:text-rose-600 font-medium underline underline-offset-2 transition-smooth"
                      >
                        Delete My Account
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleProfileUpdate} className="space-y-5">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <h2 className="text-sm font-bold text-navy">Update Practice Profile</h2>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="text-[11px] text-slate-455 hover:text-navy font-semibold"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Avatar Upload from Gallery */}
                    <div className="space-y-3">
                      <label className="block text-[8px] font-bold text-navy uppercase tracking-wider">
                        Profile Picture
                      </label>
                      <div className="flex items-center space-x-4">
                        {/* Current / preview avatar */}
                        <div className="relative flex-shrink-0">
                          {selectedAvatar ? (
                            <img
                              src={selectedAvatar}
                              alt="Profile preview"
                              className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 shadow-sm"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center border-2 border-slate-200 shadow-sm">
                              <span className="text-xl font-bold text-skyblue">
                                {caName ? caName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "CA"}
                              </span>
                            </div>
                          )}
                          {selectedAvatar && (
                            <button
                              type="button"
                              onClick={() => setSelectedAvatar("")}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center hover:bg-rose-600 shadow"
                              title="Remove photo"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        {/* File picker */}
                        <div>
                          <label
                            htmlFor="avatar-upload"
                            className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 hover:border-skyblue hover:text-skyblue text-navy text-[11px] font-semibold rounded shadow-sm transition-smooth"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Choose from Gallery</span>
                          </label>
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarImageUpload}
                          />
                          <p className="text-[10px] text-slate-400 mt-1">Max 2MB · JPG, PNG, WebP</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] font-bold text-navy uppercase tracking-wider mb-1">CA Member Name *</label>
                        <input
                          type="text"
                          required
                          value={caName}
                          onChange={(e) => setCaName(e.target.value)}
                          className="w-full text-[11px] p-2 border border-slate-200 rounded focus-ring bg-slate-50 text-navy"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-navy uppercase tracking-wider mb-1">Firm Name *</label>
                        <input
                          type="text"
                          required
                          value={firmName}
                          onChange={(e) => setFirmName(e.target.value)}
                          className="w-full text-[11px] p-2 border border-slate-200 rounded focus-ring bg-slate-50 text-navy"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[8px] font-bold text-navy uppercase tracking-wider mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full text-[11px] p-2 border border-slate-200 rounded focus-ring bg-slate-50 text-navy"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-navy uppercase tracking-wider mb-1">Sub-location Area</label>
                        <input
                          type="text"
                          placeholder="e.g. Banjara Hills"
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          className="w-full text-[11px] p-2 border border-slate-200 rounded focus-ring bg-slate-50 text-navy"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-navy uppercase tracking-wider mb-1">State *</label>
                        <select
                          required
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full text-[11px] p-2 border border-slate-200 rounded focus-ring bg-slate-50 text-navy"
                        >
                          {IndianStates.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-navy uppercase tracking-wider mb-1">Years of COP</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={yearsOfPractice}
                          onChange={(e) => setYearsOfPractice(e.target.value)}
                          className="w-full text-[11px] p-2 border border-slate-200 rounded focus-ring bg-slate-50 text-navy"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <h3 className="text-[10px] font-bold text-navy uppercase tracking-wider mb-3">Social & Web Links</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[8px] font-bold text-navy uppercase tracking-wider mb-1">LinkedIn Profile</label>
                          <input
                            type="url"
                            placeholder="https://linkedin.com/in/..."
                            value={linkedInUrl}
                            onChange={(e) => setLinkedInUrl(e.target.value)}
                            className="w-full text-[11px] p-2 border border-slate-200 rounded focus-ring bg-slate-50 text-navy"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold text-navy uppercase tracking-wider mb-1">Twitter/X Profile</label>
                          <input
                            type="url"
                            placeholder="https://twitter.com/..."
                            value={twitterUrl}
                            onChange={(e) => setTwitterUrl(e.target.value)}
                            className="w-full text-[11px] p-2 border border-slate-200 rounded focus-ring bg-slate-50 text-navy"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold text-navy uppercase tracking-wider mb-1">Website</label>
                          <input
                            type="url"
                            placeholder="https://yourfirm.com"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            className="w-full text-[11px] p-2 border border-slate-200 rounded focus-ring bg-slate-50 text-navy"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] font-bold text-navy uppercase tracking-wider mb-1">Mobile Contact *</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full text-[11px] p-2 border border-slate-200 rounded focus-ring bg-slate-50 text-navy"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-navy uppercase tracking-wider mb-1">Account Privacy *</label>
                        <div className="flex items-center space-x-2 mt-2 text-[11px] font-medium text-slate-600">
                          <input
                            type="checkbox"
                            checked={isPrivate}
                            onChange={(e) => setIsPrivate(e.target.checked)}
                            className="rounded border-slate-300 text-skyblue focus:ring-skyblue"
                          />
                          <span>Private Account (Hide contact details from connections)</span>
                        </div>
                      </div>
                    </div>

                    {/* Professional Experience Section */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                        <label className="block text-[8px] font-bold text-navy uppercase tracking-wider">Professional Experience</label>
                        <button
                          type="button"
                          onClick={handleAddExperience}
                          className="text-[10px] text-skyblue hover:text-navy font-bold uppercase tracking-wider"
                        >
                          + Add Experience
                        </button>
                      </div>
                      
                      {experienceList.length > 0 ? (
                        <div className="space-y-3">
                          {experienceList.map((exp, index) => (
                            <div key={index} className="bg-slate-50 p-3 border border-slate-150 rounded space-y-2 relative">
                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveExperience(index)}
                                className="absolute top-2 right-2 text-rose-400 hover:text-rose-600 text-[14px] leading-none bg-rose-50 hover:bg-rose-100 rounded px-1.5 py-0.5 transition-smooth"
                                title="Remove Experience"
                              >
                                ×
                              </button>
                              <div>
                                <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1">Company / Firm Name</label>
                                <input
                                  type="text"
                                  required
                                  value={exp.companyName}
                                  onChange={(e) => handleExperienceChange(index, "companyName", e.target.value)}
                                  placeholder="e.g. KPMG, Deloitte"
                                  className="w-full text-[11px] p-2 border border-slate-200 rounded focus-ring bg-white text-navy"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1">From Year</label>
                                  <input
                                    type="number"
                                    min="1950"
                                    max={new Date().getFullYear()}
                                    value={exp.fromYear}
                                    onChange={(e) => handleExperienceChange(index, "fromYear", e.target.value)}
                                    placeholder="e.g. 2018"
                                    className="w-full text-[11px] p-2 border border-slate-200 rounded focus-ring bg-white text-navy"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1">To Year</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. 2023 or Present"
                                    value={exp.toYear}
                                    onChange={(e) => handleExperienceChange(index, "toYear", e.target.value)}
                                    className="w-full text-[11px] p-2 border border-slate-200 rounded focus-ring bg-white text-navy"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 bg-slate-50 border border-slate-150 border-dashed rounded text-[11px] text-slate-400">
                          No experience added yet. Click "+ Add Experience" to list past firms or companies.
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[8px] font-bold text-navy uppercase tracking-wider mb-2">Practice Specialties</label>
                      <div className="grid grid-cols-2 gap-2 border border-slate-150 p-3 rounded bg-slate-50">
                        {specialisationOptions.map((spec) => (
                          <label key={spec} className="flex items-center space-x-2 text-[11px] text-slate-655 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedSpecs.includes(spec)}
                              onChange={() => handleCheckboxChange(spec)}
                              className="rounded border-slate-350 text-navy focus:ring-skyblue"
                            />
                            <span>{spec}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] font-bold text-navy uppercase tracking-wider mb-1">Bio / Firm Description</label>
                      <textarea
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full text-[11px] p-2 border border-slate-200 rounded focus-ring bg-slate-50 text-navy leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-1.5 border border-slate-200 text-[11px] text-slate-500 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="px-5 py-1.5 bg-skyblue hover:bg-navy text-white text-[11px] font-bold rounded shadow-xs"
                      >
                        {isUpdating ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ==================== TAB 5: SHARE EXPERTISE & ISSUES FORUM ==================== */}
            {activeTab === "blogs" && (
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-navy via-navy to-slate-800 text-white rounded-xl p-6 shadow-md border border-slate-700/50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="inline-flex items-center space-x-2 bg-skyblue/20 text-skyblue border border-skyblue/30 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                        <span className="w-2 h-2 rounded-full bg-skyblue animate-ping"></span>
                        <span>CA Practitioner Forum</span>
                      </div>
                      <h2 className="text-xl font-extrabold text-white tracking-tight leading-snug">
                        Share your expertise and issues you have faced in your CA practice or career so far
                      </h2>
                      <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                        A peer-to-peer discussion forum for Chartered Accountants to crowd-source practical casework solutions, navigate assessment hurdle notices, debate tribunal precedents, or share lessons from your professional journey.
                      </p>
                    </div>

                    <button
                      onClick={() => setBlogFeedTab(blogFeedTab === "create" ? "feed" : "create")}
                      className={`inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm flex-shrink-0 ${
                        blogFeedTab === "create"
                          ? "bg-slate-700 text-white hover:bg-slate-600"
                          : "bg-skyblue text-white hover:bg-sky-600"
                      }`}
                    >
                      {blogFeedTab === "create" ? (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                          <span>Back to Discussions</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Share Experience / Issue</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Sub-tab Navigation */}
                  <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-slate-700/60 overflow-x-auto">
                    <button
                      onClick={() => setBlogFeedTab("feed")}
                      className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                        blogFeedTab === "feed"
                          ? "bg-white text-navy shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                      <span>Community Discussions</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${blogFeedTab === "feed" ? "bg-slate-100 text-navy" : "bg-white/20 text-white"}`}>
                        {allBlogs.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setBlogFeedTab("create")}
                      className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                        blogFeedTab === "create"
                          ? "bg-white text-navy shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Post Experience / Issue</span>
                    </button>

                    <button
                      onClick={() => setBlogFeedTab("mine")}
                      className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                        blogFeedTab === "mine"
                          ? "bg-white text-navy shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>My Shared Posts</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${blogFeedTab === "mine" ? "bg-slate-100 text-navy" : "bg-white/20 text-white"}`}>
                        {myBlogs.length}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Notifications & Status Alerts */}
                {blogSuccess && (
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs p-3.5 rounded-lg flex items-center justify-between shadow-xs">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-semibold">{blogSuccess}</span>
                    </div>
                    <button onClick={() => setBlogSuccess("")} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold">✕</button>
                  </div>
                )}
                {blogError && (
                  <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-xs p-3.5 rounded-lg flex items-center justify-between shadow-xs">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="font-semibold">{blogError}</span>
                    </div>
                    <button onClick={() => setBlogError("")} className="text-rose-700 hover:text-rose-900 text-xs font-bold">✕</button>
                  </div>
                )}

                {/* ================= VIEW: WRITE / PUBLISH NEW POST ================= */}
                {blogFeedTab === "create" && (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-sm font-bold text-navy uppercase tracking-wider flex items-center space-x-2">
                          <svg className="h-5 w-5 text-skyblue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Share Experience, Case Hurdle, or Practice Insight</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Share challenges faced in statutory audits, ITAT appeals, faceless assessments, MCA filings, or staff scaling.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handlePublishBlog} className="space-y-5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Post Title / Subject Line *
                        </label>
                        <input
                          type="text"
                          value={blogTitle}
                          onChange={(e) => setBlogTitle(e.target.value)}
                          placeholder="e.g., Practical challenges with Section 148A reassessment notices or GST ITC matching under Rule 36(4)"
                          className="w-full text-sm p-3.5 bg-slate-50 border border-slate-200 rounded-lg focus-ring text-navy font-semibold placeholder:text-slate-400"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Detailed Experience / Issue Description *
                        </label>
                        <textarea
                          value={blogContent}
                          onChange={(e) => setBlogContent(e.target.value)}
                          placeholder="Detail the case background, the statutory issue or operational difficulty encountered, how you approached it, and what questions or recommendations you have for fellow CAs..."
                          rows={8}
                          className="w-full text-sm p-3.5 bg-slate-50 border border-slate-200 rounded-lg focus-ring text-navy leading-relaxed resize-y placeholder:text-slate-400"
                          required
                        />
                      </div>

                      {/* Image Upload Area */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Attach Supporting Screenshot or Document Image (Optional)
                        </label>
                        
                        {blogImagePreview ? (
                          <div className="relative border border-slate-200 rounded-lg p-3 bg-slate-50 max-w-md">
                            <img
                              src={blogImagePreview}
                              alt="Upload preview"
                              className="w-full max-h-56 object-cover rounded-md border border-slate-200 shadow-xs"
                            />
                            <div className="mt-2 flex items-center justify-between text-xs">
                              <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Image attached</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setBlogImage("");
                                  setBlogImagePreview("");
                                }}
                                className="text-rose-500 hover:text-rose-700 font-bold uppercase text-[10px] tracking-wider"
                              >
                                Remove Image
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-slate-200 rounded-lg p-5 hover:border-skyblue bg-slate-50/50 transition-colors text-center cursor-pointer relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePostImageChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-xs font-bold text-navy">Click or drag image here to attach</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Supports PNG, JPG, WebP up to 5MB (charts, portal error screenshots, tribunal extracts)</p>
                          </div>
                        )}
                      </div>

                      {/* Tag Selection */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Practice Domain Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {specialisationOptions.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleBlogTagToggle(tag)}
                              className={`text-[11px] px-3 py-1.5 rounded-md border font-semibold transition-all ${
                                blogTags.includes(tag)
                                  ? "bg-skyblue text-white border-skyblue shadow-xs"
                                  : "bg-white text-slate-600 border-slate-200 hover:border-skyblue hover:text-skyblue"
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Submit Actions */}
                      <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setBlogFeedTab("feed")}
                          className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-navy transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={blogLoading}
                          className="px-6 py-2.5 bg-skyblue hover:bg-navy text-white font-bold text-xs rounded-lg transition-all shadow-sm uppercase tracking-wider disabled:opacity-50 flex items-center space-x-2"
                        >
                          {blogLoading && (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          )}
                          <span>{blogLoading ? "Publishing to Network..." : "Publish Post"}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ================= VIEW: COMMUNITY DISCUSSIONS FEED ================= */}
                {blogFeedTab === "feed" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Recent Peer Experiences & Discussions ({allBlogs.length})
                      </span>
                      <button
                        onClick={fetchAllBlogs}
                        className="text-xs text-skyblue hover:text-navy font-bold flex items-center space-x-1"
                      >
                        <span>↻ Refresh Feed</span>
                      </button>
                    </div>

                    {allBlogs.length === 0 ? (
                      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
                        <div className="w-14 h-14 bg-sky-50 rounded-full flex items-center justify-center text-skyblue mx-auto mb-3">
                          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </div>
                        <h4 className="text-sm font-bold text-navy">No Community Posts Yet</h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                          Be the first to share an interesting case study, assessment ruling, or practice challenge with the CAnnect network.
                        </p>
                        <button
                          onClick={() => setBlogFeedTab("create")}
                          className="px-5 py-2.5 bg-skyblue hover:bg-navy text-white text-xs font-bold rounded-lg transition-all shadow-xs"
                        >
                          Start First Discussion
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {allBlogs.map((blog: any) => {
                          const author = blog.user || {};
                          const authorName = author.caName || blog.caName || "Chartered Accountant";
                          const authorFirm = author.firmName || blog.firmName || "Chartered Practice";
                          const authorCity = author.city || blog.city;
                          const authorState = author.state || blog.state;

                          return (
                            <article
                              key={blog.id}
                              className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs transition-all space-y-4"
                            >
                              {/* Post Author Bar */}
                              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={
                                      author.avatarUrl ||
                                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        authorName
                                      )}&background=e0f2fe&color=0284c7&size=100`
                                    }
                                    alt={authorName}
                                    className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                                  />
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <h4 className="text-xs font-extrabold text-navy">
                                        CA. {authorName}
                                      </h4>
                                      <span className="text-[9px] bg-sky-50 text-skyblue border border-sky-150 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                                        Verified CA
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                      {authorFirm} {authorCity ? `• ${authorCity}, ${authorState}` : ""}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <span className="text-[10px] text-slate-400 font-medium hidden sm:inline-block">
                                    {new Date(blog.timestamp).toLocaleDateString("en-IN", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                  {author.id && author.id !== user?.id && (
                                    <button
                                      onClick={() => setViewProfilePeer(author)}
                                      className="text-[11px] font-bold text-skyblue hover:text-navy border border-sky-100 hover:border-navy px-2.5 py-1 rounded transition-colors"
                                    >
                                      View Profile
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Title & Tags */}
                              <div>
                                <h3 className="text-base font-bold text-navy leading-snug">
                                  {blog.title}
                                </h3>
                                {blog.tags && blog.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {blog.tags.map((tag: string) => (
                                      <span
                                        key={tag}
                                        className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-semibold"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Post Body Content */}
                              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line text-justify">
                                {blog.content}
                              </p>

                              {/* Attached Image if Present */}
                              {blog.imageUrl && (
                                <div className="pt-2">
                                  <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 max-h-96 flex items-center justify-center">
                                    <img
                                      src={blog.imageUrl}
                                      alt={blog.title}
                                      className="max-h-96 w-full object-contain rounded-lg"
                                      loading="lazy"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Footer Meta */}
                              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                                <span className="flex items-center space-x-1.5 text-slate-500">
                                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span>Verified Practitioner Casework</span>
                                </span>
                                <span className="text-slate-400">
                                  Posted on {new Date(blog.timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ================= VIEW: MY SHARED POSTS ================= */}
                {blogFeedTab === "mine" && (
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold text-navy uppercase tracking-wider flex items-center space-x-2">
                        <svg className="h-5 w-5 text-skyblue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <span>My Published Discussions ({myBlogs.length})</span>
                      </h3>
                      <button
                        onClick={() => setBlogFeedTab("create")}
                        className="text-xs font-bold text-skyblue hover:text-navy"
                      >
                        + Create New Post
                      </button>
                    </div>

                    {myBlogs.length === 0 ? (
                      <div className="text-center py-10 text-slate-400">
                        <svg className="h-12 w-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <p className="text-xs font-semibold text-navy">You haven't shared any experiences or issues yet.</p>
                        <p className="text-[11px] mt-1 text-slate-500">Post casework hurdles or solutions to build your professional reputation!</p>
                        <button
                          onClick={() => setBlogFeedTab("create")}
                          className="mt-3 px-4 py-2 bg-skyblue text-white text-xs font-bold rounded shadow-xs hover:bg-navy transition-colors"
                        >
                          Write a Post Now
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {myBlogs.map((blog: any) => (
                          <div
                            key={blog.id}
                            className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-smooth space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-grow">
                                <h4 className="text-sm font-bold text-navy leading-snug">{blog.title}</h4>
                                <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                                  {new Date(blog.timestamp).toLocaleDateString("en-IN", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDeleteBlog(blog.id)}
                                className="text-[10px] font-bold text-rose-500 hover:text-rose-700 uppercase tracking-wider transition-colors flex-shrink-0 ml-3 border border-rose-200 px-2.5 py-1 rounded bg-rose-50/50"
                              >
                                Delete
                              </button>
                            </div>

                            {blog.tags && blog.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {blog.tags.map((tag: string) => (
                                  <span
                                    key={tag}
                                    className="bg-sky-50 text-skyblue border border-sky-100 text-[10px] px-2 py-0.5 rounded font-medium"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                              {blog.content}
                            </p>

                            {blog.imageUrl && (
                              <div className="pt-2">
                                <img
                                  src={blog.imageUrl}
                                  alt={blog.title}
                                  className="w-full max-h-64 object-cover rounded-md border border-slate-200"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* ==================== TAB 6: ADMIN PANEL ==================== */}
            {activeTab === "admin" && user?.role === "admin" && (
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-navy uppercase tracking-wider">Admin Panel: Registered Users ({adminUsers.length})</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">Manage and review all platform member accounts</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/admin"
                      className="text-[11px] font-bold text-navy border border-slate-200 hover:border-skyblue hover:text-skyblue bg-slate-50 px-3 py-1.5 rounded transition-smooth shadow-xs"
                    >
                      Advanced Admin Suite &rarr;
                    </Link>
                    <button onClick={fetchAdminUsers} className="text-xs text-skyblue hover:text-navy font-bold px-2 py-1">↻ Refresh</button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
                  {(["all", "pending", "approved", "rejected"] as const).map((st) => {
                    const count = st === "all" 
                      ? adminUsers.length 
                      : adminUsers.filter(u => (u.status || "approved") === st).length;
                    return (
                      <button
                        key={st}
                        onClick={() => setAdminFilterStatus(st)}
                        className={`px-3 py-1.5 text-xs font-bold rounded capitalize transition-smooth ${
                          adminFilterStatus === st
                            ? "bg-navy text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {st} ({count})
                      </button>
                    );
                  })}
                </div>
                
                <div className="space-y-4">
                  {adminUsers.filter(u => adminFilterStatus === "all" || (u.status || "approved") === adminFilterStatus).length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8">No {adminFilterStatus !== "all" ? adminFilterStatus : ""} users found.</p>
                  ) : (
                    adminUsers
                      .filter(u => adminFilterStatus === "all" || (u.status || "approved") === adminFilterStatus)
                      .map((u) => {
                        const currentStatus = u.status || "approved";
                        return (
                          <div key={u.id} className="border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 hover:border-slate-300 transition-smooth bg-white">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-navy text-sm">CA. {u.caName}</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                  currentStatus === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                  currentStatus === "rejected" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                                  "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}>
                                  {currentStatus}
                                </span>
                                {u.hasCop && <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">Has CoP</span>}
                                {u.role === "admin" && <span className="text-[9px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">Admin</span>}
                              </div>
                              <p className="text-xs text-slate-600 mt-1">ICAI Reg No: <span className="font-mono bg-slate-100 px-1 rounded">{u.membershipNo}</span></p>
                              <p className="text-xs text-slate-500 mt-1">{u.email} {u.phone ? `| ${u.phone}` : ""}</p>
                              <p className="text-[11px] text-slate-400 mt-1">Firm: {u.firmName || "Individual Practice"} &bull; {u.city || "N/A"}, {u.state || "N/A"}</p>
                            </div>
                            <div className="flex space-x-2">
                              {currentStatus !== "approved" && (
                                <button
                                  onClick={async () => {
                                    if (confirm(`Approve CA. ${u.caName}?`)) {
                                      await fetch("/api/admin/users", {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ adminId: user.id, targetUserId: u.id, status: "approved" })
                                      });
                                      fetchAdminUsers();
                                    }
                                  }}
                                  className="px-3.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold rounded shadow-xs transition-smooth"
                                >
                                  Approve
                                </button>
                              )}
                              {currentStatus !== "rejected" && (
                                <button
                                  onClick={async () => {
                                    if (confirm(`Reject CA. ${u.caName}?`)) {
                                      await fetch("/api/admin/users", {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ adminId: user.id, targetUserId: u.id, status: "rejected" })
                                      });
                                      fetchAdminUsers();
                                    }
                                  }}
                                  className="px-3.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded shadow-xs transition-smooth"
                                >
                                  Reject
                                </button>
                              )}
                              {currentStatus !== "pending" && (
                                <button
                                  onClick={async () => {
                                    if (confirm(`Reset status for CA. ${u.caName} to pending?`)) {
                                      await fetch("/api/admin/users", {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ adminId: user.id, targetUserId: u.id, status: "pending" })
                                      });
                                      fetchAdminUsers();
                                    }
                                  }}
                                  className="px-3.5 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold rounded shadow-xs transition-smooth"
                                >
                                  Set Pending
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            )}

          </section>

        </div>
      </main>

      {/* ==================== CREATE GROUP DIALOG MODAL ==================== */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateGroup}
            className="bg-white border border-slate-200 rounded-xl max-w-md w-full shadow-2xl overflow-hidden p-6 space-y-4"
          >
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
                Create Networking Group
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowCreateGroupModal(false);
                  setNewGroupName("");
                  setSelectedGroupMembers([]);
                }}
                className="text-slate-400 hover:text-navy text-sm font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[8px] font-bold text-navy uppercase tracking-wider mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyderabad Audit Panel"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full text-[11px] p-2.5 border border-slate-250 rounded focus-ring bg-slate-50 text-navy"
                />
              </div>

              <div>
                <label className="block text-[8px] font-bold text-navy uppercase tracking-wider mb-2">
                  Select Members to Add
                </label>
                {connectedPeers.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto border border-slate-150 rounded divide-y divide-slate-100 bg-slate-50 p-2 space-y-1">
                    {connectedPeers.map((peer) => (
                      <label key={peer.id} className="flex items-center space-x-2 p-1.5 hover:bg-white rounded cursor-pointer text-[11px] text-slate-700">
                        <input
                          type="checkbox"
                          checked={selectedGroupMembers.includes(peer.userId)}
                          onChange={() => handleGroupMemberCheckbox(peer.userId)}
                          className="rounded border-slate-300 text-skyblue focus:ring-skyblue"
                        />
                        <img src={peer.avatarUrl} alt={peer.caName} className="h-5 w-5 rounded-full object-cover border border-slate-150" />
                        <span>CA. {peer.caName} ({peer.city})</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">No connected network peers. Connect with CAs first to add them to groups.</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateGroupModal(false);
                  setNewGroupName("");
                  setSelectedGroupMembers([]);
                }}
                className="px-3.5 py-1.5 border border-slate-200 text-[11px] font-semibold rounded text-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newGroupName.trim()}
                className="px-4 py-1.5 bg-skyblue hover:bg-navy text-white text-[11px] font-bold rounded shadow-xs uppercase tracking-wider"
              >
                Create Group
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Member Card Modal */}
      {shareCardPeer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden relative">
            <button
              onClick={() => setShareCardPeer(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-navy z-10 bg-white/50 rounded-full p-1"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Card Content */}
            <div id="business-card-content" className="relative p-8 pb-6 text-center bg-gradient-to-br from-slate-50 to-sky-50 border border-slate-200 rounded-t-xl">
              
              <div className="flex justify-center mb-6">
                <div className="bg-white rounded-full px-5 py-2 shadow-sm border border-slate-100 inline-block">
                  <img src="/logo.png" alt="CAnnect" className="h-6 object-contain" />
                </div>
              </div>

              <div className="mb-6">
                <img
                  src={shareCardPeer.avatarUrl || `https://ui-avatars.com/api/?name=${shareCardPeer.caName || 'CA'}&background=e0f2fe&color=0284c7&size=150`}
                  alt={shareCardPeer.caName}
                  crossOrigin="anonymous"
                  className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md mx-auto"
                />
                <div className="mt-4">
                  <h3 className="text-xl font-bold text-navy leading-tight">CA. {shareCardPeer.caName}</h3>
                  <p className="text-sm font-semibold text-slate-600 mt-1 leading-tight">{shareCardPeer.firmName}</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center pt-2 space-y-1.5 text-xs text-slate-600 font-medium">
                {shareCardPeer.phone && (
                  <div className="flex items-center space-x-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-xs w-full max-w-[240px] justify-center">
                    <svg className="w-3.5 h-3.5 text-skyblue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    <span>{shareCardPeer.phone}</span>
                  </div>
                )}
                {shareCardPeer.email && (
                  <div className="flex items-center space-x-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-xs w-full max-w-[240px] justify-center">
                    <svg className="w-3.5 h-3.5 text-skyblue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    <span>{shareCardPeer.email}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-xs w-full max-w-[240px] justify-center">
                  <svg className="w-3.5 h-3.5 text-skyblue flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span className="truncate">{shareCardPeer.area ? `${shareCardPeer.area}, ` : ''}{shareCardPeer.city}, {shareCardPeer.state}</span>
                </div>
              </div>

              <div className="relative z-10 pt-4 border-t border-slate-200/50">
                <div id="share-actions" className="flex flex-col space-y-2">
                  <button
                    onClick={async () => {
                      const cardElement = document.getElementById("business-card-content");
                      if (cardElement) {
                        try {
                          const html2canvas = (await import('html2canvas')).default;
                          const actionDiv = document.getElementById("share-actions");
                          if (actionDiv) actionDiv.style.display = 'none';
                          
                          const canvas = await html2canvas(cardElement, {
                            backgroundColor: '#f8fafc',
                            scale: 2,
                            useCORS: true,
                          });
                          
                          if (actionDiv) actionDiv.style.display = 'flex';

                          const shareText = `CA. ${shareCardPeer.caName}\n${shareCardPeer.firmName}\n📞 ${shareCardPeer.phone || 'Not Available'}\n✉️ ${shareCardPeer.email || 'Not Available'}\n📍 ${shareCardPeer.area ? shareCardPeer.area + ', ' : ''}${shareCardPeer.city}, ${shareCardPeer.state}\n\n🔗 Let's CAnnect:\nhttps://cannect.com/directory/${shareCardPeer.userId || shareCardPeer.id}`;

                          canvas.toBlob(async (blob) => {
                            if (blob) {
                              const file = new File([blob], `CAnnect_Card_${shareCardPeer.caName.replace(/\s+/g, '_')}.png`, { type: "image/png" });
                              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                try {
                                  await navigator.share({
                                    title: `Profile of CA. ${shareCardPeer.caName}`,
                                    text: shareText,
                                    files: [file]
                                  });
                                } catch (e) {
                                  console.log("Share cancelled", e);
                                }
                              } else {
                                // Fallback: Download the image and copy text
                                const imgData = canvas.toDataURL("image/png");
                                const link = document.createElement("a");
                                link.href = imgData;
                                link.download = file.name;
                                link.click();
                                navigator.clipboard.writeText(shareText);
                                alert("Card downloaded & text copied to clipboard!");
                              }
                            }
                          });

                        } catch (e) {
                          console.error("Failed to generate image", e);
                        }
                      }
                    }}
                    className="w-full py-3 bg-skyblue hover:bg-navy text-white text-xs font-bold rounded shadow-md uppercase tracking-widest transition-smooth flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                    <span>Share Virtual Card</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Detailed View Profile Modal */}
      {viewProfilePeer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden relative my-auto border border-slate-200">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-lg font-bold text-navy flex items-center space-x-2">
                <span>Profile Details</span>
              </h2>
              <button
                onClick={() => setViewProfilePeer(null)}
                className="text-[11px] font-bold text-slate-500 hover:text-navy bg-white border border-slate-200 px-4 py-1.5 rounded shadow-xs uppercase tracking-wider transition-smooth"
              >
                Back to Dashboard
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              {/* Header Info */}
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <img
                  src={viewProfilePeer.avatarUrl || `https://ui-avatars.com/api/?name=${viewProfilePeer.caName || 'CA'}&background=e0f2fe&color=0284c7&size=150`}
                  alt={viewProfilePeer.caName}
                  className="h-24 w-24 md:h-32 md:w-32 rounded-full object-cover border-4 border-slate-100 shadow-sm"
                />
                <div className="space-y-2">
                  <div>
                    <h3 className="text-2xl font-bold text-navy">CA. {viewProfilePeer.caName}</h3>
                    <p className="text-sm font-semibold text-slate-600">{viewProfilePeer.firmName}</p>
                  </div>
                  <p className="text-xs text-slate-500">{viewProfilePeer.city}, {viewProfilePeer.state}</p>
                  <div className="flex items-center space-x-2 pt-1">
                    <span className="text-skyblue font-bold text-xs bg-sky-50 px-2 py-1 rounded">
                      {viewProfilePeer.connectionCount || 0} Connections
                    </span>
                    <button
                      onClick={() => {
                        setViewProfilePeer(null);
                        setShareCardPeer(viewProfilePeer);
                      }}
                      className="text-[10px] font-bold text-navy uppercase tracking-widest hover:text-skyblue flex items-center space-x-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Verified Contact Details - Only Available Inside View Profile */}
              <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-navy uppercase tracking-wider flex items-center space-x-1.5">
                    <svg className="w-4 h-4 text-skyblue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Verified Contact Particulars</span>
                  </h4>
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-100/80 border border-sky-200 px-2 py-0.5 rounded-full">
                    Exclusive Profile View
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center text-skyblue flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] uppercase font-bold text-slate-400">Mobile Phone</p>
                        <p className="text-xs font-extrabold text-navy truncate">{viewProfilePeer.phone || "Not Provided"}</p>
                      </div>
                    </div>
                    {viewProfilePeer.phone && (
                      <a
                        href={`tel:${viewProfilePeer.phone}`}
                        className="text-[10px] font-bold text-skyblue hover:text-navy bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded transition-colors flex-shrink-0 ml-2"
                      >
                        Call
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center text-skyblue flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] uppercase font-bold text-slate-400">Email Address</p>
                        <p className="text-xs font-extrabold text-navy truncate">{viewProfilePeer.email || "Not Provided"}</p>
                      </div>
                    </div>
                    {viewProfilePeer.email && (
                      <a
                        href={`mailto:${viewProfilePeer.email}`}
                        className="text-[10px] font-bold text-skyblue hover:text-navy bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded transition-colors flex-shrink-0 ml-2"
                      >
                        Email
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-150 rounded-lg p-5">
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">COP Practice</span>
                  <span className="font-bold text-navy text-xs">{viewProfilePeer.yearsOfPractice || "N/A"} Years</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">ICAI MRN</span>
                  <span className="font-bold text-navy text-xs">{viewProfilePeer.membershipNo || "XXXXXX"}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Peer Status</span>
                  <span className="font-bold text-emerald-600 text-xs flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Active Member</span>
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sub-location Area</span>
                  <span className="font-bold text-navy text-xs">{viewProfilePeer.area || "Not provided"}</span>
                </div>
              </div>

              {/* Specialisations */}
              {viewProfilePeer.specialisations && viewProfilePeer.specialisations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specialised Domains</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewProfilePeer.specialisations.map((spec: string) => (
                      <span key={spec} className="bg-white border border-slate-200 text-skyblue text-[11px] px-3 py-1.5 rounded shadow-sm font-semibold">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Firm Description / Bio</h4>
                <p className="text-sm text-slate-600 leading-relaxed text-justify whitespace-pre-line border-l-4 border-skyblue pl-4">
                  {viewProfilePeer.bio || "No description provided."}
                </p>
              </div>

              {/* Social Links */}
              {(viewProfilePeer.linkedInUrl || viewProfilePeer.twitterUrl || viewProfilePeer.websiteUrl) && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Connect Elsewhere</h4>
                  <div className="flex flex-wrap gap-3">
                    {viewProfilePeer.linkedInUrl && (
                      <a href={viewProfilePeer.linkedInUrl} target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-xs font-bold text-navy hover:text-skyblue transition-smooth bg-slate-50 border border-slate-150 px-4 py-2 rounded shadow-xs">
                        <svg className="w-4 h-4 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {viewProfilePeer.twitterUrl && (
                      <a href={viewProfilePeer.twitterUrl} target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-xs font-bold text-navy hover:text-skyblue transition-smooth bg-slate-50 border border-slate-150 px-4 py-2 rounded shadow-xs">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        <span>Twitter</span>
                      </a>
                    )}
                    {viewProfilePeer.websiteUrl && (
                      <a href={viewProfilePeer.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-xs font-bold text-navy hover:text-skyblue transition-smooth bg-slate-50 border border-slate-150 px-4 py-2 rounded shadow-xs">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                        <span>Website</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Published Blogs */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <span>Published Blogs ({profileBlogs.length})</span>
                </h4>
                {profileBlogs.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic pl-1">No blogs published yet.</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {profileBlogs.map((blog: any) => (
                      <div
                        key={blog.id}
                        className="border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-smooth cursor-pointer"
                        onClick={() => setExpandedBlogId(expandedBlogId === blog.id ? null : blog.id)}
                      >
                        <div className="flex items-start justify-between">
                          <h5 className="text-xs font-bold text-navy leading-snug flex-grow">{blog.title}</h5>
                          <svg
                            className={`h-4 w-4 text-slate-400 flex-shrink-0 ml-2 transition-transform ${expandedBlogId === blog.id ? "rotate-180" : ""}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">
                          {new Date(blog.timestamp).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {blog.tags.map((tag: string) => (
                              <span key={tag} className="bg-sky-50 text-skyblue border border-sky-100 text-[9px] px-1.5 py-0.5 rounded font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {expandedBlogId === blog.id && (
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                            {blog.imageUrl && (
                              <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 max-h-60 flex items-center justify-center">
                                <img
                                  src={blog.imageUrl}
                                  alt={blog.title}
                                  className="max-h-60 w-full object-contain rounded-lg"
                                />
                              </div>
                            )}
                            <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line text-justify">
                              {blog.content}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-slate-100 flex justify-end space-x-3">
                {getConnectionStatus(viewProfilePeer.userId) === "Connected" ? (
                  <button
                    onClick={() => {
                      setViewProfilePeer(null);
                      setSelectedChatPeer(viewProfilePeer);
                      setActiveTab("chat");
                    }}
                    className="px-6 py-2 bg-navy hover:bg-slate-800 text-white font-bold text-xs rounded transition-smooth shadow-xs uppercase tracking-wider"
                  >
                    Message
                  </button>
                ) : getConnectionStatus(viewProfilePeer.userId) === "Connect" ? (
                  <button
                    onClick={() => {
                      handleSendConnectRequest(viewProfilePeer.userId);
                    }}
                    className="px-6 py-2 bg-skyblue hover:bg-sky-600 text-white font-bold text-xs rounded transition-smooth shadow-xs uppercase tracking-wider"
                  >
                    Connect
                  </button>
                ) : getConnectionStatus(viewProfilePeer.userId) === "Pending Approval" ? (
                  <span className="px-6 py-2 bg-slate-100 border border-slate-200 text-slate-500 font-bold text-xs rounded uppercase tracking-wider">
                    Pending
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setViewProfilePeer(null);
                      setActiveTab("connections");
                    }}
                    className="px-6 py-2 bg-amber-500 text-white font-bold text-xs rounded hover:bg-amber-600 transition-smooth shadow-xs uppercase tracking-wider"
                  >
                    Respond
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
      {/* End main conditional block */}
      </>
      )}
    </div>
  );
}
