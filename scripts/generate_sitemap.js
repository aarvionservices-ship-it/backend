const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://aarvionservices.com';
const PUBLIC_DIR = path.join(__dirname, '../../frontend/public');

// 1. Static Routes
const staticRoutes = [
    '',
    '/about',
    '/services',
    '/careers',
    '/blog',
    '/contact',
    '/privacy',
    '/terms',
    '/login',
    '/setup'
];

// 2. Data Sources (Mirrored from Frontend)
// Services (from ServiceDetail.tsx)
const services = [
    'back-office-support',
    'financial-services',
    'customer-support',
    'admission-help-centre',
    'it-support-outsourcing'
];

// Jobs (from data/jobs.ts)
const jobs = [
    'senior-react-developer',
    'ui-ux-designer',
    'digital-marketing-specialist'
];

// Blog Posts (from BlogGrid.tsx)
const blogPosts = [
    1,
    2,
    3
];

const generateSitemap = () => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add Static Routes
    staticRoutes.forEach(route => {
        xml += `
  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>daily</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    });

    // Add Services
    services.forEach(slug => {
        xml += `
  <url>
    <loc>${BASE_URL}/services/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    // Add Jobs
    jobs.forEach(slug => {
        xml += `
  <url>
    <loc>${BASE_URL}/careers/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // Add Blog Posts
    blogPosts.forEach(id => {
        xml += `
  <url>
    <loc>${BASE_URL}/blog/${id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    const outputPath = path.join(PUBLIC_DIR, 'sitemap.xml');
    fs.writeFileSync(outputPath, xml);
    console.log(`Sitemap generated at ${outputPath}`);

    // Also generate robots.txt if missing (or overwrite to ensure correct sitemap link)
    const robotsPath = path.join(PUBLIC_DIR, 'robots.txt');
    const robotsContent = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;
    fs.writeFileSync(robotsPath, robotsContent);
    console.log(`robots.txt verified at ${robotsPath}`);
};

generateSitemap();
