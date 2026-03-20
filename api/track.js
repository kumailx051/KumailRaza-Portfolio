import { addVisit } from "./_visitStore.js";

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) {
    return realIp.trim();
  }

  const socketIp = req.socket?.remoteAddress;
  if (typeof socketIp === "string" && socketIp.trim()) {
    return socketIp.trim();
  }

  return "unknown";
}

async function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;

  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const body = await parseBody(req);
    const section = String(body.section || "Home").trim() || "Home";
    const ip = getClientIp(req);
    const ua = String(req.headers["user-agent"] || "unknown");

    const result = await addVisit({ section, ip, ua });
    return res.status(200).json({ ok: true, persisted: result.persisted });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to track visit" });
  }
}
