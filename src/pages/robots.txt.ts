import type { APIRoute } from 'astro';
import { SITE_ORIGIN } from '../data/keyword-map';

export const GET: APIRoute = async () => {
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
