import { clearAllVisits } from "./_visitStore.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const expectedPassword = process.env.VISITS_ADMIN_PASSWORD || "kumail123";
  const password = String(req.body?.password || "");

  if (password !== expectedPassword) {
    return res.status(401).json({ ok: false, message: "Invalid password" });
  }

  try {
    const result = await clearAllVisits();
    return res.status(200).json({ ok: true, persisted: result.persisted, cleared: true });
  } catch {
    return res.status(500).json({ ok: false, message: "Failed to clear visit data" });
  }
}
