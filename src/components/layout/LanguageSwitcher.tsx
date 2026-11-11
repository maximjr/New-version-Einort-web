import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Globe } from "lucide-react";
import { cn } from "../../lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

const languages = [
  { code: "en", name: "EN" },
  { code: "fr", name: "FR" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
    
    const pathname = location.pathname;
    let newPath = pathname;

    const parts = pathname.split('/');
    if (parts[1] === 'en' || parts[1] === 'fr') {
      parts[1] = lng;
      newPath = parts.join('/');
    } else {
      newPath = `/${lng}${pathname === '/' ? '' : pathname}`;
    }
    
    if (newPath !== pathname) {
      navigate(newPath + location.search + location.hash, { replace: true });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-[13px] font-medium tracking-[0.1em] uppercase text-text-muted hover:text-white transition-colors"
        aria-label="Select Language"
      >
        <Globe size={16} />
        {i18n.resolvedLanguage?.toUpperCase() || "EN"}
        <ChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-24 bg-surface/90 backdrop-blur-lg border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={cn(
                "w-full text-left px-4 py-2 text-[12px] font-medium tracking-[0.1em] uppercase transition-colors hover:bg-white/5",
                i18n.resolvedLanguage === lang.code ? "text-primary bg-primary/10" : "text-text-muted hover:text-white"
              )}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
