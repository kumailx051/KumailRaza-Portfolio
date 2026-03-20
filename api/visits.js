import { getAllVisits } from "./_visitStore.js";

function buildView(visits) {
  const normalizeSection = (section) => String(section || "Home")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "home";

  const ipToUser = new Map();
  let userCounter = 1;

  const sections = new Map();
  const recent = [];

  for (const visit of visits) {
    const ip = visit.ip || "unknown";
    if (!ipToUser.has(ip)) {
      ipToUser.set(ip, `user${userCounter}`);
      userCounter += 1;
    }

    const user = ipToUser.get(ip);
    recent.push({
      section: visit.section,
      ip,
      user,
      timestamp: visit.timestamp,
    });

    const sectionKey = visit.sectionKey || normalizeSection(visit.section);

    if (!sections.has(sectionKey)) {
      sections.set(sectionKey, {
        section: visit.section || "Home",
        count: 0,
        users: new Map(),
      });
    }

    const bucket = sections.get(sectionKey);
    bucket.count += 1;

    if (!bucket.users.has(ip)) {
      bucket.users.set(ip, {
        ip,
        user,
        count: 0,
        lastVisited: visit.timestamp,
      });
    }

    const person = bucket.users.get(ip);
    person.count += 1;
    person.lastVisited = visit.timestamp;
  }

  const sectionList = Array.from(sections.values()).map((entry) => ({
    section: entry.section,
    count: entry.count,
    visitors: Array.from(entry.users.values()).sort((a, b) => b.count - a.count),
  }));

  sectionList.sort((a, b) => b.count - a.count);

  return {
    totalVisits: visits.length,
    uniqueVisitors: ipToUser.size,
    sections: sectionList,
    recent: recent.slice(0, 30),
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const expectedPassword = process.env.VISITS_ADMIN_PASSWORD || "kumail123";
  const password = String(req.query.password || "");

  if (password !== expectedPassword) {
    return res.status(401).json({ ok: false, message: "Invalid password" });
  }

  try {
    const data = await getAllVisits();
    const view = buildView(data.visits || []);

    return res.status(200).json({
      ok: true,
      persisted: data.persisted,
      ...view,
      note: data.persisted
        ? "Data is persisted in KV storage."
        : "Running with memory fallback only. Add KV_REST_API_URL and KV_REST_API_TOKEN for persistence.",
    });
  } catch {
    return res.status(500).json({ ok: false, message: "Failed to load visits" });
  }
}
