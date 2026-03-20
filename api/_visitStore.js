import { del, list, put } from "@vercel/blob";

const MAX_VISITS = 1000;
const STORE_KEY = "__KR_VISIT_STORE__";
const ALL_KEY = "kr:visits:all";
const BLOB_PREFIX = "visits/";

function hasRedis() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function hasBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function getMemoryStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = { all: [] };
  }
  return globalThis[STORE_KEY];
}

async function redisPipeline(commands) {
  const response = await fetch(`${process.env.KV_REST_API_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`KV request failed: ${message}`);
  }

  return response.json();
}

function normalizeSection(section) {
  return String(section || "Home")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "home";
}

export async function addVisit(visit) {
  const record = {
    section: String(visit.section || "Home"),
    sectionKey: normalizeSection(visit.section),
    ip: String(visit.ip || "unknown"),
    ua: String(visit.ua || "unknown"),
    timestamp: new Date().toISOString(),
  };

  if (hasRedis()) {
    await redisPipeline([
      ["LPUSH", ALL_KEY, JSON.stringify(record)],
      ["LTRIM", ALL_KEY, "0", String(MAX_VISITS - 1)],
      ["LPUSH", `kr:visits:section:${record.sectionKey}`, JSON.stringify(record)],
      ["LTRIM", `kr:visits:section:${record.sectionKey}`, "0", String(MAX_VISITS - 1)],
    ]);
    return { persisted: true, record };
  }

  if (hasBlob()) {
    const random = Math.random().toString(36).slice(2, 10);
    const pathname = `${BLOB_PREFIX}${record.timestamp}-${random}.json`;
    await put(pathname, JSON.stringify(record), {
      access: "public",
      addRandomSuffix: false,
    });
    return { persisted: true, record };
  }

  const store = getMemoryStore();
  store.all.unshift(record);
  if (store.all.length > MAX_VISITS) store.all.length = MAX_VISITS;
  return { persisted: false, record };
}

export async function getAllVisits() {
  if (hasRedis()) {
    const payload = await redisPipeline([["LRANGE", ALL_KEY, "0", String(MAX_VISITS - 1)]]);
    const values = Array.isArray(payload?.[0]?.result) ? payload[0].result : [];
    return {
      persisted: true,
      visits: values.map((item) => {
        try {
          return JSON.parse(item);
        } catch {
          return null;
        }
      }).filter(Boolean),
    };
  }

  if (hasBlob()) {
    const blobs = await list({ prefix: BLOB_PREFIX, limit: MAX_VISITS });
    const visits = [];

    for (const blob of blobs.blobs || []) {
      try {
        const response = await fetch(blob.url);
        if (!response.ok) continue;
        const record = await response.json();
        visits.push(record);
      } catch {
        // Ignore malformed/unavailable blob records.
      }
    }

    visits.sort((a, b) => {
      const ta = new Date(a?.timestamp || 0).getTime();
      const tb = new Date(b?.timestamp || 0).getTime();
      return tb - ta;
    });

    return {
      persisted: true,
      visits: visits.slice(0, MAX_VISITS),
    };
  }

  const store = getMemoryStore();
  return { persisted: false, visits: [...store.all] };
}

export async function clearAllVisits() {
  if (hasRedis()) {
    const payload = await redisPipeline([["LRANGE", ALL_KEY, "0", String(MAX_VISITS - 1)]]);
    const values = Array.isArray(payload?.[0]?.result) ? payload[0].result : [];

    const keys = new Set([ALL_KEY]);
    values.forEach((item) => {
      try {
        const parsed = JSON.parse(item);
        const sectionKey = normalizeSection(parsed?.section || "Home");
        keys.add(`kr:visits:section:${sectionKey}`);
      } catch {
        // Ignore malformed records.
      }
    });

    await redisPipeline(Array.from(keys).map((key) => ["DEL", key]));
    return { persisted: true, cleared: true };
  }

  if (hasBlob()) {
    const blobs = await list({ prefix: BLOB_PREFIX, limit: MAX_VISITS });
    const urls = (blobs.blobs || []).map((blob) => blob.url);
    if (urls.length) {
      await del(urls);
    }
    return { persisted: true, cleared: true };
  }

  const store = getMemoryStore();
  store.all = [];
  return { persisted: false, cleared: true };
}
