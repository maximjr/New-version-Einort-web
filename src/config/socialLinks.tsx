import { Facebook, Instagram, Linkedin } from "lucide-react";

export const SOCIAL_LINKS = [
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/einort-solutions-5607a7336?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    icon: <Linkedin size={20} />,
    ariaLabel: "Follow EINORT Solutions on LinkedIn",
    hoverColor: "hover:text-[#0a66c2]"
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/share/1E288sJ791/",
    icon: <Facebook size={20} />,
    ariaLabel: "Follow EINORT Solutions on Facebook",
    hoverColor: "hover:text-[#1877f2]"
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/einortsolutions?igsh=am0wczAxZTN1em80",
    icon: <Instagram size={20} />,
    ariaLabel: "Follow EINORT Solutions on Instagram",
    hoverColor: "hover:text-[#e1306c]"
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@einortsolutions.com?_r=1&_t=ZS-98H5nVwcYPg",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-tiktok"
      >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ),
    ariaLabel: "Follow EINORT Solutions on TikTok",
    hoverColor: "hover:text-[#000000] dark:hover:text-[#ffffff]"
  }
];
