import {
  Baby,
  BookOpenCheck,
  Clock,
  HeartHandshake,
  MapPin,
  Palette,
  ShieldCheck,
  SmilePlus,
  Sparkles,
  Sprout,
  Star,
  Video
} from "lucide-react";

export const navItems = [
  { label: "About", href: "#about" },
  { label: "Programs", href: "#programs" },
  { label: "Fees", href: "#fees" },
  { label: "Admissions", href: "#admissions" },
  { label: "Gallery", href: "#gallery" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
  { label: "Login", href: "/portal" }
];

export const iconMap = {
  baby: Baby,
  palette: Palette,
  book: BookOpenCheck,
  sprout: Sprout,
  smile: SmilePlus,
  shield: ShieldCheck,
  heart: HeartHandshake,
  star: Star,
  sparkles: Sparkles,
  clock: Clock
};

export const socialPlatforms = [
  { key: "googleBusiness", label: "Google Business", Icon: MapPin },
  { key: "facebook", label: "Facebook", Icon: HeartHandshake },
  { key: "instagram", label: "Instagram", Icon: Palette },
  { key: "youtube", label: "YouTube", Icon: Video }
];

export const allGalleryCategory = "All";