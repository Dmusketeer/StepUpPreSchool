import { connectToDatabase, createModel, mongoose } from "../config/database.js";

const { Schema } = mongoose;

const siteContentSchema = new Schema(
  {
    _id: String,
    data: Schema.Types.Mixed,
    updatedAt: String
  },
  { collection: "siteContent", versionKey: false }
);

const enquirySchema = new Schema(
  {
    id: { type: String, index: true, unique: true },
    guardianName: String,
    phone: String,
    email: String,
    childName: String,
    childAge: String,
    interest: String,
    message: String,
    status: { type: String, default: "new" },
    createdAt: { type: String, index: true },
    updatedAt: String
  },
  { collection: "enquiries", strict: false, versionKey: false }
);

const visitorStatsSchema = new Schema(
  {
    _id: String,
    data: Schema.Types.Mixed,
    updatedAt: String
  },
  { collection: "visitorStats", versionKey: false }
);

const adminCredentialSchema = new Schema(
  {
    _id: String,
    username: String,
    password: Schema.Types.Mixed,
    updatedAt: String
  },
  { collection: "adminCredentials", versionKey: false }
);

const SiteContent = createModel("SiteContent", siteContentSchema, "siteContent");
const Enquiry = createModel("Enquiry", enquirySchema, "enquiries");
const VisitorStats = createModel("VisitorStats", visitorStatsSchema, "visitorStats");
const AdminCredential = createModel("AdminCredential", adminCredentialSchema, "adminCredentials");

export async function getSiteContentModel() {
  await connectToDatabase();
  return SiteContent;
}

export async function getEnquiryModel() {
  await connectToDatabase();
  return Enquiry;
}

export async function getVisitorStatsModel() {
  await connectToDatabase();
  return VisitorStats;
}

export async function getAdminCredentialModel() {
  await connectToDatabase();
  return AdminCredential;
}