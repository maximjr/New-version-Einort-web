const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /const ContactPage = Loadable\(\nconst WorkPage = lazy\(\(\) => import\("\.\/features\/work\/WorkPage"\)\);\n  lazyWithRetry\(\(\) => import\("\.\/features\/contact\/ContactPage"\)\.then\(\(m\) => \({ default: m\.ContactPage }\)\)\),\n\);/,
  `const ContactPage = Loadable(
  lazyWithRetry(() => import("./features/contact/ContactPage").then((m) => ({ default: m.ContactPage }))),
);

const WorkPage = lazy(() => import("./features/work/WorkPage"));`
);

// wait, the lazy function itself might not be imported if I just use `lazy`.
if (!code.includes('import { lazy }')) {
    code = code.replace(/import \{ Suspense, useEffect \} from "react";/, 'import { Suspense, useEffect, lazy } from "react";');
}

fs.writeFileSync('src/App.tsx', code);
