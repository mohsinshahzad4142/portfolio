import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // ایڈمن پاتھ کو گوگل اور دوسرے سرچ انجنز سے محفوظ رکھنے کے لیے
    },
    sitemap: 'https://mohsin-ai-portfolio.vercel.app/sitemap.xml',
  };
}