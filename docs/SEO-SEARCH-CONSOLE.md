# Google Search Console Standard Operating Procedure (SOP)
## Einort Solutions Production Indexing & Verification Architecture

This document outlines the standard operating procedure for verifying domain ownership in Google Search Console (GSC), submitting XML sitemaps, debugging crawl/indexation status, and monitoring organic search visibility for **Einort Solutions** (`https://einortsolutions.com`).

---

## 1. Google Search Console Property Setup

### Recommended Property Type: Domain Property
A **Domain property** covers all subdomains (`www`, non-www, m, staging) and both protocols (`http` and `https`).

1. Navigate to [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property** in the top-left dropdown.
3. Select **Domain** (left box) and enter:
   ```
   einortsolutions.com
   ```
4. Click **Continue**.

*Note: If DNS access is delayed, you can also add a **URL Prefix** property using `https://einortsolutions.com/` for instant meta tag or HTML file verification.*

---

## 2. Verification Methods

### Method A: DNS TXT Record (Primary / Domain Property)
1. Copy the TXT record token provided by Google (e.g., `google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`).
2. Log into your domain registrar or DNS management portal (Cloudflare, Namecheap, GoDaddy, Hostinger).
3. Add a new DNS record:
   - **Type**: `TXT`
   - **Name / Host**: `@` (or leave blank depending on registrar)
   - **Value / Content**: `google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
   - **TTL**: `Auto` or `300` (5 minutes)
4. Allow 2–15 minutes for DNS propagation, then click **Verify** in Search Console.

### Method B: HTML Meta Tag (URL Prefix Property)
The application already has a dedicated verification tag configured in `index.html` and dynamic runtime support via `SEO.tsx`.

1. In Google Search Console, under **URL prefix**, choose **HTML tag**.
2. Copy the content code inside `content="..."`.
3. Set your environment variable in your production deployment:
   ```env
   VITE_GOOGLE_SITE_VERIFICATION=your_gsc_verification_token_here
   ```
   Or update `<meta name="google-site-verification" content="your_token" />` in `index.html`.
4. Click **Verify**.

### Method C: HTML File Verification
1. Download Google's verification file (e.g., `google1234567890abcdef.html`).
2. Place the file directly in the `/public` directory of this repository:
   ```bash
   public/google1234567890abcdef.html
   ```
3. Rebuild and deploy (`npm run build`).
4. Verify by browsing to `https://einortsolutions.com/google1234567890abcdef.html`.
5. Click **Verify** in Search Console.

---

## 3. Submitting the XML Sitemap

Einort Solutions generates an automated multilingual XML sitemap during every build using `generate-sitemap.js`.

### Sitemap Location:
```
https://einortsolutions.com/sitemap.xml
```

### Submission Steps:
1. In Google Search Console, select your verified property.
2. In the left navigation menu, click **Sitemaps** (under Indexing).
3. Under **Add a new sitemap**, enter:
   ```
   sitemap.xml
   ```
4. Click **Submit**.
5. The status will transition from *Processing* to **Success**.
6. Verify that all 79+ URLs (including bilingual routes for `/en` and `/fr`, all 8 core services, 4 industries, 5 locations, 3 case studies, and 26 tech insight articles) are detected.

---

## 4. Accelerated Initial Indexing (URL Inspection Tool)

To speed up Googlebot's first crawl of priority pages:

1. In GSC, click the search bar at the very top: **Inspect any URL in "einortsolutions.com"**.
2. Submit the priority landing pages one by one:
   - `https://einortsolutions.com/` (Root)
   - `https://einortsolutions.com/en` (English Home)
   - `https://einortsolutions.com/fr` (French Home)
   - `https://einortsolutions.com/en/services` (Services Catalog)
   - `https://einortsolutions.com/en/services/websites-web-apps`
   - `https://einortsolutions.com/en/services/erp-solutions`
   - `https://einortsolutions.com/en/about`
   - `https://einortsolutions.com/en/work`
   - `https://einortsolutions.com/en/insights`
3. Click **Test Live URL** to confirm Googlebot smartphone can render the page with HTTP 200 and valid DOM.
4. Click **Request Indexing**.
5. Repeat for top priority conversion pages (Google allows ~10–12 live inspection requests per day).

---

## 5. Technical SEO & Indexation Safeguards in the Codebase

The Einort Solutions platform enforces the following SEO architecture:

| Component | Standard Implemented | Purpose |
|---|---|---|
| **Robots.txt** | `Allow: /`, `Disallow: /admin`, `Disallow: /client-portal` | Allows search engines to crawl all public landing pages while protecting internal dashboards. |
| **Robots Meta Tag** | `index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1` | Explicitly authorizes snippet expansion and rich image carousels in search results. |
| **Canonical URLs** | Self-referencing `<link rel="canonical">` on every route | Prevents duplicate content penalties between protocols, query parameters, and trailing slashes. |
| **Hreflang Tags** | Dual `<xhtml:link rel="alternate" hreflang="en/fr/x-default">` | Serves proper English or French versions based on user browser location and language. |
| **JSON-LD Schema** | `Organization`, `LocalBusiness`, `WebSite`, `BreadcrumbList`, `Service`, `Article` | Unlocks Google Knowledge Graph cards, local map pack visibility, and rich article badges. |
| **Heading Hierarchy** | Single `<h1>` per page with semantically ordered `<h2>` & `<h3>` subheadings | Maximizes topic clarity and keyword relevance for ranking algorithms. |
| **OpenGraph & Twitter** | 1200x630 compressed card (`/og-image.png`) with verified dimensions | High-converting click-through rates when links are shared on LinkedIn, WhatsApp, and X. |
| **HTTPS Security** | `<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">` | Ensures zero mixed-content warnings and enforces secure SSL/TLS. |

---

## 6. Troubleshooting Common Google Indexing Issues

### Issue 1: "Discovered – currently not indexed"
- **Cause**: Googlebot found the URL in the sitemap or via an internal link, but has not yet scheduled crawling due to crawl budget.
- **Remedy**:
  - Request indexing via the URL Inspection tool for the top 5 pages.
  - Ensure internal links exist from the homepage or footer (already implemented).
  - Build 2–3 initial external backlinks (see `docs/BACKLINK-STRATEGY.md`).

### Issue 2: "Crawled – currently not indexed"
- **Cause**: Google crawled the URL, but decided not to add it to the index because of duplicate content, thin content, or slow rendering.
- **Remedy**:
  - Verify that each service and article has rich, unique localized copy (over 400 words).
  - Confirm page rendering in the URL Inspection tool ("View Tested Page" > "Screenshot").

### Issue 3: Duplicate Without User-Selected Canonical
- **Cause**: URL accessed via different variants (e.g., `http://`, `https://`, `?ref=...`).
- **Remedy**:
  - The platform now dynamically outputs strict canonical URLs for every route. Ensure 301 redirects are enabled on your reverse proxy or CDN (Cloudflare) from `http://` to `https://` and from `www` to non-www.

---

## 7. Ongoing Weekly Monitoring Checklist

1. **Check Coverage / Page Indexing Report**:
   Ensure "Valid / Indexed" count is steadily climbing toward 79+.
2. **Review Search Performance (Queries & Impressions)**:
   Track rankings for target terms:
   - *"software development company Cameroon"*
   - *"ERP solutions Douala"*
   - *"web development Cameroon"*
   - *"entreprise transformation digitale Cameroun"*
3. **Core Web Vitals**:
   Confirm all pages remain in the "Good" threshold for LCP (< 2.5s), INP (< 200ms), and CLS (< 0.1).
