import type { APIRoute } from 'astro';
import { KEYWORD_MAP, SITE_ORIGIN } from '../data/keyword-map';

export const GET: APIRoute = async () => {
  const today = new Date().toISOString().split('T')[0];

  const calculatorPages = Object.values(KEYWORD_MAP)
    .filter((p) => p.status === 'active')
    .map((p) => ({
      url: p.canonicalUrl,
      lastmod: today,
      changefreq: p.path === '/' ? 'weekly' : 'monthly',
      priority: p.path === '/' ? '1.0' : p.launchPriority <= 6 ? '0.9' : '0.8',
    }));

  const companyPages = [
    { url: `${SITE_ORIGIN}/about/`, lastmod: today, changefreq: 'monthly', priority: '0.6' },
    { url: `${SITE_ORIGIN}/contact/`, lastmod: today, changefreq: 'monthly', priority: '0.6' },
    { url: `${SITE_ORIGIN}/disclaimer/`, lastmod: today, changefreq: 'monthly', priority: '0.5' },
    { url: `${SITE_ORIGIN}/privacy/`, lastmod: today, changefreq: 'monthly', priority: '0.5' },
    { url: `${SITE_ORIGIN}/terms/`, lastmod: today, changefreq: 'monthly', priority: '0.5' },
  ];

  const allPages = [...calculatorPages, ...companyPages];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (p) => `  <url>
    <loc>${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
