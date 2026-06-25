import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";
import { enquiriesPath } from "../config/paths.js";
import { getEnquiryModel } from "./mongooseModels.js";

export async function listEnquiries(limit) {
  if (!env.mongoUri) {
    const enquiries = await readLegacyEnquiries();

    return {
      count: enquiries.length,
      enquiries: enquiries.slice(0, limit)
    };
  }

  const Enquiry = await getEnquiriesModel();
  const [count, enquiries] = await Promise.all([
    Enquiry.countDocuments(),
    Enquiry.find({}).sort({ createdAt: -1 }).limit(limit).lean()
  ]);

  return {
    count,
    enquiries: enquiries.map(withoutMongoId)
  };
}

export async function saveEnquiry(enquiry) {
  if (!env.mongoUri) {
    const enquiries = await readLegacyEnquiries();
    enquiries.unshift(enquiry);
    await writeLegacyEnquiries(enquiries.slice(0, 250));
    return enquiry;
  }

  const Enquiry = await getEnquiriesModel();

  await Enquiry.create(enquiry);
  await trimEnquiries(Enquiry);
  return enquiry;
}

export async function updateEnquiryStatus(id, status) {
  if (!env.mongoUri) {
    const enquiries = await readLegacyEnquiries();
    const enquiryIndex = enquiries.findIndex((enquiry) => enquiry.id === id);

    if (enquiryIndex === -1) {
      return null;
    }

    enquiries[enquiryIndex] = {
      ...enquiries[enquiryIndex],
      status,
      updatedAt: new Date().toISOString()
    };

    await writeLegacyEnquiries(enquiries);
    return enquiries[enquiryIndex];
  }

  const Enquiry = await getEnquiriesModel();
  const updatedAt = new Date().toISOString();
  const result = await Enquiry.findOneAndUpdate(
    { id },
    { $set: { status, updatedAt } },
    { new: true }
  ).lean();

  return result ? withoutMongoId(result) : null;
}

async function getEnquiriesModel() {
  const Enquiry = await getEnquiryModel();

  if ((await Enquiry.estimatedDocumentCount()) === 0) {
    const legacyEnquiries = await readLegacyEnquiries();

    if (legacyEnquiries.length) {
      await Enquiry.insertMany(legacyEnquiries);
    }
  }

  return Enquiry;
}

async function readLegacyEnquiries() {
  try {
    const file = await fs.readFile(enquiriesPath, "utf8");
    return JSON.parse(file);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeLegacyEnquiries(enquiries) {
  await fs.mkdir(path.dirname(enquiriesPath), { recursive: true });
  await fs.writeFile(enquiriesPath, JSON.stringify(enquiries, null, 2));
}

async function trimEnquiries(Enquiry) {
  const excessEnquiries = await Enquiry.find({}, { _id: 1 }).sort({ createdAt: -1 }).skip(250).lean();

  if (excessEnquiries.length) {
    await Enquiry.deleteMany({ _id: { $in: excessEnquiries.map((enquiry) => enquiry._id) } });
  }
}

function withoutMongoId(document) {
  const { _id, ...value } = document;
  return value;
}
