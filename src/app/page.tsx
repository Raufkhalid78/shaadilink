"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { toast } from "sonner";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { StatsBar } from "@/components/landing/stats-bar";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Comparison } from "@/components/landing/comparison";
import { TemplateShowcase } from "@/components/landing/template-showcase";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { useLanguage } from "@/components/language-provider";
import dynamic from "next/dynamic";

const TemplatesPage = dynamic(() => import("@/components/landing/templates-page").then(m => m.TemplatesPage), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background" />
});

const SignupPage = dynamic(() => import("@/components/flow/signup-page").then(m => m.SignupPage), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background flex items-center justify-center text-gold">Loading...</div>
});

const LoginPage = dynamic(() => import("@/components/flow/login-page").then(m => m.LoginPage), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background flex items-center justify-center text-gold">Loading...</div>
});

const DetailsPage = dynamic(() => import("@/components/flow/details-page").then(m => m.DetailsPage), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background flex items-center justify-center text-gold">Loading details editor...</div>
});

const PaymentPage = dynamic(() => import("@/components/flow/payment-page").then(m => m.PaymentPage), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background flex items-center justify-center text-gold">Loading payment...</div>
});

const SuccessPage = dynamic(() => import("@/components/flow/success-page").then(m => m.SuccessPage), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background" />
});

const AboutPage = dynamic(() => import("@/components/flow/about-page").then(m => m.AboutPage), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background" />
});

const ContactPage = dynamic(() => import("@/components/flow/contact-page").then(m => m.ContactPage), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background" />
});

const AffiliatePage = dynamic(() => import("@/components/flow/affiliate-page").then(m => m.AffiliatePage), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background" />
});

const LegalPage = dynamic(() => import("@/components/flow/legal-page").then(m => m.LegalPage), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background" />
});

const DashboardPage = dynamic(() => import("@/components/flow/dashboard-page").then(m => m.DashboardPage), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background flex items-center justify-center text-gold">Loading dashboard...</div>
});

const InvitationViewer = dynamic(() => import("@/components/viewer/invitation-viewer"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-background flex items-center justify-center text-gold font-display text-xl z-[200]">Loading invitation...</div>
});
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Sparkles, Shield, Loader2 } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import type { FlowData, FlowStep } from "@/lib/flow-types";
import { initialFlowData } from "@/lib/flow-types";
import { getTheme } from "@/components/viewer/utils";
import { createClient } from "@/lib/supabase/client";

/* ─── What Is ShaadiLink? Section (fulfills Google OAuth homepage purpose requirement) ─── */
function AppPurposeSection({ onGetStarted }: { onGetStarted?: () => void }) {
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
        {/* Heading */}
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
          <p className="mt-3 text-muted-foreground/80 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed border-t border-gold/20 pt-3 italic">
            🔐 <strong>{t('purpose.auth.badge')}:</strong> {t('purpose.auth.text')}
          </p>
        </m.div>

        {/* Feature grid */}
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

        {/* CTA */}
        {onGetStarted && (
          <m.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 text-center"
          >
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald hover:bg-emerald-dark text-primary-foreground font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald/20 hover:shadow-emerald/30"
            >
              <Sparkles className="w-4 h-4" />
              Create Your Invitation — Starting Rs. 3,499
            </button>
          </m.div>
        )}
      </div>
    </section>
  );
}

/* Wrapper for page transitions */
function InfoPageWrapper({ children, stepKey }: { children: React.ReactNode; stepKey: string }) {
  return (
    <m.div
      key={stepKey}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4 }}
      className="flex-1"
    >
      {children}
    </m.div>
  );
}

