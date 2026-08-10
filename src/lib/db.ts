import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "db.json");

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export interface Experience {
  companyName: string;
  fromYear?: string;
  toYear?: string;
  yearsOfExperience?: number;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  caName: string;
  membershipNo: string;
  firmName: string;
  specialisations: string[];
  city: string;
  state: string;
  area?: string;
  yearsOfPractice: number;
  phone: string;
  bio: string;
  avatarUrl?: string;
  isPrivate?: boolean;
  experience?: Experience[];
  status?: "pending" | "approved" | "rejected";
  role?: "admin" | "user";
}

export interface Firm {
  id: string;
  userId: string;
  caName: string;
  membershipNo: string;
  firmName: string;
  specialisations: string[];
  city: string;
  state: string;
  area?: string;
  yearsOfPractice: number;
  phone: string;
  email: string;
  bio: string;
  avatarUrl?: string;
  isPrivate?: boolean;
  experience?: Experience[];
  status?: "pending" | "approved" | "rejected";
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  content: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  mode: "Online" | "Offline" | string;
  location: string;
  cpeHours: number;
  description: string;
  status: "Upcoming" | "Past" | string;
  rsvps?: string[]; // user emails
}

export interface NotifyEmail {
  email: string;
  timestamp: string;
}

export interface ContactRequest {
  id: string;
  firmId: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  message: string;
  timestamp: string;
}

export interface PostComment {
  id: string;
  userId: string;
  caName: string;
  content: string;
  timestamp: string;
}

export interface Post {
  id: string;
  userId: string;
  caName: string;
  firmName: string;
  avatarUrl?: string;
  content: string;
  imageUrl?: string;
  likes: string[]; // user IDs
  comments: PostComment[];
  timestamp: string;
}

export interface Connection {
  id: string;
  senderId: string;
  receiverId: string;
  status: "pending" | "accepted" | "rejected";
  timestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;  // user ID or group ID
  content: string;
  imageUrl?: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatGroup {
  id: string;
  name: string;
  isGroup: true;
  avatarUrl?: string;
  memberIds: string[];
}

export interface DbSchema {
  users: User[];
  firms: Firm[];
  articles: Article[];
  events: EventItem[];
  notifyList: NotifyEmail[];
  contactRequests: ContactRequest[];
  posts: Post[];
  connections: Connection[];
  messages: Message[];
  chatGroups: ChatGroup[];
}

export function readDb(): DbSchema {
  try {
    ensureDataDir();
    if (!fs.existsSync(dbPath)) {
      const initialSchema: DbSchema = {
        users: [],
        firms: [],
        articles: [],
        events: [],
        notifyList: [],
        contactRequests: [],
        posts: [],
        connections: [],
        messages: [],
        chatGroups: []
      };
      fs.writeFileSync(dbPath, JSON.stringify(initialSchema, null, 2), "utf-8");
      return initialSchema;
    }
    const data = fs.readFileSync(dbPath, "utf-8");
    const parsed = JSON.parse(data) as any;
    
    // Safety fallback initialization for new schema fields
    if (!parsed.posts) parsed.posts = [];
    if (!parsed.connections) parsed.connections = [];
    if (!parsed.contactRequests) parsed.contactRequests = [];
    if (!parsed.messages) parsed.messages = [];
    if (!parsed.chatGroups) parsed.chatGroups = [];
    
    return parsed as DbSchema;
  } catch (error) {
    console.error("Error reading database file:", error);
    return {
      users: [],
      firms: [],
      articles: [],
      events: [],
      notifyList: [],
      contactRequests: [],
      posts: [],
      connections: [],
      messages: [],
      chatGroups: []
    };
  }
}

export function writeDb(data: DbSchema): boolean {
  try {
    ensureDataDir();
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing to database file:", error);
    return false;
  }
}
