import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.VITE_SITE_URL || 'https://einortsolutions.com';
const TODAY = new Date().toISOString().split('T')[0];

// 1. Static and Hub Pages
const staticHubPages = [
  { path: '', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.9' },
  { path: '/services', changefreq: 'weekly', priority: '0.9' },
  { path: '/work', changefreq: 'monthly', priority: '0.8' },
  { path: '/insights', changefreq: 'weekly', priority: '0.9' },
  { path: '/contact', changefreq: 'monthly', priority: '0.9' },
];

// 2. Real Services (8 Registered Core Services)
const serviceIds = [
  'websites-web-apps',
  'ui-ux-design',
  'erp-solutions',
  'mobile-app-development',
  'branding-graphic-design',
  'social-media-management',
  'digital-advertising',
  'seo-google-workspace',
];

// 3. Real Target Industries
const industryIds = [
  'healthcare',
  'finance',
  'real-estate',
  'retail',
];

// 4. Real Target Locations
const locationIds = [
  'cameroon',
  'usa',
  'canada',
  'europe',
  'united-kingdom',
];

// 5. Case Studies
const caseStudyIds = [
  'fintech-mobile-app',
  'global-logistics-erp',
  'healthcare-portal',
];

// 6. Read Insight Articles from articlesData.ts
const articlesDataPath = path.join(__dirname, 'src', 'features', 'insights', 'articlesData.ts');
let articles = [];
if (fs.existsSync(articlesDataPath)) {
  const content = fs.readFileSync(articlesDataPath, 'utf-8');
  const articleRegex = /\{\s*"slug":\s*"([^"]+)",\s*"language":\s*"([^"]+)"[\s\S]*?"date":\s*"([^"]+)"/g;
  let match;
  while ((match = articleRegex.exec(content)) !== null) {
    articles.push({
      slug: match[1],
      lang: match[2],
      date: match[3],
    });
  }
}

// Build URL entries
const urlEntries = [];

// Root URL (Points to English default with alternates)
urlEntries.push(`  <url>
    <loc>${BASE_URL}/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/en" />
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE_URL}/fr" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/en" />
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`);

// Helper to generate paired en/fr pages
function addBilingualRoute(subpath, changefreq = 'monthly', priority = '0.8', lastmod = TODAY) {
  const cleanSub = subpath ? (subpath.startsWith('/') ? subpath : `/${subpath}`) : '';
  const enUrl = `${BASE_URL}/en${cleanSub}`;
  const frUrl = `${BASE_URL}/fr${cleanSub}`;

  urlEntries.push(`  <url>
    <loc>${enUrl}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="fr" href="${frUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);

  urlEntries.push(`  <url>
    <loc>${frUrl}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="fr" href="${frUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
}

// Add Static Hub Pages
for (const p of staticHubPages) {
  addBilingualRoute(p.path, p.changefreq, p.priority);
}

// Add 8 Core Services
for (const sId of serviceIds) {
  addBilingualRoute(`/services/${sId}`, 'weekly', '0.9');
}

// Add Industries
for (const ind of industryIds) {
  addBilingualRoute(`/industries/${ind}`, 'monthly', '0.8');
}

// Add Locations
for (const loc of locationIds) {
  addBilingualRoute(`/locations/${loc}`, 'monthly', '0.8');
}

// Add Case Studies
for (const cId of caseStudyIds) {
  addBilingualRoute(`/case-studies/${cId}`, 'monthly', '0.8');
}

// Add Articles
for (const art of articles) {
  const artUrl = `${BASE_URL}/${art.lang}/insights/${art.slug}`;
  urlEntries.push(`  <url>
    <loc>${artUrl}</loc>
    <xhtml:link rel="alternate" hreflang="${art.lang}" href="${artUrl}" />
    <lastmod>${art.date || TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries.join('\n')}
</urlset>
`;

const publicDir = path.resolve(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
console.log(`Multilingual Sitemap generated successfully with ${urlEntries.length} URL entries!`);