function HomeInner() {
  const [currentStep, setCurrentStepInternal] = useState<FlowStep>("landing");
  const [demoSourceStep, setDemoSourceStep] = useState<FlowStep | null>(null);

const setCurrentStep = useCallback((step: FlowStep) => {
    setCurrentStepInternal(step);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("step", step);
      if (step !== "demo") url.searchParams.delete("theme");
      // Once we've moved past the entry-point params, clear them so they don't
      // stick around in the URL and re-trigger on a future refresh
      if (step !== "details" && step !== "success") {
        url.searchParams.delete("edit");
        url.searchParams.delete("upgrade");
        url.searchParams.delete("buyMoreLinks");
        url.searchParams.delete("start");
      }
      window.history.pushState({ step }, "", url.pathname + url.search);
    }
  }, []);

  // Listen to popstate to handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.step) {
        setCurrentStepInternal(e.state.step);
      } else {
        const params = new URLSearchParams(window.location.search);
        const stepParam = params.get("step") as FlowStep;
        setCurrentStepInternal(stepParam || "landing");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);


  const [flowData, setFlowData] = useState<FlowData>(initialFlowData);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  // Track previous step so Details → Back works correctly
  const [stepBeforeDetails, setStepBeforeDetails] = useState<FlowStep>("signup");

  // Initialize step from URL query parameter on first load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const stepParam = params.get("step") as FlowStep;
      if (stepParam) {
        setCurrentStepInternal(stepParam);
      }
      const themeParam = params.get("theme");
      if (themeParam) {
        setPreviewTemplateId(themeParam);
      } else {
        setPreviewTemplateId("emerald-noir");
      }
    }
  }, []);

  useScrollReveal(currentStep);
  const { t, language } = useLanguage();
  const router = useRouter();

  const searchParams = useSearchParams();
  const [isLoadingParams, setIsLoadingParams] = useState(true);

  // Handle query params from /dashboard route (?start=create, ?edit=ID, ?upgrade=ID)
  useEffect(() => {
    const start = searchParams.get("start");
    const editId = searchParams.get("edit");
    const upgradeId = searchParams.get("upgrade");
    const buyMoreLinksId = searchParams.get("buyMoreLinks");
    if (!start && !editId && !upgradeId && !buyMoreLinksId) {
      setIsLoadingParams(false);
      return;
    }

    if (start === "create") {
      localStorage.removeItem("shaadilink_pending_flow_data");
      localStorage.removeItem("shaadilink_oauth_in_progress");
      setFlowData((prev) => ({
        ...JSON.parse(JSON.stringify(initialFlowData)),
        userId: prev.userId,
        email: prev.email,
        fullName: prev.fullName,
      }));
      setCurrentStep("templates");
      setIsLoadingParams(false);
      return;
    } else if (start === "demo") {
      const themeParam = searchParams.get("theme") || searchParams.get("template");
      if (themeParam) {
        setPreviewTemplateId(themeParam);
      }
      setCurrentStep("demo");
      setIsLoadingParams(false);
      return;
    }

    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        setIsLoadingParams(false);
        return;
      }
      const mergedData: FlowData = {
        ...initialFlowData,
        userId: session.user.id,
        email: session.user.email ?? "",
        fullName: session.user.user_metadata?.full_name ?? "",
      };
      setFlowData(mergedData);

      if (editId) {
        fetch(`/api/invitations/${editId}`)
          .then((r) => r.json())
          .then(({ invitation }) => {
            if (invitation) {
              setFlowData((prev) => ({
                ...prev,
                invitationId: invitation.id,
                selectedTemplateId: invitation.template_id,
                partner1Name: invitation.partner1_name ?? "",
                partner2Name: invitation.partner2_name ?? "",
                venue: invitation.venue ?? "",
                venueAddress: invitation.venue_address ?? "",
                welcomeMessage: invitation.welcome_message ?? "",
                backgroundMusic: invitation.background_music ?? "no-music",
                dressCodeWomen: invitation.dress_code_women ?? "",
                dressCodeMen: invitation.dress_code_men ?? "",
                transportation: invitation.transportation ?? "",
                accommodation: invitation.accommodation ?? "",
                gifts: invitation.gifts ?? "",
                heroImage: invitation.hero_image_url ?? "",
                slideshowImages: invitation.slideshow_image_urls ?? [],
                youtubeVideoId: invitation.youtube_video_id ?? "",
                guestLinksQuota: invitation.guest_links_quota ?? 0,
                originalGuestLinksQuota: invitation.guest_links_quota ?? 0,
                events: ((invitation.events as { name: string; date: string; time: string; venue?: string; order_index: number }[]) || [])
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((e) => ({ name: e.name, date: e.date, time: e.time, venue: e.venue })),
                selectedPlan: invitation.plan,
                paymentDone: invitation.is_active,
                showBismillah: invitation.show_bismillah ?? true,
                showQuranVerse: invitation.show_quran_verse ?? true,
                hostBrideFamily: invitation.host_bride_family ?? "",
                hostGroomFamily: invitation.host_groom_family ?? "",
                hostBrideCity: invitation.host_bride_city ?? "",
                hostGroomCity: invitation.host_groom_city ?? "",
                contactPhone: invitation.contact_phone ?? "",
                isSegregated: invitation.is_segregated ?? false,
                venueDetailsSegregated: invitation.venue_details_segregated ?? "",
                showNikahRegistration: invitation.show_nikah_registration ?? false,
                slug: invitation.slug ?? "",
              }));
              setStepBeforeDetails("dashboard");
              setCurrentStep("details");
            }
          })
          .finally(() => setIsLoadingParams(false));
      } else if (upgradeId) {
        fetch(`/api/invitations/${upgradeId}`)
          .then((r) => r.json())
          .then(({ invitation }) => {
            if (invitation) {
              setFlowData((prev) => ({
                ...prev,
                invitationId: invitation.id,
                selectedTemplateId: invitation.template_id,
                partner1Name: invitation.partner1_name ?? "",
                partner2Name: invitation.partner2_name ?? "",
                venue: invitation.venue ?? "",
                venueAddress: invitation.venue_address ?? "",
                welcomeMessage: invitation.welcome_message ?? "",
                backgroundMusic: invitation.background_music ?? "no-music",
                dressCodeWomen: invitation.dress_code_women ?? "",
                dressCodeMen: invitation.dress_code_men ?? "",
                transportation: invitation.transportation ?? "",
                accommodation: invitation.accommodation ?? "",
                gifts: invitation.gifts ?? "",
                heroImage: invitation.hero_image_url ?? "",
                slideshowImages: invitation.slideshow_image_urls ?? [],
                youtubeVideoId: invitation.youtube_video_id ?? "",
                guestLinksQuota: invitation.guest_links_quota ?? 0,
                originalGuestLinksQuota: invitation.guest_links_quota ?? 0,
                events: ((invitation.events as { name: string; date: string; time: string; venue?: string; order_index: number }[]) || [])
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((e) => ({ name: e.name, date: e.date, time: e.time, venue: e.venue })),
                selectedPlan: "royal",
                paymentDone: false,
                showBismillah: invitation.show_bismillah ?? true,
                showQuranVerse: invitation.show_quran_verse ?? true,
                hostBrideFamily: invitation.host_bride_family ?? "",
                hostGroomFamily: invitation.host_groom_family ?? "",
                hostBrideCity: invitation.host_bride_city ?? "",
                hostGroomCity: invitation.host_groom_city ?? "",
                contactPhone: invitation.contact_phone ?? "",
                isSegregated: invitation.is_segregated ?? false,
                venueDetailsSegregated: invitation.venue_details_segregated ?? "",
                showNikahRegistration: invitation.show_nikah_registration ?? false,
                slug: invitation.slug ?? "",
              }));
              setStepBeforeDetails("dashboard");
              setCurrentStep("details");
            }
          })
          .finally(() => setIsLoadingParams(false));
      } else if (buyMoreLinksId) {
        fetch(`/api/invitations/${buyMoreLinksId}`)
          .then((r) => r.json())
          .then(({ invitation }) => {
            if (invitation) {
              setFlowData((prev) => ({
                ...prev,
                invitationId: invitation.id,
                selectedTemplateId: invitation.template_id,
                partner1Name: invitation.partner1_name ?? "",
                partner2Name: invitation.partner2_name ?? "",
                venue: invitation.venue ?? "",
                venueAddress: invitation.venue_address ?? "",
                welcomeMessage: invitation.welcome_message ?? "",
                backgroundMusic: invitation.background_music ?? "no-music",
                dressCodeWomen: invitation.dress_code_women ?? "",
                dressCodeMen: invitation.dress_code_men ?? "",
                transportation: invitation.transportation ?? "",
                accommodation: invitation.accommodation ?? "",
                gifts: invitation.gifts ?? "",
                heroImage: invitation.hero_image_url ?? "",
                slideshowImages: invitation.slideshow_image_urls ?? [],
                youtubeVideoId: invitation.youtube_video_id ?? "",
                guestLinksQuota: invitation.guest_links_quota ?? 0,
                originalGuestLinksQuota: invitation.guest_links_quota ?? 0,
                events: ((invitation.events as { name: string; date: string; time: string; venue?: string; order_index: number }[]) || [])
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((e) => ({ name: e.name, date: e.date, time: e.time, venue: e.venue })),
                selectedPlan: invitation.plan,
                paymentDone: true,
                showBismillah: invitation.show_bismillah ?? true,
                showQuranVerse: invitation.show_quran_verse ?? true,
                hostBrideFamily: invitation.host_bride_family ?? "",
                hostGroomFamily: invitation.host_groom_family ?? "",
                hostBrideCity: invitation.host_bride_city ?? "",
                hostGroomCity: invitation.host_groom_city ?? "",
                contactPhone: invitation.contact_phone ?? "",
                isSegregated: invitation.is_segregated ?? false,
                venueDetailsSegregated: invitation.venue_details_segregated ?? "",
                showNikahRegistration: invitation.show_nikah_registration ?? false,
                slug: invitation.slug ?? "",
              }));
              setStepBeforeDetails("dashboard");
              setCurrentStep("payment");
            }
          })
          .finally(() => setIsLoadingParams(false));
      } else {
        setIsLoadingParams(false);
      }
    }).catch(() => setIsLoadingParams(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restore session and flowData on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("edit") || params.get("upgrade") || params.get("buyMoreLinks") || params.get("start") === "create" || params.get("start") === "demo") {
      return;
    }

    const supabase = createClient();

    // Check if there is saved flowData in localStorage
    const savedDataStr = localStorage.getItem("shaadilink_pending_flow_data");
    let savedData: FlowData | null = null;
    if (savedDataStr) {
      try {
        savedData = JSON.parse(savedDataStr) as FlowData;
      } catch (e) {
        console.error("Failed to parse saved flowData:", e);
      }
    }

    const oauthInProgress = localStorage.getItem("shaadilink_oauth_in_progress") === "true";

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const mergedData: FlowData = {
          ...(savedData || initialFlowData),
          userId: session.user.id,
          email: session.user.email ?? (savedData?.email || ""),
          fullName: session.user.user_metadata?.full_name ?? (savedData?.fullName || ""),
        };
        
        setFlowData(mergedData);

        // If they completed Google OAuth login/signup, advance their step
        if (oauthInProgress) {
          if (mergedData.selectedTemplateId) {
            setStepBeforeDetails("templates");
            setCurrentStep("details");
          } else {
            setCurrentStep("dashboard");
          }
          localStorage.removeItem("shaadilink_oauth_in_progress");
          localStorage.removeItem("shaadilink_pending_flow_data");
        }
      } else if (savedData) {
        // If there's no session, but we have saved flowData, load it so inputs are preserved
        setFlowData({
          ...savedData,
          userId: "",
          email: "",
          fullName: "",
        });
      }
    });
  }, []);

  // Listen to auth state changes to keep session properties synchronized
  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setFlowData((prev) => ({
          ...prev,
          userId: session.user.id,
          email: session.user.email ?? "",
          fullName: session.user.user_metadata?.full_name ?? "",
        }));
      } else {
        setFlowData((prev) => ({
          ...prev,
          userId: "",
          email: "",
          fullName: "",
        }));
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Save flowData to localStorage when it changes to preserve progress during OAuth redirect
  useEffect(() => {
    if (
      flowData.selectedPlan ||
      flowData.selectedTemplateId ||
      flowData.partner1Name ||
      flowData.fullName ||
      flowData.email
    ) {
      localStorage.setItem("shaadilink_pending_flow_data", JSON.stringify(flowData));
    }
  }, [flowData]);

  // Restore success step from query params if redirecting from payment gateway callback
  useEffect(() => {
    const step = searchParams.get("step");
    const invitationId = searchParams.get("invitationId");
    if (step === "success" && invitationId && currentStep !== "success") {
      fetch(`/api/invitations/${invitationId}`)
        .then((r) => r.json())
        .then(({ invitation }) => {
          if (invitation) {
            setFlowData((prev) => ({
              ...prev,
              invitationId: invitation.id,
              selectedTemplateId: invitation.template_id,
              partner1Name: invitation.partner1_name ?? "",
              partner2Name: invitation.partner2_name ?? "",
              venue: invitation.venue ?? "",
              venueAddress: invitation.venue_address ?? "",
              welcomeMessage: invitation.welcome_message ?? "",
              backgroundMusic: invitation.background_music ?? "no-music",
              dressCodeWomen: invitation.dress_code_women ?? "",
              dressCodeMen: invitation.dress_code_men ?? "",
              transportation: invitation.transportation ?? "",
              accommodation: invitation.accommodation ?? "",
              gifts: invitation.gifts ?? "",
              heroImage: invitation.hero_image_url ?? "",
              slideshowImages: invitation.slideshow_image_urls ?? [],
              youtubeVideoId: invitation.youtube_video_id ?? "",
              guestLinksQuota: invitation.guest_links_quota ?? 0,
              originalGuestLinksQuota: invitation.guest_links_quota ?? 0,
              events: ((invitation.events as { name: string; date: string; time: string; venue?: string; order_index: number }[]) || [])
                .sort((a, b) => a.order_index - b.order_index)
                .map((e) => ({ name: e.name, date: e.date, time: e.time, venue: e.venue })),
              selectedPlan: invitation.plan,
              paymentDone: invitation.is_active,
              showBismillah: invitation.show_bismillah ?? true,
              showQuranVerse: invitation.show_quran_verse ?? true,
              hostBrideFamily: invitation.host_bride_family ?? "",
              hostGroomFamily: invitation.host_groom_family ?? "",
              hostBrideCity: invitation.host_bride_city ?? "",
              hostGroomCity: invitation.host_groom_city ?? "",
              contactPhone: invitation.contact_phone ?? "",
              isSegregated: invitation.is_segregated ?? false,
              venueDetailsSegregated: invitation.venue_details_segregated ?? "",
              showNikahRegistration: invitation.show_nikah_registration ?? false,
              slug: invitation.slug ?? "",
            }));
            setCurrentStep("success");
            localStorage.removeItem("shaadilink_pending_flow_data");
            // Clear invitationId from URL to prevent infinite fetching
            window.history.replaceState({}, '', '/?step=success');
          }
        })
        .catch((err) => {
          console.error("Failed to load invitation on success redirect:", err);
          toast.error("Failed to load invitation details.");
        });
    }
  }, [searchParams, currentStep, setCurrentStep]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [currentStep]);

  const updateFlowData = useCallback((updates: Partial<FlowData>) => {
    setFlowData((prev) => ({ ...prev, ...updates }));
  }, []);

  /* ── Navigation Handlers ── */
  const handleGetStarted = (plan: "classic" | "royal") => {
    updateFlowData({ selectedPlan: plan });
    setCurrentStep("templates");
  };

  const handleSelectTemplate = (templateId: string, plan: "classic" | "royal") => {
    updateFlowData({ selectedTemplateId: templateId, selectedPlan: plan });
    // If already logged in, skip signup and go to details
    if (flowData.userId) {
      setStepBeforeDetails("templates");
      setCurrentStep("details");
    } else {
      setCurrentStep("signup");
    }
  };

  const handleSignupComplete = () => {
    // Guard: ensure plan is selected before going to details
    if (!flowData.selectedPlan) {
      setCurrentStep("templates");
      return;
    }
    setStepBeforeDetails("signup");
    setCurrentStep("details");
  };

  const handleLoginComplete = (userId: string, email: string) => {
    updateFlowData({ userId, email });
    // If a template was already selected, go to details; otherwise redirect to /dashboard
    if (flowData.selectedTemplateId) {
      setStepBeforeDetails("login");
      setCurrentStep("details");
    } else {
      router.push("/dashboard");
    }
  };

  const handleDetailsComplete = () => {
    // If payment is already done (i.e. editing a live page), save directly back to dashboard
    if (flowData.paymentDone) {
      toast.success("Invitation details updated successfully! 🎉");
      setCurrentStep("dashboard");
    } else {
      setCurrentStep("payment");
    }
  };

  const handlePaymentComplete = () => {
    setCurrentStep("success");
  };

  const handleViewInvitation = () => {
    setDemoSourceStep("success");
    setPreviewTemplateId(flowData.selectedTemplateId);
    setCurrentStep("demo");
  };

  const handleViewInvitationById = (invitationId: string) => {
    setDemoSourceStep("dashboard");
    // Load the invitation into flowData for viewing
    fetch(`/api/invitations/${invitationId}`)
      .then((r) => r.json())
      .then(({ invitation }) => {
        if (invitation) {
          updateFlowData({
            invitationId: invitation.id,
            selectedTemplateId: invitation.template_id,
            partner1Name: invitation.partner1_name,
            partner2Name: invitation.partner2_name,
            venue: invitation.venue,
            venueAddress: invitation.venue_address,
            welcomeMessage: invitation.welcome_message,
            backgroundMusic: invitation.background_music,
            dressCodeWomen: invitation.dress_code_women,
            dressCodeMen: invitation.dress_code_men,
            transportation: invitation.transportation,
            accommodation: invitation.accommodation,
            gifts: invitation.gifts,
            heroImage: invitation.hero_image_url,
            slideshowImages: invitation.slideshow_image_urls || [],
            youtubeVideoId: invitation.youtube_video_id ?? "",
            guestLinksQuota: invitation.guest_links_quota ?? 0,
            events: (invitation.events || []).sort(
              (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
            ).map((e: { name: string; date: string; time: string; venue?: string }) => ({
              name: e.name, date: e.date, time: e.time, venue: e.venue,
            })),
            selectedPlan: invitation.plan,
            slug: invitation.slug ?? "",
          });
          setPreviewTemplateId(invitation.template_id);
          setCurrentStep("demo");
        }
      })
      .catch(() => {
        setPreviewTemplateId(invitationId);
        setCurrentStep("demo");
      });
  };

  const handleGoHome = () => {
    setFlowData((prev) => ({
      ...initialFlowData,
      userId: prev.userId,
      email: prev.email,
      fullName: prev.fullName,
    }));
    setPreviewTemplateId(null);
    setCurrentStep("landing");
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  const handleEditInvitation = async (invitationId: string) => {
    try {
      const res = await fetch(`/api/invitations/${invitationId}`);
      if (!res.ok) {
        toast.error("Failed to fetch invitation details.");
        return;
      }
      const { invitation } = await res.json();
      if (invitation) {
        updateFlowData({
          invitationId: invitation.id,
          selectedTemplateId: invitation.template_id,
          partner1Name: invitation.partner1_name,
          partner2Name: invitation.partner2_name,
          venue: invitation.venue,
          venueAddress: invitation.venue_address,
          welcomeMessage: invitation.welcome_message,
          backgroundMusic: invitation.background_music,
          dressCodeWomen: invitation.dress_code_women,
          dressCodeMen: invitation.dress_code_men,
          transportation: invitation.transportation,
          accommodation: invitation.accommodation,
          gifts: invitation.gifts,
          heroImage: invitation.hero_image_url,
          slideshowImages: invitation.slideshow_image_urls || [],
          youtubeVideoId: invitation.youtube_video_id ?? "",
          guestLinksQuota: invitation.guest_links_quota ?? 0,
          showBismillah: invitation.show_bismillah ?? true,
          showQuranVerse: invitation.show_quran_verse ?? true,
          hostBrideFamily: invitation.host_bride_family ?? "",
          hostGroomFamily: invitation.host_groom_family ?? "",
          hostBrideCity: invitation.host_bride_city ?? "",
          hostGroomCity: invitation.host_groom_city ?? "",
          contactPhone: invitation.contact_phone ?? "",
          isSegregated: invitation.is_segregated ?? false,
          venueDetailsSegregated: invitation.venue_details_segregated ?? "",
          showNikahRegistration: invitation.show_nikah_registration ?? false,
          events: (invitation.events || []).sort(
            (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
          ).map((e: { name: string; date: string; time: string; venue?: string }) => ({
            name: e.name, date: e.date, time: e.time, venue: e.venue,
          })),
          selectedPlan: invitation.plan,
          paymentDone: invitation.is_active,
        });
        setStepBeforeDetails("dashboard");
        setCurrentStep("details");
      }
    } catch (err) {
      console.error("Edit fetch error:", err);
      toast.error("Error loading invitation.");
    }
  };

  const handleUpgradeInvitation = async (invitationId: string) => {
    try {
      const res = await fetch(`/api/invitations/${invitationId}`);
      if (!res.ok) {
        toast.error("Failed to fetch invitation details.");
        return;
      }
      const { invitation } = await res.json();
      if (invitation) {
        updateFlowData({
          invitationId: invitation.id,
          selectedTemplateId: invitation.template_id,
          partner1Name: invitation.partner1_name,
          partner2Name: invitation.partner2_name,
          venue: invitation.venue,
          venueAddress: invitation.venue_address,
          welcomeMessage: invitation.welcome_message,
          backgroundMusic: invitation.background_music,
          dressCodeWomen: invitation.dress_code_women,
          dressCodeMen: invitation.dress_code_men,
          transportation: invitation.transportation,
          accommodation: invitation.accommodation,
          gifts: invitation.gifts,
          heroImage: invitation.hero_image_url,
          slideshowImages: invitation.slideshow_image_urls || [],
          youtubeVideoId: invitation.youtube_video_id ?? "",
          guestLinksQuota: invitation.guest_links_quota ?? 0,
          showBismillah: invitation.show_bismillah ?? true,
          showQuranVerse: invitation.show_quran_verse ?? true,
          hostBrideFamily: invitation.host_bride_family ?? "",
          hostGroomFamily: invitation.host_groom_family ?? "",
          hostBrideCity: invitation.host_bride_city ?? "",
          hostGroomCity: invitation.host_groom_city ?? "",
          contactPhone: invitation.contact_phone ?? "",
          isSegregated: invitation.is_segregated ?? false,
          venueDetailsSegregated: invitation.venue_details_segregated ?? "",
          showNikahRegistration: invitation.show_nikah_registration ?? false,
          events: (invitation.events || []).sort(
            (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
          ).map((e: { name: string; date: string; time: string; venue?: string }) => ({
            name: e.name, date: e.date, time: e.time, venue: e.venue,
          })),
          selectedPlan: "royal",
          paymentDone: false,
        });
        setStepBeforeDetails("dashboard");
        setCurrentStep("details");
        toast.success("Initiated upgrade to Royal Plan. Update details and continue to checkout.");
      }
    } catch (err) {
      console.error("Upgrade fetch error:", err);
      toast.error("Error loading invitation.");
    }
  };
  
  const handleBuyMoreLinks = async (invitationId: string) => {
    try {
      const res = await fetch(`/api/invitations/${invitationId}`);
      if (!res.ok) {
        toast.error("Failed to fetch invitation details.");
        return;
      }
      const { invitation } = await res.json();
      if (invitation) {
        updateFlowData({
          invitationId: invitation.id,
          selectedTemplateId: invitation.template_id,
          partner1Name: invitation.partner1_name ?? "",
          partner2Name: invitation.partner2_name ?? "",
          venue: invitation.venue ?? "",
          venueAddress: invitation.venue_address ?? "",
          welcomeMessage: invitation.welcome_message ?? "",
          backgroundMusic: invitation.background_music ?? "no-music",
          dressCodeWomen: invitation.dress_code_women ?? "",
          dressCodeMen: invitation.dress_code_men ?? "",
          transportation: invitation.transportation ?? "",
          accommodation: invitation.accommodation ?? "",
          gifts: invitation.gifts ?? "",
          heroImage: invitation.hero_image_url ?? "",
          slideshowImages: invitation.slideshow_image_urls ?? [],
          youtubeVideoId: invitation.youtube_video_id ?? "",
          guestLinksQuota: invitation.guest_links_quota ?? 0,
          showBismillah: invitation.show_bismillah ?? true,
          showQuranVerse: invitation.show_quran_verse ?? true,
          hostBrideFamily: invitation.host_bride_family ?? "",
          hostGroomFamily: invitation.host_groom_family ?? "",
          hostBrideCity: invitation.host_bride_city ?? "",
          hostGroomCity: invitation.host_groom_city ?? "",
          contactPhone: invitation.contact_phone ?? "",
          isSegregated: invitation.is_segregated ?? false,
          venueDetailsSegregated: invitation.venue_details_segregated ?? "",
          showNikahRegistration: invitation.show_nikah_registration ?? false,
          originalGuestLinksQuota: invitation.guest_links_quota ?? 0,
          events: ((invitation.events as { name: string; date: string; time: string; venue?: string; order_index: number }[]) || [])
            .sort((a, b) => a.order_index - b.order_index)
            .map((e) => ({ name: e.name, date: e.date, time: e.time, venue: e.venue })),
          selectedPlan: invitation.plan,
          paymentDone: true, // We are editing/upgrading a paid invitation, but buying an add-on
          slug: invitation.slug ?? "",
        });
        setStepBeforeDetails("dashboard");
        setCurrentStep("payment");
      }
    } catch (err) {
      console.error("Buy more links fetch error:", err);
      toast.error("Error loading invitation.");
    }
  };

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Sign out error:", e);
    }
    localStorage.removeItem("shaadilink_pending_flow_data");
    localStorage.removeItem("shaadilink_oauth_in_progress");
    setFlowData(initialFlowData);
    setPreviewTemplateId(null);
    setCurrentStep("landing");
    toast.success("Signed out successfully. 👋");
  };

  const handleCreateNew = () => {
    localStorage.removeItem("shaadilink_pending_flow_data");
    localStorage.removeItem("shaadilink_oauth_in_progress");
    // Reset invitation-specific fields, keep user identity
    setFlowData((prev) => ({
      ...JSON.parse(JSON.stringify(initialFlowData)),
      userId: prev.userId,
      email: prev.email,
      fullName: prev.fullName,
    }));
    setCurrentStep("templates");
  };

  const handleBackToLanding = () => setCurrentStep("landing");
  const handleLoginClick = () => setCurrentStep("login");
  const handleGoToSignup = () => setCurrentStep("signup");

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const goToTemplates = () => {
    updateFlowData({ selectedPlan: null });
    setCurrentStep("templates");
  };

  const goToDemo = (templateId?: string) => {
    setDemoSourceStep(currentStep);
    const themeToUse = templateId || flowData.selectedTemplateId || "emerald-noir";
    setPreviewTemplateId(themeToUse);
    setCurrentStepInternal("demo");
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("step", "demo");
      url.searchParams.set("theme", themeToUse);
      window.history.pushState({ step: "demo" }, "", url.pathname + url.search);
    }
  };

  const goToAbout = () => setCurrentStep("about");
  const goToContact = () => setCurrentStep("contact");
  const goToAffiliate = () => setCurrentStep("affiliate");
  const goToLegal = (type: "terms" | "privacy" | "refund" | "shipping") => setCurrentStep(type as FlowStep);

  if (isLoadingParams) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatePresence mode="wait">
        {/* ── Demo / Invitation Viewer ── */}
        {currentStep === "demo" && (
          <m.div
            key="demo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative flex-1"
          >
            <div className="fixed top-4 left-4 z-[200]">
              <Button
                onClick={() => {
                  if (demoSourceStep) {
                    const src = demoSourceStep;
                    setDemoSourceStep(null);
                    setCurrentStep(src);
                  } else if (flowData.paymentDone) {
                    setCurrentStep("success");
                  } else if (flowData.invitationId) {
                    setCurrentStep("dashboard");
                  } else if (previewTemplateId) {
                    setPreviewTemplateId(null);
                    setCurrentStep("templates");
                  } else {
                    setCurrentStep("landing");
                  }
                }}
                className="backdrop-blur-md gap-2 font-display px-4 py-2 transition-all duration-300"
                style={{
                  backgroundColor: `${getTheme(previewTemplateId || flowData.selectedTemplateId).bgPrimary}e6`,
                  color: getTheme(previewTemplateId || flowData.selectedTemplateId).accentLight,
                  border: `1px solid ${getTheme(previewTemplateId || flowData.selectedTemplateId).borderAccent}`,
                }}
                size="sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </div>
            <InvitationViewer
              templateId={previewTemplateId || flowData.selectedTemplateId || undefined}
              flowData={(demoSourceStep === "landing" || demoSourceStep === "templates") ? initialFlowData : flowData}
            />
          </m.div>
        )}

        {/* ── Templates ── */}
        {currentStep === "templates" && (
          <InfoPageWrapper stepKey="templates">
            <TemplatesPage
              selectedPlan={flowData.selectedPlan}
              onBack={handleBackToLanding}
              onPreview={(templateId) => goToDemo(templateId)}
              onSelectTemplate={handleSelectTemplate}
              crumbs={[
                { label: "Home", onClick: handleGoHome },
                ...(flowData.userId ? [{ label: "Dashboard", onClick: handleGoToDashboard }] : []),
                { label: "Choose Your Template" },
              ]}
            />
          </InfoPageWrapper>
        )}

        {/* ── Signup ── */}
        {currentStep === "signup" && (
          <InfoPageWrapper stepKey="signup">
            <SignupPage
              flowData={flowData}
              onUpdateData={updateFlowData}
              onBack={() => setCurrentStep("templates")}
              onContinue={handleSignupComplete}
              onLogin={handleLoginClick}
              crumbs={[
                { label: "Home", onClick: handleGoHome },
                ...(flowData.userId ? [{ label: "Dashboard", onClick: handleGoToDashboard }] : []),
                { label: "Templates", onClick: () => setCurrentStep("templates") },
                { label: "Create Account" },
              ]}
            />
          </InfoPageWrapper>
        )}

        {/* ── Login ── */}
        {currentStep === "login" && (
          <InfoPageWrapper stepKey="login">
            <LoginPage
              onBack={handleBackToLanding}
              onLogin={handleLoginComplete}
              onSignup={handleGoToSignup}
              crumbs={[
                { label: "Home", onClick: handleGoHome },
                { label: "Log In" },
              ]}
            />
          </InfoPageWrapper>
        )}

        {/* ── Details ── */}
        {currentStep === "details" && (
          <InfoPageWrapper stepKey="details">
            <DetailsPage
              flowData={flowData}
              onUpdateData={updateFlowData}
              onBack={() => setCurrentStep(stepBeforeDetails)}
              onContinue={handleDetailsComplete}
              crumbs={
                stepBeforeDetails === "dashboard"
                  ? [
                      { label: "Home", onClick: handleGoHome },
                      { label: "Dashboard", onClick: handleGoToDashboard },
                      { label: "Edit Invitation" },
                    ]
                  : [
                      { label: "Home", onClick: handleGoHome },
                      ...(flowData.userId ? [{ label: "Dashboard", onClick: handleGoToDashboard }] : []),
                      { label: "Templates", onClick: () => setCurrentStep("templates") },
                      { label: "Details" },
                    ]
              }
            />
          </InfoPageWrapper>
        )}

        {/* ── Payment ── */}
        {currentStep === "payment" && (
          <InfoPageWrapper stepKey="payment">
            <PaymentPage
              flowData={flowData}
              onUpdateData={updateFlowData}
              onBack={() => setCurrentStep("details")}
              onContinue={handlePaymentComplete}
              crumbs={
                stepBeforeDetails === "dashboard"
                  ? [
                      { label: "Home", onClick: handleGoHome },
                      { label: "Dashboard", onClick: handleGoToDashboard },
                      { label: "Edit Invitation", onClick: () => setCurrentStep("details") },
                      { label: "Complete Payment" },
                    ]
                  : [
                      { label: "Home", onClick: handleGoHome },
                      ...(flowData.userId ? [{ label: "Dashboard", onClick: handleGoToDashboard }] : []),
                      { label: "Templates", onClick: () => setCurrentStep("templates") },
                      { label: "Details", onClick: () => setCurrentStep("details") },
                      { label: "Complete Payment" },
                    ]
              }
            />
          </InfoPageWrapper>
        )}


        {/* ── Success ── */}
        {currentStep === "success" && (
          <InfoPageWrapper stepKey="success">
            <SuccessPage
              flowData={flowData}
              onViewInvitation={handleViewInvitation}
              onGoToDashboard={handleGoToDashboard}
              crumbs={[
                { label: "Home", onClick: handleGoHome },
                { label: "Dashboard", onClick: handleGoToDashboard },
                { label: "Invitation Ready! 🎉" },
              ]}
            />
          </InfoPageWrapper>
        )}

        {/* ── Dashboard ── */}
        {currentStep === "dashboard" && (
          <InfoPageWrapper stepKey="dashboard">
            <DashboardPage
              flowData={flowData}
              onCreateNew={handleCreateNew}
              onViewInvitation={handleViewInvitationById}
              onEditInvitation={handleEditInvitation}
              onSignOut={handleSignOut}
              onUpgradeInvitation={handleUpgradeInvitation}
              onBuyMoreLinks={handleBuyMoreLinks}
              onGoHome={handleBackToLanding}
            />
          </InfoPageWrapper>
        )}

        {/* ── Static pages ── */}
        {currentStep === "about" && (
          <InfoPageWrapper stepKey="about">
            <AboutPage onBack={handleBackToLanding} />
          </InfoPageWrapper>
        )}
        {currentStep === "contact" && (
          <InfoPageWrapper stepKey="contact">
            <ContactPage onBack={handleBackToLanding} />
          </InfoPageWrapper>
        )}
        {currentStep === "affiliate" && (
          <InfoPageWrapper stepKey="affiliate">
            <AffiliatePage onBack={handleBackToLanding} />
          </InfoPageWrapper>
        )}
        {(currentStep === "terms" || currentStep === "privacy" || currentStep === "refund" || currentStep === "shipping") && (
          <InfoPageWrapper stepKey={currentStep}>
            <LegalPage type={currentStep} onBack={handleBackToLanding} />
          </InfoPageWrapper>
        )}

        {/* ── Landing ── */}
        {currentStep === "landing" && (
          <m.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col min-h-screen"
          >
            <Navbar
              onTemplatesClick={goToTemplates}
              onGetStarted={scrollToPricing}
              onLoginClick={handleLoginClick}
              onAboutClick={goToAbout}
              onContactClick={goToContact}
              isLoggedIn={!!flowData.userId}
              onDashboardClick={handleGoToDashboard}
              userEmail={flowData.email}
              userFullName={flowData.fullName}
              onSignOut={handleSignOut}
            />
            <main id="main-content" className="flex-1">
              <Hero
                onViewTemplates={goToTemplates}
                onGetStarted={scrollToPricing}
                onViewDemo={() => goToDemo("emerald-noir")}
              />
              {/* Prominent App Purpose & Google OAuth Sync Explanation Section */}
              <AppPurposeSection />
              <Features />
              <TemplateShowcase onViewAllClick={goToTemplates} />
              <HowItWorks />
              <Comparison />
              <Testimonials />
              <Pricing onSelectPlan={handleGetStarted} />
              <FAQ onContactClick={goToContact} />
              <CTASection onGetStarted={scrollToPricing} />

              {/* Google OAuth Disclosure Details Element */}
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
              onTemplatesClick={goToTemplates}
              onAboutClick={goToAbout}
              onContactClick={goToContact}
              onLegalClick={goToLegal}
              onAffiliateClick={goToAffiliate}
            />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <HomeInner />
    </Suspense>
  );
}
