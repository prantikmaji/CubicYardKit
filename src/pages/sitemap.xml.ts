import type { APIRoute } from 'astro';
import { KEYWORD_MAP, SITE_ORIGIN } from '../data/keyword-map';

export const GET: APIRoute = async () => {
  // Static dates — only update a page's date when its content actually changes
  const LAST_MODIFIED: Record<string, string> = {
    '/':                              '2026-10-01',
    '/gravel-calculator/':            '2026-10-01',
    '/dirt-calculator/':              '2026-10-01',
    '/topsoil-calculator/':           '2026-10-01',
    '/concrete-block-calculator/':    '2026-10-01',
    '/concrete-calculator/':          '2026-10-01',
    '/planner/':                      '2026-10-01',
    '/quote-comparison/':             '2026-10-01',
    '/concrete-slab-cost-calculator/': '2026-11-05',
    '/concrete-driveway-cost-calculator/': '2026-11-05',
    '/brick-calculator/':             '2026-11-07',
    '/sand-calculator/':              '2026-11-07',
  };
  const companyLastMod = '2026-10-01';

  const calculatorPages = Object.values(KEYWORD_MAP)
    .filter((p) => p.status === 'active')
    .map((p) => ({
      url: p.canonicalUrl,
      lastmod: LAST_MODIFIED[p.path] ?? '2026-10-01',
      changefreq: p.path === '/' ? 'weekly' : 'monthly',
      priority: p.path === '/' ? '1.0' : p.launchPriority <= 6 ? '0.9' : '0.8',
    }));


  const companyPages = [
    { url: `${SITE_ORIGIN}/about/`, lastmod: companyLastMod, changefreq: 'monthly', priority: '0.6' },
    { url: `${SITE_ORIGIN}/contact/`, lastmod: companyLastMod, changefreq: 'monthly', priority: '0.6' },
    { url: `${SITE_ORIGIN}/disclaimer/`, lastmod: companyLastMod, changefreq: 'monthly', priority: '0.5' },
    { url: `${SITE_ORIGIN}/privacy/`, lastmod: companyLastMod, changefreq: 'monthly', priority: '0.5' },
    { url: `${SITE_ORIGIN}/terms/`, lastmod: companyLastMod, changefreq: 'monthly', priority: '0.5' },
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
