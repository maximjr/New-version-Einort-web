const fs = require('fs');
let code = fs.readFileSync('src/constants/seo.ts', 'utf-8');

// Add sameAs and remove founders
code = code.replace(/founders: \[\s*\{\s*"@type": "Person",\s*name: "Einort Leadership"\s*\}\s*\],/, `sameAs: [
      "https://www.facebook.com/share/1E288sJ791/",
      "https://www.instagram.com/einortsolutions?igsh=am0wczAxZTN1em80",
      "https://www.tiktok.com/@einortsolutions.com?_r=1&_t=ZS-98H5nVwcYPg",
      "https://www.linkedin.com/in/einort-solutions-5607a7336?utm_source=share_via&utm_content=profile&utm_medium=member_android"
    ],`);

fs.writeFileSync('src/constants/seo.ts', code);
