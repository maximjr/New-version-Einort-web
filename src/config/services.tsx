import { Code2, LayoutTemplate, Database, Smartphone, PenTool, Share2, Target, Search } from "lucide-react";
import React from "react";

export interface ServiceConfig {
  id: string;
  icon: React.ReactNode;
}

export const servicesRegistry: ServiceConfig[] = [
  {
    id: "websites-web-apps",
    icon: <Code2 className="w-12 h-12 text-primary" />,
  },
  {
    id: "ui-ux-design",
    icon: <LayoutTemplate className="w-12 h-12 text-primary" />,
  },
  {
    id: "erp-solutions",
    icon: <Database className="w-12 h-12 text-primary" />,
  },
  {
    id: "mobile-app-development",
    icon: <Smartphone className="w-12 h-12 text-primary" />,
  },
  {
    id: "branding-graphic-design",
    icon: <PenTool className="w-12 h-12 text-primary" />,
  },
  {
    id: "social-media-management",
    icon: <Share2 className="w-12 h-12 text-primary" />,
  },
  {
    id: "digital-advertising",
    icon: <Target className="w-12 h-12 text-primary" />,
  },
  {
    id: "seo-google-workspace",
    icon: <Search className="w-12 h-12 text-primary" />,
  },
];

export const getServiceById = (id: string) => {
  return servicesRegistry.find((s) => s.id === id);
};
