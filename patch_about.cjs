const fs = require('fs');
let code = fs.readFileSync('src/features/about/AboutPage.tsx', 'utf-8');

const additionalContent = `
          {/* Cameroon Presence & Target Markets */}
          <FadeUp delay={0.3}>
            <section className="mb-24 bg-surface/30 border border-white/5 p-8 md:p-12 rounded-3xl backdrop-blur-sm">
              <h2 className="text-3xl font-display text-white mb-8 border-b border-white/10 pb-4">Cameroon Presence & African Market Focus</h2>
              <div className="grid md:grid-cols-2 gap-12 text-text-muted leading-relaxed">
                <div>
                  <h3 className="text-xl font-medium text-white mb-4">Rooted in Douala</h3>
                  <p>
                    Headquartered in Douala, Cameroon's economic capital, Einort Solutions brings world-class software engineering directly to local and regional enterprises. We understand the unique infrastructural challenges and business contexts of the CEMAC region, allowing us to build resilient systems optimized for African realities (such as mobile-first architectures and low-bandwidth tolerance).
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white mb-4">Target Customers & Industries Served</h3>
                  <p>
                    Our core target customers include mid-sized enterprises, fast-growing startups, and legacy corporations undergoing digital transformation. We serve a diverse range of industries including logistics, retail, fintech, healthcare, and education. Our digital transformation approach focuses on seamless integration, prioritizing tangible ROI and operational efficiency over superficial tech adoption.
                  </p>
                </div>
              </div>
            </section>
          </FadeUp>
          
          {/* Core Services Overview */}
          <FadeUp delay={0.4}>
            <section className="mb-24">
              <h2 className="text-3xl font-display text-white mb-8 border-b border-white/10 pb-4">Core Services & Capabilities</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Custom Software Development", desc: "Building scalable web and mobile applications from the ground up." },
                  { title: "ERP & Business Management", desc: "Centralizing operations with tailored EINORT ERP platforms." },
                  { title: "Digital Transformation & AI", desc: "Automating workflows and integrating smart business intelligence." }
                ].map((s, i) => (
                  <div key={i} className="p-6 bg-primary/5 border border-primary/20 rounded-2xl">
                    <h3 className="text-primary font-medium mb-2">{s.title}</h3>
                    <p className="text-sm text-text-muted">{s.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeUp>
`;

code = code.replace(/<section className="mb-24">\s*<h2 className="text-3xl font-display text-white mb-8 border-b border-white\/10 pb-4">Our Technology Stack<\/h2>/, additionalContent + '\n            <section className="mb-24">\n              <h2 className="text-3xl font-display text-white mb-8 border-b border-white/10 pb-4">Our Technology Stack</h2>');

fs.writeFileSync('src/features/about/AboutPage.tsx', code);
