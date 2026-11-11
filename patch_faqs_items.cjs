const fs = require('fs');

const enFile = 'public/locales/en/services.json';
const frFile = 'public/locales/fr/services.json';

const enData = JSON.parse(fs.readFileSync(enFile, 'utf-8'));
const frData = JSON.parse(fs.readFileSync(frFile, 'utf-8'));

const enWebFaqs = [
  {
    "q": "What does a software development company in Cameroon do?",
    "a": "A software development company like EINORT Solutions builds custom digital tools—ranging from business websites to complex web applications and internal management systems—that help organizations in Cameroon digitize their processes, reach more customers, and operate efficiently."
  },
  {
    "q": "How much does website development cost in Cameroon?",
    "a": "The cost of website development in Cameroon varies based on complexity. A simple informational business website is more affordable, whereas a full-scale web application with custom integrations or e-commerce capabilities requires a larger investment. We provide tailored quotes after a thorough technical discovery phase."
  },
  {
    "q": "How long does it take to build a business website?",
    "a": "Depending on complexity, a professional business website typically takes 4 to 8 weeks to build, while an enterprise web application may take between 8 to 16 weeks from discovery to deployment."
  }
];

const frWebFaqs = [
  {
    "q": "Que fait une entreprise de développement logiciel au Cameroun ?",
    "a": "Une entreprise de développement logiciel comme EINORT Solutions crée des outils numériques sur mesure (sites web, applications web complexes, systèmes de gestion) qui aident les organisations au Cameroun à numériser leurs processus, toucher plus de clients et fonctionner efficacement."
  },
  {
    "q": "Combien coûte la création d'un site web au Cameroun ?",
    "a": "Le coût de la création d'un site web au Cameroun varie selon la complexité. Un site vitrine simple est plus abordable, tandis qu'une application web complète avec intégrations sur mesure ou e-commerce nécessite un investissement plus important. Nous fournissons des devis personnalisés après une phase de découverte."
  },
  {
    "q": "Combien de temps faut-il pour créer un site web professionnel ?",
    "a": "Selon la complexité, un site web professionnel prend généralement 4 à 8 semaines, tandis qu'une application web d'entreprise peut prendre de 8 à 16 semaines de la découverte au déploiement."
  }
];

const enErpFaqs = [
  {
    "q": "What is an ERP?",
    "a": "An ERP (Enterprise Resource Planning) system is a comprehensive software platform that centralizes a company's core operations, such as inventory management, sales, human resources, and accounting, into a single integrated database."
  },
  {
    "q": "What businesses need ERP software?",
    "a": "Businesses that struggle with disjointed data, rely heavily on multiple spreadsheets, or experience operational inefficiencies as they scale (especially in retail, logistics, manufacturing, and distribution) benefit immensely from ERP software."
  },
  {
    "q": "Can EINORT build custom ERP software?",
    "a": "Yes. EINORT Solutions specializes in architecting custom ERP systems tailored to the exact workflows and regulatory requirements of businesses operating in Cameroon and across Africa."
  }
];

const frErpFaqs = [
  {
    "q": "Qu'est-ce qu'un ERP ?",
    "a": "Un système ERP (Enterprise Resource Planning) est une plateforme logicielle complète qui centralise les opérations de base d'une entreprise (gestion des stocks, ventes, ressources humaines, comptabilité) dans une seule base de données."
  },
  {
    "q": "Quelles entreprises ont besoin d'un logiciel ERP ?",
    "a": "Les entreprises qui ont du mal avec des données dispersées, qui dépendent de multiples fichiers Excel, ou qui rencontrent des inefficacités opérationnelles en grandissant (notamment dans la logistique, la distribution ou la vente) bénéficient énormément d'un ERP."
  },
  {
    "q": "EINORT peut-il développer un logiciel ERP sur mesure ?",
    "a": "Oui. EINORT Solutions est spécialisé dans la conception de systèmes ERP sur mesure, adaptés aux flux de travail exacts et aux exigences réglementaires des entreprises opérant au Cameroun et en Afrique."
  }
];

const enMobileFaqs = [
  {
    "q": "Can EINORT develop mobile applications?",
    "a": "Yes, EINORT Solutions designs and develops high-performance mobile applications for both iOS and Android, focusing on seamless user experiences and robust functionality, even in low-connectivity areas."
  },
  {
    "q": "Does EINORT work with businesses outside Cameroon?",
    "a": "Absolutely. While we have deep expertise in the Cameroonian and African markets, we partner with clients globally to deliver world-class digital solutions."
  }
];

const frMobileFaqs = [
  {
    "q": "EINORT peut-il développer des applications mobiles ?",
    "a": "Oui, EINORT Solutions conçoit et développe des applications mobiles performantes pour iOS et Android, en se concentrant sur des expériences utilisateur fluides et des fonctionnalités robustes, même dans les zones à faible connectivité."
  },
  {
    "q": "EINORT travaille-t-il avec des entreprises en dehors du Cameroun ?",
    "a": "Absolument. Bien que nous ayons une expertise pointue sur les marchés camerounais et africains, nous collaborons avec des clients du monde entier pour fournir des solutions numériques de classe mondiale."
  }
];

