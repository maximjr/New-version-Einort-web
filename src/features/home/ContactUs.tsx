import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Container } from "../../components/layout/Container";
import { FadeUp } from "../../components/animations/FadeUp";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Send, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
// import { messageService } from "../../services/admin/messageService";
import { auth } from "../../lib/firebase";
import { signInAnonymously } from "firebase/auth";
import { rateLimiter } from "../../lib/rateLimiter";
import { sanitizeInputText } from "../../lib/sanitizer";

export function ContactUs() {
  const { t } = useTranslation(['contact', 'forms', 'errors']);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user } = useAuth();

  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    const limit = rateLimiter.check('contact', email.trim().toLowerCase());
    if (!limit.allowed) {
      setRateLimitError(`Rate limit exceeded. Please wait ${Math.ceil(limit.resetTimeMs / 60000)} minute(s).`);
      return;
    }

    setRateLimitError(null);
    setIsSubmitting(true);
    try {
      let currentUser = user;

      if (!currentUser && auth) {
        const userCredential = await signInAnonymously(auth);
        currentUser = userCredential.user as any;
      }

      if (currentUser) {
        const { messageService } = await import("../../services/admin/messageService");
        const superAdminId = await messageService.getSuperAdminUid();
        const conversationId = await messageService.getOrCreateConversation(
          currentUser.uid,
          superAdminId,
        );

        const cleanName = sanitizeInputText(name, 100);
        const cleanEmail = sanitizeInputText(email, 100);
        const cleanMessage = sanitizeInputText(message, 3000);

        const fullMessage = t('contact:message_template', { 
          name: cleanName, 
          email: cleanEmail, 
          message: cleanMessage 
        });

        await messageService.sendMessage(
          conversationId,
          currentUser.uid,
          superAdminId,
          fullMessage,
        );
      }

      rateLimiter.reset('contact', email.trim().toLowerCase());
      setIsSuccess(true);
      setName("");
      setEmail("");
      setMessage("");

      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Error sending contact message:", error);
      // fallback if anonymous auth fails (e.g., if it's disabled in Firebase)
      alert(t('errors:contact_send'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 bg-surface/50 z-10 relative" id="contact-us">
      <Container>
        <div className="max-w-3xl mx-auto">
          <FadeUp>
            <div className="flex flex-col gap-4 text-center mb-12">
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                {t('contact:badge')}
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-medium tracking-tight text-white leading-[1.1]">
                {t('contact:title')}
              </h2>
              <p className="text-lg text-text-muted mt-4 font-light">
                {t('contact:description')}
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="bg-background border border-white/5 rounded-2xl p-8 md:p-10">
              {isSuccess ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-primary" />
                  </div>
                  <h3 className="text-2xl font-medium text-white mb-4">
                    {t('contact:success.title')}
                  </h3>
                  <p className="text-text-muted">
                    {t('contact:success.message', { name: name || "for reaching out" })}
                  </p>
                  <Button
                    className="mt-8"
                    onClick={() => setIsSuccess(false)}
                    variant="outline"
                  >
                    {t('forms:buttons.send_another')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium text-text-muted"
                      >
                        {t('forms:labels.name')}
                      </label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('forms:placeholders.name')}
                        required
                        className="bg-surface border-white/10"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-text-muted"
                      >
                        {t('forms:labels.email')}
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('forms:placeholders.email')}
                        required
                        className="bg-surface border-white/10"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium text-text-muted"
                    >
                      {t('forms:labels.message')}
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t('forms:placeholders.message')}
                      required
                      rows={5}
                      className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all font-light resize-none"
                      disabled={isSubmitting}
                    ></textarea>
                  </div>

                  {rateLimitError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                      {rateLimitError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-14"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                        {t('forms:buttons.sending')}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2 font-bold tracking-[0.1em] uppercase">
                        {t('forms:buttons.send_message')} <Send size={18} />
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </FadeUp>
        </div>
      </Container>
    </section>
  );
}
