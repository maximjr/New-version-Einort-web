const fs = require('fs');

const filesToUpdate = [
  'src/features/admin/AdminDashboard.tsx',
  'src/features/client-portal/ClientPortal.tsx',
  'src/features/work/WorkPage.tsx',
  'src/features/case-studies/CaseStudyPage.tsx'
];

filesToUpdate.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace Helmet import with SEO import if not present
  if (content.includes('import { Helmet } from "react-helmet-async"')) {
    let relativePath = '../../components/seo/SEO';
    if (file === 'src/features/admin/AdminDashboard.tsx') relativePath = '../../components/seo/SEO';
    content = content.replace('import { Helmet } from "react-helmet-async";', `import { SEO } from "${relativePath}";\nimport { Helmet } from "react-helmet-async";`);
  }
  
  fs.writeFileSync(file, content);
});
