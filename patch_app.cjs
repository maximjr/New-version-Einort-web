const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes('WorkPage')) {
  code = code.replace(
    /const ContactPage = lazy\(\(\) => import\("\.\/features\/contact\/ContactPage"\)\);/,
    'const ContactPage = lazy(() => import("./features/contact/ContactPage"));\nconst WorkPage = lazy(() => import("./features/work/WorkPage"));'
  );
  
  code = code.replace(
    /<Route\s*path="contact"/,
    `<Route path="work" element={<Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}><WorkPage /></Suspense>} />\n                <Route path="contact"`
  );
  fs.writeFileSync('src/App.tsx', code);
}
