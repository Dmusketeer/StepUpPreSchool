import { CalendarDays, FileText, ImagePlus, Inbox, KeyRound, LayoutDashboard, Sparkles } from "lucide-react";

export const emptyLogin = {
  username: "admin",
  password: ""
};

export const emptyPasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
};

export const emptyUploadForm = { title: "", alt: "", category: "Recent Uploads", files: [] };
export const emptyEventForm = { date: "", title: "", description: "" };
export const emptyNoticeForm = { date: "", title: "", text: "" };
export const enquiryStatuses = ["new", "contacted", "admitted", "closed"];

export const emptyFeeItem = { title: "New Fee", amount: "Contact school", description: "Add details for this fee item." };
export const emptyTeacher = { name: "New Teacher", role: "Teacher", experience: "", image: "", bio: "" };
export const emptyTestimonial = { name: "Parent Name", role: "Parent", rating: 5, quote: "" };
export const emptyFaq = { question: "New question?", answer: "Add the answer here." };

export const adminTabs = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "content", label: "Website Data", Icon: FileText },
  { id: "features", label: "New Features", Icon: Sparkles },
  { id: "media", label: "Gallery", Icon: ImagePlus },
  { id: "updates", label: "Events", Icon: CalendarDays },
  { id: "enquiries", label: "Enquiries", Icon: Inbox },
  { id: "password", label: "Security", Icon: KeyRound }
];