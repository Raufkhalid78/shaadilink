"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { useLanguage } from "@/components/language-provider";
import { useFlowStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";
import { Shield } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

// Lazy load below-the-fold components
const HowItWorks = dynamic(() => import("@/components/landing/how-it-works").then(m => m.HowItWorks), { ssr: false });
const Comparison = dynamic(() => import("@/components/landing/comparison").then(m => m.Comparison), { ssr: false });
const TemplateShowcase = dynamic(() => import("@/components/landing/template-showcase").then(m => m.TemplateShowcase), { ssr: false });
const Testimonials = dynamic(() => import("@/components/landing/testimonials").then(m => m.Testimonials), { ssr: false });
const Pricing = dynamic(() => import("@/components/landing/pricing").then(m => m.Pricing), { ssr: false });
const FAQ = dynamic(() => import("@/components/landing/faq").then(m => m.FAQ), { ssr: false });
const CTASection = dynamic(() => import("@/components/landing/cta-section").then(m => m.CTASection), { ssr: false });
const Footer = dynamic(() => import("@/components/landing/footer").then(m => m.Footer), { ssr: false });

function AppPurposeSection() {
  const { t } = useLanguage();
  const features = [
    { icon: "✨", label: t('purpose.feat.1.label'), desc: t('purpose.feat.1.desc') },
    { icon: "🎴", label: t('purpose.feat.2.label'), desc: t('purpose.feat.2.desc') },
    { icon: "⏱️", label: t('purpose.feat.3.label'), desc: t('purpose.feat.3.desc') },
    { icon: "💌", label: t('purpose.feat.4.label'), desc: t('purpose.feat.4.desc') },
    { icon: "🎵", label: t('purpose.feat.5.label'), desc: t('purpose.feat.5.desc') },
    { icon: "🗺️", label: t('purpose.feat.6.label'), desc: t('purpose.feat.6.desc') },
  ];
  return (
    <section id="about-shaadilink" className="py-16 px-4 sm:px-6 bg-gradient-to-b from-emerald-dark/20 to-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(15,107,78,0.08) 0%, transparent 70%)' }} />
      <div className="max-w-5xl mx-auto relative z-10">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="inline-block px-4 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase bg-gold/10 border border-gold/20 text-gold mb-4">
            {t('purpose.badge')}
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            {t('purpose.title.1')}{" "}
            <span className="gold-shimmer">{t('purpose.title.2')}</span> {t('purpose.title.3')}
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            <strong className="text-foreground">ShaadiLink</strong> {t('purpose.desc').replace('ShaadiLink', '')}
          </p>
        </m.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <m.div
              key={f.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-card/50 hover:border-gold/20 hover:bg-card/80 transition-all duration-200"
            >
              <span className="text-2xl shrink-0" role="img" aria-hidden="true">{f.icon}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{f.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{f.desc}</p>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const router = useRouter();
  const { language } = useLanguage();
  const { flowData, resetFlowData, setFlowData } = useFlowStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const syncUser = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setFlowData({
            userId: session.user.id,
            email: session.user.email ?? "",
            fullName: session.user.user_metadata?.full_name ?? "",
          });
        }
      } catch (err) {
        console.error("Home auth sync error:", err);
      }
    };
    syncUser();
  }, [setFlowData]);

  useScrollReveal("landing");

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    resetFlowData();
    router.refresh();
  };

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col min-h-screen"
    >
      <Navbar
        onTemplatesClick={() => router.push("/templates")}
        onGetStarted={scrollToPricing}
        onLoginClick={() => router.push("/login")}
        onAboutClick={() => router.push("/about")}
        onContactClick={() => router.push("/contact")}
        isLoggedIn={!!flowData.userId}
        onDashboardClick={() => router.push("/dashboard")}
        userEmail={flowData.email}
        userFullName={flowData.fullName}
        onSignOut={handleSignOut}
      />
      
      <main id="main-content" className="flex-1">
        <Hero
          onViewTemplates={() => router.push("/templates")}
          onGetStarted={scrollToPricing}
          onViewDemo={() => router.push("/demo/emerald-noir")}
        />
        
        <AppPurposeSection />
        <Features />
        <TemplateShowcase onViewAllClick={() => router.push("/templates")} />
        <HowItWorks />
        <Comparison />
        <Testimonials />
        <Pricing onSelectPlan={(plan) => {
          localStorage.removeItem("shaadilink_pending_flow_data");
          localStorage.removeItem("shaadilink_oauth_in_progress");
          setFlowData({ selectedPlan: plan });
          router.push("/templates");
        }} />
        <FAQ onContactClick={() => router.push("/contact")} />
        <CTASection onGetStarted={scrollToPricing} />

        <section className="py-6 px-4 border-t border-border/30 bg-background/20">
          <div className="max-w-xl mx-auto">
            <details className="text-xs text-muted-foreground cursor-pointer group">
              <summary className="font-semibold text-gold/60 group-hover:text-gold transition-colors list-none flex items-center gap-1.5 justify-center">
                <Shield className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Google Sign-In Data & Purpose Disclosure' : 'گوگل سائن ان ڈیٹا اور مقصد کا انکشاف'}</span>
              </summary>
              <p className="mt-3 text-[11px] leading-relaxed text-center text-muted-foreground/80">
                {language === 'en'
                  ? 'ShaadiLink uses Google Sign-In solely to authenticate your identity and secure access to your wedding invitation drafts and RSVP details. We retrieve your name and email address to maintain account sync. None of this data is shared with third parties or used for any other purpose.'
                  : 'شادی لنک گوگل سائن ان کا استعمال صرف آپ کی شناخت کی تصدیق اور آپ کے دعوت ناموں اور RSVP کی تفصیلات تک محفوظ رسائی کے لیے کرتا ہے۔ ہم آپ کا نام اور ای میل ایڈریس حاصل کرتے ہیں تاکہ اکاؤنٹ سنک کو برقرار رکھا جا سکے۔ یہ ڈیٹا کسی تیسرے فریق کے ساتھ شیئر نہیں کیا جاتا۔'}
              </p>
            </details>
          </div>
        </section>
      </main>

      <Footer
        onTemplatesClick={() => router.push("/templates")}
        onAboutClick={() => router.push("/about")}
        onContactClick={() => router.push("/contact")}
        onLegalClick={(type) => router.push(`/${type}`)}
        onAffiliateClick={() => router.push("/affiliate")}
      />
    </m.div>
  );
}
