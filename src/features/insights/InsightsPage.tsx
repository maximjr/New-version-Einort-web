import { Container } from "../../components/layout/Container";
import { FadeUp } from "../../components/animations/FadeUp";
import { SEO } from "../../components/seo/SEO";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { articles } from "./articlesData";

export default function InsightsPage() {
  const { t, i18n } = useTranslation('common');
  const lang = i18n.resolvedLanguage || 'en';
  
  const filteredArticles = articles.filter(a => a.language === lang);

  return (
    <>
      <SEO />
      <div className="pt-32 pb-24 min-h-screen">
        <Container>
          <FadeUp>
            <h1 className="text-4xl md:text-5xl font-display text-white mb-6">
              {t("insights.title", "Insights & Articles")}
            </h1>
            <p className="text-text-muted text-lg max-w-2xl mb-12">
              {t("insights.subtitle", "Expert perspectives on software engineering, digital transformation, and technology in Africa.")}
            </p>
          </FadeUp>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, index) => (
              <FadeUp key={article.slug} delay={index * 0.1}>
                <Link to={`/${lang}/insights/${article.slug}`} className="block h-full group">
                  <div className="bg-surface border border-white/5 rounded-2xl p-6 h-full flex flex-col hover:border-primary/50 transition-colors">
                    <div className="text-primary text-sm font-medium mb-3">{article.category}</div>
                    <h2 className="text-xl font-bold text-white mb-4 group-hover:text-primary transition-colors">{article.title}</h2>
                    <p className="text-text-muted mb-6 flex-grow">{article.excerpt}</p>
                    <div className="text-sm text-text-muted/70 flex justify-between items-center">
                      <span>{article.author}</span>
                      <span>{article.date}</span>
                    </div>
                  </div>
                </Link>
              </FadeUp>
            ))}
          </div>
        </Container>
      </div>
    </>
  );
}
