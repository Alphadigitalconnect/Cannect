import fs from "fs";
import path from "path";

const isProd = process.env.NODE_ENV === "production";
const dataDir = isProd
  ? path.join(process.cwd(), "..", "cannect_data")
  : path.join(process.cwd(), "data");
const presencePath = path.join(dataDir, "presence.json");

function ensureDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export interface UserPresence {
  status: "online" | "offline";
  lastActive: string;
}

export function readPresence(): Record<string, UserPresence> {
  try {
    ensureDir();
    if (!fs.existsSync(presencePath)) return {};
    const content = fs.readFileSync(presencePath, "utf-8");
    return JSON.parse(content || "{}");
  } catch (err) {
    return {};
  }
}

export function writePresence(data: Record<string, UserPresence>) {
  try {
    ensureDir();
    fs.writeFileSync(presencePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing presence:", err);
  }
}

export function setUserPresence(userId: string, status: "online" | "offline") {
  if (!userId) return;
  const store = readPresence();
  store[userId] = {
    status,
    lastActive: new Date().toISOString(),
  };
  writePresence(store);
}

export function getOnlineUserIds(): string[] {
  const store = readPresence();
  const now = Date.now();
  const activeThresholdMs = 75 * 1000; // 75 seconds threshold for active heartbeat

  const onlineIds: string[] = [];
  Object.entries(store).forEach(([userId, pres]) => {
    if (pres.status === "online") {
      const diff = now - new Date(pres.lastActive).getTime();
      if (diff <= activeThresholdMs) {
        onlineIds.push(userId);
      }
    }
  });
  return onlineIds;
}
