const fs = require('fs');
let code = fs.readFileSync('src/i18n.ts', 'utf-8');

code = code.replace(/..\/public\/locales/g, './locales');
code = code.replace(/request: \(options, url, payload, callback\)/g, 'request: (options: any, url: string, payload: any, callback: any)');
code = code.replace(/resources\.en\[ns\]/g, '(resources.en as any)[ns]');

fs.writeFileSync('src/i18n.ts', code);
