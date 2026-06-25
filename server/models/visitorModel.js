import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";
import { visitorStatsPath } from "../config/paths.js";
import { getVisitorStatsModel } from "./mongooseModels.js";

const visitorStatsDocumentId = "main";

export async function getVisitorStats() {
  return readVisitorStats();
}

export async function recordVisit() {
  const stats = await readVisitorStats();
  const today = getTodayKey();
  const nextStats = {
    ...stats,
    totalVisitors: stats.totalVisitors + 1,
    today,
    todayVisitors: stats.today === today ? stats.todayVisitors + 1 : 1,
    lastVisitAt: new Date().toISOString()
  };

  await writeVisitorStats(nextStats);
  return nextStats;
}

async function readVisitorStats() {
  if (!env.mongoUri) {
    const legacyStats = normalizeVisitorStats(await readLegacyVisitorStats());
    await writeLegacyVisitorStats(legacyStats);
    return legacyStats;
  }

  const VisitorStats = await getVisitorStatsModel();
  const statsDocument = await VisitorStats.findById(visitorStatsDocumentId).lean();

  if (statsDocument?.data) {
    return normalizeVisitorStats(statsDocument.data);
  }

  const emptyStats = normalizeVisitorStats(await readLegacyVisitorStats());
  await writeVisitorStats(emptyStats);
  return emptyStats;
}

async function writeVisitorStats(stats) {
  if (!env.mongoUri) {
    await writeLegacyVisitorStats(normalizeVisitorStats(stats));
    return;
  }

  const VisitorStats = await getVisitorStatsModel();

  await VisitorStats.updateOne(
    { _id: visitorStatsDocumentId },
    { $set: { data: normalizeVisitorStats(stats), updatedAt: new Date().toISOString() } },
    { upsert: true }
  );
}

async function readLegacyVisitorStats() {
  try {
    const file = await fs.readFile(visitorStatsPath, "utf8");
    return JSON.parse(file);
  } catch (error) {
    if (error.code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

async function writeLegacyVisitorStats(stats) {
  await fs.mkdir(path.dirname(visitorStatsPath), { recursive: true });
  await fs.writeFile(visitorStatsPath, JSON.stringify(stats, null, 2));
}

function normalizeVisitorStats(value) {
  const today = getTodayKey();
  const totalVisitors = Number.isFinite(value.totalVisitors) ? value.totalVisitors : 0;
  const isToday = value.today === today;

  return {
    totalVisitors,
    today,
    todayVisitors: isToday && Number.isFinite(value.todayVisitors) ? value.todayVisitors : 0,
    lastVisitAt: typeof value.lastVisitAt === "string" ? value.lastVisitAt : null
  };
}

function getTodayKey() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}