const enUiFaqs = [
  {
    "q": "What is UI/UX design?",
    "a": "UI (User Interface) design focuses on the visual and interactive elements of a digital product, while UX (User Experience) design encompasses the entire user journey, ensuring the product is intuitive, accessible, and solves user problems efficiently."
  }
];

const frUiFaqs = [
  {
    "q": "Qu'est-ce que le design UI/UX ?",
    "a": "Le design UI (Interface Utilisateur) se concentre sur les éléments visuels et interactifs d'un produit numérique, tandis que le design UX (Expérience Utilisateur) englobe tout le parcours de l'utilisateur, garantissant que le produit est intuitif, accessible et résout efficacement ses problèmes."
  }
];

const enSeoFaqs = [
  {
    "q": "Why is SEO important for a business?",
    "a": "SEO (Search Engine Optimization) is critical because it helps your business appear at the top of Google search results when potential clients are actively looking for your services. This drives high-intent, organic traffic that converts into sales."
  },
  {
    "q": "What is Google Workspace?",
    "a": "Google Workspace is a suite of cloud-based productivity and collaboration tools (including professional Gmail, Drive, Docs, and Meet) that enables teams to work securely from anywhere using a custom company domain."
  }
];

const frSeoFaqs = [
  {
    "q": "Pourquoi le SEO est-il important pour une entreprise ?",
    "a": "Le SEO (référencement naturel) est essentiel car il permet à votre entreprise d'apparaître en haut des résultats Google lorsque des clients potentiels recherchent activement vos services. Cela génère un trafic qualifié et organique qui se convertit en ventes."
  },
  {
    "q": "Qu'est-ce que Google Workspace ?",
    "a": "Google Workspace est une suite d'outils de productivité et de collaboration basés sur le cloud (incluant Gmail professionnel, Drive, Docs et Meet) qui permet aux équipes de travailler de manière sécurisée de n'importe où en utilisant un nom de domaine personnalisé."
  }
];

const enAdsFaqs = [
  {
    "q": "Can EINORT help manage social media advertising?",
    "a": "Yes, we create and manage targeted advertising campaigns on platforms like Facebook, Instagram, and LinkedIn. We optimize ad spend to ensure your message reaches the exact demographic most likely to engage with your business."
  }
];

const frAdsFaqs = [
  {
    "q": "EINORT peut-il gérer la publicité sur les réseaux sociaux ?",
    "a": "Oui, nous créons et gérons des campagnes publicitaires ciblées sur des plateformes comme Facebook, Instagram et LinkedIn. Nous optimisons le budget publicitaire pour nous assurer que votre message atteint le public le plus susceptible de s'engager avec votre entreprise."
  }
];

// Append FAQs to items. Keep existing if they exist.
if (enData.items['websites-web-apps']) {
  enData.items['websites-web-apps'].faqs = [...enWebFaqs, ...(enData.items['websites-web-apps'].faqs || [])];
  frData.items['websites-web-apps'].faqs = [...frWebFaqs, ...(frData.items['websites-web-apps'].faqs || [])];
}

if (enData.items['erp-solutions']) {
  enData.items['erp-solutions'].faqs = [...enErpFaqs, ...(enData.items['erp-solutions'].faqs || [])];
  frData.items['erp-solutions'].faqs = [...frErpFaqs, ...(frData.items['erp-solutions'].faqs || [])];
}

if (enData.items['mobile-app-development']) {
  enData.items['mobile-app-development'].faqs = [...enMobileFaqs, ...(enData.items['mobile-app-development'].faqs || [])];
  frData.items['mobile-app-development'].faqs = [...frMobileFaqs, ...(frData.items['mobile-app-development'].faqs || [])];
}

if (enData.items['ui-ux-design']) {
  enData.items['ui-ux-design'].faqs = [...enUiFaqs, ...(enData.items['ui-ux-design'].faqs || [])];
  frData.items['ui-ux-design'].faqs = [...frUiFaqs, ...(frData.items['ui-ux-design'].faqs || [])];
}

if (enData.items['seo-google-workspace']) {
  enData.items['seo-google-workspace'].faqs = [...enSeoFaqs, ...(enData.items['seo-google-workspace'].faqs || [])];
  frData.items['seo-google-workspace'].faqs = [...frSeoFaqs, ...(frData.items['seo-google-workspace'].faqs || [])];
}

if (enData.items['digital-advertising']) {
  enData.items['digital-advertising'].faqs = [...enAdsFaqs, ...(enData.items['digital-advertising'].faqs || [])];
  frData.items['digital-advertising'].faqs = [...frAdsFaqs, ...(frData.items['digital-advertising'].faqs || [])];
}

fs.writeFileSync(enFile, JSON.stringify(enData, null, 2));
fs.writeFileSync(frFile, JSON.stringify(frData, null, 2));

console.log("FAQs updated successfully.");
