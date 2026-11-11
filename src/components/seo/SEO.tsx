import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SEO_CONFIG, SITE_URL } from "../../constants/seo";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { SOCIAL_LINKS } from "../../config/socialLinks";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  schema?: string;
  lang?: string;
}

export function SEO({
  title,
  description,
  canonical,
  image,
  schema,
  lang = "en",
}: SEOProps = {}) {
  const location = useLocation();
  const { t, i18n } = useTranslation("seo");

  const normalizedPath = useMemo(() => {
    return location.pathname.replace(/^\/(en|fr)/, "") || "/";
  }, [location.pathname]);

  const routeConfig = useMemo(() => {
    switch (normalizedPath) {
      case "/":
        return {
          title: t("home.title"),
          description: t("home.description"),
        };
      case "/admin":
        return {
          title: t("admin.title"),
          description: t("admin.description"),
        };
      case "/client-portal":
        return {
          title: t("client_portal.title"),
          description: t("client_portal.description"),
        };
      case "/about":
        return {
          title: t("about.title"),
          description: t("about.description"),
        };
      case "/contact":
        return {
          title: t("contact.title"),
          description: t("contact.description"),
        };
      case "/services":
        return {
          title: t("services_index.title"),
          description: t("services_index.description"),
        };
      case "/work":
        return {
          title: "Our Work & Case Studies | EINORT Solutions",
          description: "Explore EINORT Solutions' portfolio of successful digital transformations, custom software, and ERP implementations for businesses in Cameroon and Africa.",
        };
      case "/insights":
        return {
          title: t("insights.title"),
          description: t("insights.description"),
        };
      default:
        if (normalizedPath.startsWith("/locations/")) {
          const region = normalizedPath
            .replace("/locations/", "")
            .replace(/-/g, " ");
          const formattedRegion =
            region.charAt(0).toUpperCase() + region.slice(1);
          return {
            title: t("location.title_template", { region: formattedRegion }),
            description: t("location.description_template", { region: formattedRegion }),
          };
        }
        if (normalizedPath.startsWith("/services/")) {
          const serviceId = normalizedPath.replace("/services/", "");
          
          const titleKey = `services.specific.${serviceId}.title`;
          const descKey = `services.specific.${serviceId}.description`;
          
          const specificTitle = t(titleKey);
          const specificDesc = t(descKey);

          if (specificTitle !== titleKey && specificDesc !== descKey) {
            return {
              title: specificTitle,
              description: specificDesc
            };
          }

          const serviceName = serviceId
            .replace(/-/g, " ");
          const formattedService =
            serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
          return {
            title: t("services.title_template", { service: formattedService }),
            description: t("services.description_template", { service: formattedService }),
          };
        }
        if (normalizedPath.startsWith("/industries/")) {
          const industryName = normalizedPath
            .replace("/industries/", "")
            .replace(/-/g, " ");
          const formattedIndustry =
            industryName.charAt(0).toUpperCase() + industryName.slice(1);
          return {
            title: t("industry.title_template", { industry: formattedIndustry }),
            description: t("industry.description_template", { industry: formattedIndustry }),
          };
        }
        return {
          title: t("default.title"),
          description: t("default.description"),
        };
    }
  }, [normalizedPath, t]);

  const currentLang = i18n.resolvedLanguage || lang;
  
  const rawBasePath = location.pathname.replace(/^\/(en|fr)/, '');
  const basePath = rawBasePath === '/' ? '' : rawBasePath;
  const urlEn = `${SITE_URL}/en${basePath}`;
  const urlFr = `${SITE_URL}/fr${basePath}`;
  
  const url = canonical || (currentLang === 'fr' ? urlFr : urlEn);
  
  const metaTitle = title || routeConfig.title;
  const metaDescription = description || routeConfig.description;
  const metaImage = image || `${SITE_URL}/og-image.png`;
  const googleVerification = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION || "";

  const breadcrumbs = useMemo(() => {
    const paths = location.pathname.split("/").filter(Boolean);
    const itemListElement = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${SITE_URL}/`,
      },
    ];

    let currentPath = "";
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const name = path
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

      itemListElement.push({
        "@type": "ListItem",
        "position": index + 2,
        "name": name,
        "item": `${SITE_URL}${currentPath}`,
      });
    });

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: itemListElement,
    };
  }, [location.pathname]);

  const defaultSchemaArray = useMemo(() => [
    {
      ...SEO_CONFIG.organizationSchema,
      sameAs: SOCIAL_LINKS.map(link => link.url)
    },
    {
      ...SEO_CONFIG.localBusinessSchema,
      sameAs: SOCIAL_LINKS.map(link => link.url)
    },
    SEO_CONFIG.websiteSchema,
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: metaTitle,
      description: metaDescription,
      url: url,
    },
    breadcrumbs,
  ], [metaTitle, metaDescription, url, breadcrumbs]);

  const finalSchema = useMemo(() => {
    if (schema) {
      try {
        const parsedSchema = JSON.parse(schema);
        if (Array.isArray(parsedSchema)) {
          return JSON.stringify([...defaultSchemaArray, ...parsedSchema]);
        }
        return JSON.stringify([...defaultSchemaArray, parsedSchema]);
      } catch (e) {
        return JSON.stringify(defaultSchemaArray);
      }
    }
    return JSON.stringify(defaultSchemaArray);
  }, [schema, defaultSchemaArray]);

  return (
    <Helmet>
      <html lang={currentLang} />
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={SEO_CONFIG.keywords} />
      
      {/* Explicit Indexing Robots Directives */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      
      {/* Google Search Console Verification */}
      {googleVerification && (
        <meta name="google-site-verification" content={googleVerification} />
      )}
      
      {/* Open Graph */}
      <meta property="og:type" content={SEO_CONFIG.openGraph.type} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SEO_CONFIG.openGraph.siteName} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:secure_url" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={metaTitle} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:locale" content={currentLang === "fr" ? "fr_FR" : "en_US"} />
      <meta property="og:locale:alternate" content={currentLang === "fr" ? "en_US" : "fr_FR"} />

      {/* Twitter */}
      <meta name="twitter:card" content={SEO_CONFIG.twitter.cardType} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:image:alt" content={metaTitle} />

      {/* Canonical and Multilingual SEO */}
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="x-default" href={urlEn} />
      <link rel="alternate" hrefLang="en" href={urlEn} />
      <link rel="alternate" hrefLang="fr" href={urlFr} />

      {/* JSON-LD Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: finalSchema }} />
    </Helmet>
  );
}
