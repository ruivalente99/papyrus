import React from "react";
import {
  Linkedin,
  Github,
  Gitlab,
  Globe,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Instagram,
  Youtube,
  Twitch,
  Code,
  Terminal,
  Cpu,
  Layers,
  FileText,
  Link as LinkIcon,
  MessageSquare,
  Send,
  AtSign,
  Palette,
  Sparkles,
  Camera,
  PenTool,
  Award,
  Star,
  BookOpen,
  Hash,
  ExternalLink,
} from "lucide-react";

export interface IconOption {
  id: string;
  name: string;
  category: "dev" | "contact" | "social" | "design" | "other";
  icon: React.ComponentType<{ size?: number; className?: string }>;
  defaultLabel: string;
}

export const ICON_OPTIONS: IconOption[] = [
  // Dev & Technical
  { id: "linkedin", name: "LinkedIn", category: "dev", icon: Linkedin, defaultLabel: "linkedin.com/in/username" },
  { id: "github", name: "GitHub", category: "dev", icon: Github, defaultLabel: "github.com/username" },
  { id: "gitlab", name: "GitLab", category: "dev", icon: Gitlab, defaultLabel: "gitlab.com/username" },
  { id: "terminal", name: "Terminal / CLI", category: "dev", icon: Terminal, defaultLabel: "cli-portfolio" },
  { id: "code", name: "Source Code", category: "dev", icon: Code, defaultLabel: "code.example.com" },
  { id: "cpu", name: "Tech / Architecture", category: "dev", icon: Cpu, defaultLabel: "tech-blog" },
  { id: "layers", name: "Projects / Stack", category: "dev", icon: Layers, defaultLabel: "projects" },

  // Contact & Web
  { id: "website", name: "Website / Portfolio", category: "contact", icon: Globe, defaultLabel: "portfolio.com" },
  { id: "email", name: "Email", category: "contact", icon: Mail, defaultLabel: "email@example.com" },
  { id: "phone", name: "Phone", category: "contact", icon: Phone, defaultLabel: "(+123) 456 789" },
  { id: "location", name: "Location / City", category: "contact", icon: MapPin, defaultLabel: "City, Country" },
  { id: "at-sign", name: "Handle / Username", category: "contact", icon: AtSign, defaultLabel: "@username" },
  { id: "link", name: "Direct Link", category: "contact", icon: LinkIcon, defaultLabel: "link.com" },
  { id: "file", name: "Document / PDF", category: "contact", icon: FileText, defaultLabel: "publications" },

  // Social & Community
  { id: "twitter", name: "X / Twitter", category: "social", icon: Twitter, defaultLabel: "x.com/username" },
  { id: "instagram", name: "Instagram", category: "social", icon: Instagram, defaultLabel: "instagram.com/username" },
  { id: "youtube", name: "YouTube", category: "social", icon: Youtube, defaultLabel: "youtube.com/@channel" },
  { id: "twitch", name: "Twitch", category: "social", icon: Twitch, defaultLabel: "twitch.tv/username" },
  { id: "telegram", name: "Telegram", category: "social", icon: Send, defaultLabel: "t.me/username" },
  { id: "message", name: "Chat / Messaging", category: "social", icon: MessageSquare, defaultLabel: "chat" },
  { id: "hash", name: "Community / Slack", category: "social", icon: Hash, defaultLabel: "#community" },

  // Creative & Design
  { id: "palette", name: "Design / Palette", category: "design", icon: Palette, defaultLabel: "dribbble.com/portfolio" },
  { id: "pen-tool", name: "Art / Vector", category: "design", icon: PenTool, defaultLabel: "behance.net/username" },
  { id: "camera", name: "Photography", category: "design", icon: Camera, defaultLabel: "photo-portfolio" },
  { id: "sparkles", name: "Highlights / Showcase", category: "design", icon: Sparkles, defaultLabel: "featured-work" },

  // Other & Accolades
  { id: "award", name: "Awards / Honors", category: "other", icon: Award, defaultLabel: "honors" },
  { id: "star", name: "Notable Mention", category: "other", icon: Star, defaultLabel: "starred" },
  { id: "book", name: "Publications / Blog", category: "other", icon: BookOpen, defaultLabel: "medium.com/@author" },
  { id: "other", name: "Custom Link", category: "other", icon: ExternalLink, defaultLabel: "custom-link" },
];

export function getIconComponent(platformId: string = "other"): React.ComponentType<{ size?: number; className?: string }> {
  const found = ICON_OPTIONS.find((o) => o.id === platformId);
  if (found) return found.icon;

  // Fallbacks for standard keys
  switch (platformId.toLowerCase()) {
    case "linkedin":
      return Linkedin;
    case "github":
      return Github;
    case "gitlab":
      return Gitlab;
    case "website":
    case "portfolio":
    case "globe":
      return Globe;
    case "email":
    case "mail":
      return Mail;
    case "phone":
    case "tel":
      return Phone;
    case "location":
    case "map":
      return MapPin;
    case "twitter":
    case "x":
      return Twitter;
    case "instagram":
      return Instagram;
    case "youtube":
      return Youtube;
    case "twitch":
      return Twitch;
    case "telegram":
      return Send;
    case "file":
    case "pdf":
      return FileText;
    case "code":
      return Code;
    case "terminal":
      return Terminal;
    case "award":
      return Award;
    case "star":
      return Star;
    case "book":
    case "blog":
      return BookOpen;
    default:
      return ExternalLink;
  }
}

export function renderPlatformIcon(platformId: string, size: number = 11, className?: string): React.ReactElement {
  const IconComponent = getIconComponent(platformId);
  return <IconComponent size={size} className={className} />;
}
