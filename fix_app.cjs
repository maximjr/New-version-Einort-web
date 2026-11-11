const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes('const WorkPage')) {
  code = code.replace(
    /const ContactPage = [^\n]+/,
    match => `${match}\nconst WorkPage = lazy(() => import("./features/work/WorkPage"));`
  );
  fs.writeFileSync('src/App.tsx', code);
}
