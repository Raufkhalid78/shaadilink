"use client";

import { m } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/components/language-provider";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function FAQ({ onContactClick }: { onContactClick?: () => void }) {
  const { t, language } = useLanguage();

  const faqs = [
    {
      icon: "💬",
      question: t("faq.q1"),
      answer: t("faq.a1"),
    },
    {
      icon: "💰",
      question: t("faq.q2"),
      answer: t("faq.a2"),
    },
    {
      icon: "✏️",
      question: t("faq.q3"),
      answer: t("faq.a3"),
    },
    {
      icon: "👥",
      question: t("faq.q4"),
      answer: t("faq.a4"),
    },
    {
      icon: "💳",
      question: t("faq.q5"),
      answer: t("faq.a5"),
    },
    {
      icon: "📄",
      question: t("faq.q6"),
      answer: t("faq.a6"),
    },
  ];

  return (
    <section id="faq" className="py-24 sm:py-32 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-emerald-dark/10 to-background" />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-20 reveal-on-scroll">
          <span className="inline-block font-calligraphy text-gold text-lg mb-3">
            ✦ FAQ ✦
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            {language === 'en' ? 'Frequently Asked ' : 'اکثر پوچھے جانے والے '}<span className="gold-shimmer">{language === 'en' ? 'Questions' : 'سوالات'}</span>
          </h2>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
            <div className="h-1.5 w-1.5 rounded-full bg-gold/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
          </div>
          <p className="mt-5 text-muted-foreground max-w-xl mx-auto text-base sm:text-lg text-center">
            {t("faq.subtitle")}
          </p>
        </div>

        {/* FAQ Accordion */}
        <m.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <m.div key={index} variants={itemVariants}>
                <AccordionItem
                  value={`item-${index}`}
                  className="border border-border/40 rounded-xl px-6 bg-card data-[state=open]:border-gold/30 data-[state=open]:shadow-md data-[state=open]:shadow-gold/5 transition-all duration-300"
                >
                  <AccordionTrigger className="text-left font-display text-base sm:text-lg font-semibold text-foreground hover:text-gold hover:no-underline py-5 transition-colors">
                    <span className="flex items-center gap-2.5">
                      <span className="text-base shrink-0">{faq.icon}</span>
                      <span>{faq.question}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pb-5 text-left">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </m.div>
            ))}
          </Accordion>
        </m.div>

        {/* Still have questions */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground text-base sm:text-lg">
            {language === 'en' ? 'Still have questions? ' : 'مزید سوالات ہیں؟ '}
            {onContactClick ? (
              <button
                onClick={onContactClick}
                className="text-gold font-semibold hover:text-gold-light transition-colors underline underline-offset-4 decoration-gold/30"
              >
                {language === 'en' ? 'Contact our support team' : 'ہماری سپورٹ ٹیم سے رابطہ کریں'}
              </button>
            ) : (
              <a href="/contact" className="text-gold font-semibold hover:text-gold-light transition-colors underline underline-offset-4 decoration-gold/30">
                {language === 'en' ? 'Contact our support team' : 'ہماری سپورٹ ٹیم سے رابطہ کریں'}
              </a>
            )}
          </p>
        </m.div>
      </div>
    </section>
  );
}
