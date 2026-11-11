import { useMemo } from 'react';
import { Container } from "../../components/layout/Container";
import { FadeUp } from "../../components/animations/FadeUp";
import { SEO } from "../../components/seo/SEO";
import { useParams, Navigate, Link } from "react-router-dom";
import { articles } from "./articlesData";
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { SITE_URL } from "../../constants/seo";
import { sanitizeHtml } from "../../lib/sanitizer";

export default function ArticlePage() {
  const { lang, articleSlug } = useParams();
  const { t } = useTranslation('common');
  
  const article = useMemo(() => {
    return articles.find(a => a.slug === articleSlug && a.language === lang);
  }, [articleSlug, lang]);

  if (!article) {
    return <Navigate to={`/${lang}/insights`} replace />;
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "datePublished": article.date,
    "dateModified": (article as any).updatedDate || article.date,
    "publisher": {
      "@type": "Organization",
      "name": "Einort Solutions",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/icon.png`
      }
    }
  };

  return (
    <>
      <SEO 
        title={article.seoTitle || article.title}
        description={article.metaDescription || article.excerpt}
        schema={JSON.stringify(articleSchema)}
      />
      <div className="pt-32 pb-24 min-h-screen">
        <Container>
          <FadeUp>
            <Link to={`/${lang}/insights`} className="inline-flex items-center text-text-muted hover:text-white mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("insights.back", "Back to Insights")}
            </Link>
          </FadeUp>
          
          <FadeUp delay={0.1}>
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <span className="text-primary font-medium tracking-wider uppercase text-sm">{article.category}</span>
                <h1 className="text-3xl md:text-5xl font-display text-white mt-4 mb-6 leading-tight">
                  {article.title}
                </h1>
                <div className="flex items-center text-text-muted text-sm gap-4 border-b border-white/10 pb-8">
                  <span>By {article.author}</span>
                  <span>•</span>
                  <span>{article.date}</span>
                </div>
              </div>
              
              <div 
                className="prose prose-invert prose-lg max-w-none prose-p:text-text-muted prose-headings:text-white prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-white"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
              />
            </div>
          </FadeUp>
        </Container>
      </div>
    </>
  );
}
