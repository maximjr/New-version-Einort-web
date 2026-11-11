const fs = require('fs');

function replaceLink(file, classNameStr) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/<Button[^>]+onClick=\{\(\) => window\.open\("https:\/\/wa\.me\/message\/52SRSBT3VZXQB1", "_blank"\)\}[^>]*>([\s\S]*?)<\/Button>/g, (match, inner) => {
    return `<a href="https://wa.me/message/52SRSBT3VZXQB1" target="_blank" rel="noopener noreferrer" className="${classNameStr}">
      ${inner.trim()}
    </a>`;
  });
  fs.writeFileSync(file, content);
}

replaceLink('src/features/contact/ContactPage.tsx', "w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-10 px-8 py-2");
replaceLink('src/features/home/Hero.tsx', "border-white/10 hover:bg-white/5 group inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-11 px-8");
replaceLink('src/features/services/ServicesPage.tsx', "border-white/10 hover:bg-white/5 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-11 px-8");
