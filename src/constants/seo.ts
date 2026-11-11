export const SITE_URL = import.meta.env.VITE_SITE_URL || "https://einortsolutions.com";

export const SEO_CONFIG = {
  title:
    "Einort Solutions | Elite Custom Software & Enterprise Web Architecture",
  description:
    "Einort Solutions is a premier enterprise software engineering agency based in Douala, Cameroon. We specialize in custom web development, ERP systems, AI automation, and premium UI/UX design across Cameroon, Africa, and globally.",
  keywords: [
    "technology company Cameroon",
    "software development company Douala",
    "digital transformation company Cameroon",
    "web development company Cameroon",
    "mobile app development Cameroon",
    "UI UX design Douala",
    "ERP solutions Cameroon",
    "AI automation Cameroon",
    "entreprise technologique Cameroun",
    "développement logiciel Cameroun",
    "agence web Douala",
    "transformation digitale Cameroun"
  ].join(", "),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${SITE_URL}/`,
    siteName: "Einort Solutions",
    title: "Einort Solutions | Custom Web Apps & Enterprise Architecture Cameroon",
    description:
      "World-class software development, premium UI/UX design, and scalable cloud infrastructure for modern businesses in Cameroon and globally. Top web agency in Douala.",
  },
  twitter: {
    cardType: "summary_large_image",
    title: "Einort Solutions | Enterprise Software Agency Cameroon",
    description:
      "Premium enterprise software engineering and architecture for businesses in Cameroon and beyond.",
  },
  organizationSchema: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Einort Solutions",
    legalName: "Einort Solutions LLC",
    url: `${SITE_URL}`,
    logo: `${SITE_URL}/icon.png`,
    description: "Premier software engineering agency and enterprise web architecture firm based in Douala, Cameroon. Specializing in custom CRM & ERP solutions, full-stack web development, and AI automation.",
    foundingDate: "2022",
    sameAs: [
      "https://www.facebook.com/share/1E288sJ791/",
      "https://www.instagram.com/einortsolutions?igsh=am0wczAxZTN1em80",
      "https://www.tiktok.com/@einortsolutions.com?_r=1&_t=ZS-98H5nVwcYPg",
      "https://www.linkedin.com/in/einort-solutions-5607a7336?utm_source=share_via&utm_content=profile&utm_medium=member_android"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+237686661578",
      contactType: "customer service",
      email: "contact@einortsolutions.com",
      areaServed: ["CM", "US", "CA", "GB", "DE", "FR"],
      availableLanguage: ["en", "fr"]
    },
    areaServed: [
      "CM", "US", "CA", "GB", "DE", "FR"
    ],
    knowsAbout: [
      "Enterprise Software Architecture",
      "React Development",
      "ERP Development",
      "AI Automation",
      "Web Design",
      "UI/UX",
      "Digital Transformation",
      "Cloud Infrastructure",
      "Semantic SEO",
      "Cybersecurity"
    ],
  },
  localBusinessSchema: {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService", "SoftwareApplication", "TechArticle"],
    name: "Einort Solutions",
    image: `${SITE_URL}/icon.png`,
    "@id": `${SITE_URL}`,
    url: `${SITE_URL}`,
    telephone: "+237686661578",
    email: "contact@einortsolutions.com",
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Douala",
      addressLocality: "Douala",
      addressRegion: "Littoral Region",
      postalCode: "BP 0000",
      addressCountry: "CM"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 4.0511,
      longitude: 9.7085
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
      ],
      opens: "08:00",
      closes: "18:00"
    },
    areaServed: {
      "@type": "Country",
      name: "Cameroon"
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Enterprise Software Engineering Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "ProfessionalService",
            name: "Custom Software Development",
            description: "End-to-end bespoke software engineering."
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "ProfessionalService",
            name: "Enterprise Web Architecture",
            description: "Scalable web applications and platform architecture."
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "ProfessionalService",
            name: "ERP & CRM Systems Development",
            description: "Custom enterprise resource planning systems."
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "ProfessionalService",
            name: "AI Automation Solutions",
            description: "Artificial Intelligence integrations and workflow automation."
          }
        }
      ]
    }
  },
  websiteSchema: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Einort Solutions",
    url: `${SITE_URL}/`,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  },
};
