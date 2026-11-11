const fs = require('fs');
let code = fs.readFileSync('src/features/work/WorkPage.tsx', 'utf-8');

code = code.replace(
  /"fintech-app-cameroon"/g,
  '"fintech-mobile-app"'
).replace(
  /"erp-logistics-douala"/g,
  '"global-logistics-erp"'
).replace(
  /"ecommerce-platform-yaounde"/g,
  '"healthcare-portal"'
);

fs.writeFileSync('src/features/work/WorkPage.tsx', code);
