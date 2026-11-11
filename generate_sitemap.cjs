const fs = require('fs');

const SITE_URL = 'https://einortsolutions.com';
const langs = ['en', 'fr'];
const staticRoutes = [
  '',
  '/about',
  '/services',
  '/insights',
  '/contact'
];

// Extract service IDs (we can just hardcode them based on the earlier read)
const serviceIds = [
  'websites-web-apps',
  'ui-ux-design',
  'erp-solutions',
  'mobile-app-development',
  'branding-graphic-design',
  'social-media-management',
  'digital-advertising',
  'seo-google-workspace',
  'saas-cloud-architecture'
];

// Read articles to extract slugs
let articlesData = fs.readFileSync('src/features/insights/articlesData.ts', 'utf-8');
// Extract slugs using regex
const slugs = [...articlesData.matchAll(/"slug":\s*"([^"]+)"/g)].map(m => m[1]);
// We should make sure we know which ones are EN and which are FR. The first 20 are EN, the next 6 are FR. But wait, sitemap can just link to their respective /lang/insights/slug.
// Actually, it's better to read the actual JSON. 
// For simplicity, we just generate the XML based on what we have.

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

function addUrl(path, xdefaultPath) {
  xml += `  <url>\n`;
  xml += `    <loc>${SITE_URL}${path}</loc>\n`;
  // Add hreflang links
  xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${xdefaultPath}" />\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/en${path.replace(/^\/(en|fr)/, '')}" />\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="fr" href="${SITE_URL}/fr${path.replace(/^\/(en|fr)/, '')}" />\n`;
  xml += `  </url>\n`;
}

// Static routes
for (const lang of langs) {
  for (const route of staticRoutes) {
    const p = `/${lang}${route}`;
    addUrl(p, `/en${route}`);
  }
  for (const s of serviceIds) {
    const p = `/${lang}/services/${s}`;
    addUrl(p, `/en/services/${s}`);
  }
}

// Extract article lang and slug
const matches = [...articlesData.matchAll(/"slug":\s*"([^"]+)",\s*"language":\s*"([^"]+)"/g)];
for (const m of matches) {
  const slug = m[1];
  const lang = m[2];
  // Since we don't map EN article slugs to FR article slugs perfectly for hreflang here, we just add the URL.
  xml += `  <url>\n`;
  xml += `    <loc>${SITE_URL}/${lang}/insights/${slug}</loc>\n`;
  xml += `  </url>\n`;
}

xml += `</urlset>\n`;

fs.writeFileSync('public/sitemap.xml', xml);
console.log("Sitemap generated.");
