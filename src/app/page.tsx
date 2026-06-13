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
import { TemplatesPage } from "@/components/landing/templates-page";
import { SignupPage } from "@/components/flow/signup-page";
import { LoginPage } from "@/components/flow/login-page";
import { DetailsPage } from "@/components/flow/details-page";
import { PaymentPage } from "@/components/flow/payment-page";
import { SuccessPage } from "@/components/flow/success-page";
import { AboutPage } from "@/components/flow/about-page";
import { ContactPage } from "@/components/flow/contact-page";
import { AffiliatePage } from "@/components/flow/affiliate-page";
import { LegalPage } from "@/components/flow/legal-page";
import { DashboardPage } from "@/components/flow/dashboard-page";
import InvitationViewer from "@/components/viewer/invitation-viewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Sparkles, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { FlowData, FlowStep } from "@/lib/flow-types";
import { initialFlowData } from "@/lib/flow-types";
import { getTheme } from "@/components/viewer/invitation-viewer";
import { createClient } from "@/lib/supabase/client";

/* ─── What Is ShaadiLink? Section (fulfills Google OAuth homepage purpose requirement) ─── */
function AppPurposeSection({ onGetStarted }: { onGetStarted?: () => void }) {
  const features = [
    { icon: "✨", label: "Digital Invitations", desc: "Beautiful online cards for Mehndi, Baraat & Walima" },
    { icon: "🎴", label: "Scratch Card Reveals", desc: "Interactive scratch-to-reveal wedding date cards" },
    { icon: "⏱️", label: "Live Countdown", desc: "Animated timer counting down to the wedding day" },
    { icon: "💌", label: "RSVP & Guest Wishes", desc: "Collect RSVPs and heartfelt messages from guests" },
    { icon: "🎵", label: "Background Music", desc: "Romantic music that plays when the invitation opens" },
    { icon: "🗺️", label: "Maps & Directions", desc: "Embedded Google Maps for easy venue navigation" },
  ];
  return (
    <section id="about-shaadilink" className="py-16 px-4 sm:px-6 bg-gradient-to-b from-emerald-dark/20 to-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(15,107,78,0.08) 0%, transparent 70%)' }} />
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="inline-block px-4 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase bg-gold/10 border border-gold/20 text-gold mb-4">
            What is ShaadiLink?
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Pakistan&apos;s Premier{" "}
            <span className="gold-shimmer">Digital Wedding</span> Invitation Platform
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            <strong className="text-foreground">ShaadiLink</strong> is a web application that lets Pakistani couples create, customise, and share stunning digital wedding invitations. Guests receive a unique link and experience cinematic 3D door reveals, scratch-card date reveals, live countdowns, photo galleries, and one-click RSVP — all without downloading an app.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
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
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        {onGetStarted && (
          <motion.div
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
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* Wrapper for page transitions */
function InfoPageWrapper({ children, stepKey }: { children: React.ReactNode; stepKey: string }) {
  return (
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4 }}
      className="flex-1"
    >
      {children}
    </motion.div>
  );
}

function HomeInner() {
  const [currentStep, setCurrentStep] = useState<FlowStep>("landing");
  const [flowData, setFlowData] = useState<FlowData>(initialFlowData);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  // Track previous step so Details → Back works correctly
  const [stepBeforeDetails, setStepBeforeDetails] = useState<FlowStep>("signup");
  useScrollReveal();
  const router = useRouter();

  const searchParams = useSearchParams();

  // Handle query params from /dashboard route (?start=create, ?edit=ID, ?upgrade=ID)
  useEffect(() => {
    const start = searchParams.get("start");
    const editId = searchParams.get("edit");
    const upgradeId = searchParams.get("upgrade");
    if (!start && !editId && !upgradeId) return;

    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return;
      const mergedData: FlowData = {
        ...initialFlowData,
        userId: session.user.id,
        email: session.user.email ?? "",
        fullName: session.user.user_metadata?.full_name ?? "",
      };
      setFlowData(mergedData);

      if (start === "create") {
        setCurrentStep("templates");
      } else if (editId) {
        // Load the invitation then go to details
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
                events: ((invitation.events as { name: string; date: string; time: string; venue?: string; order_index: number }[]) || [])
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((e) => ({ name: e.name, date: e.date, time: e.time, venue: e.venue })),
                selectedPlan: invitation.plan,
                paymentDone: invitation.is_active,
                showBismillah: invitation.show_bismillah ?? true,
              }));
              setStepBeforeDetails("dashboard");
              setCurrentStep("details");
            }
          });
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
                events: ((invitation.events as { name: string; date: string; time: string; venue?: string; order_index: number }[]) || [])
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((e) => ({ name: e.name, date: e.date, time: e.time, venue: e.venue })),
                selectedPlan: "royal",
                paymentDone: false,
                showBismillah: invitation.show_bismillah ?? true,
              }));
              setStepBeforeDetails("dashboard");
              setCurrentStep("details");
            }
          });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restore session and flowData on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("edit") || params.get("upgrade") || params.get("start") === "create") {
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
        setFlowData(savedData);
      }
    });
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

  const handleSelectTemplate = (templateId: string) => {
    updateFlowData({ selectedTemplateId: templateId });
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
    setPreviewTemplateId(flowData.selectedTemplateId);
    setCurrentStep("demo");
  };

  const handleViewInvitationById = (invitationId: string) => {
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
            events: (invitation.events || []).sort(
              (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
            ).map((e: { name: string; date: string; time: string; venue?: string }) => ({
              name: e.name, date: e.date, time: e.time, venue: e.venue,
            })),
            selectedPlan: invitation.plan,
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
    setFlowData(initialFlowData);
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

  const handleSignOut = () => {
    localStorage.removeItem("shaadilink_pending_flow_data");
    localStorage.removeItem("shaadilink_oauth_in_progress");
    setFlowData(initialFlowData);
    setPreviewTemplateId(null);
    setCurrentStep("landing");
  };

  const handleCreateNew = () => {
    localStorage.removeItem("shaadilink_pending_flow_data");
    localStorage.removeItem("shaadilink_oauth_in_progress");
    // Reset invitation-specific fields, keep user identity
    setFlowData((prev) => ({
      ...initialFlowData,
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
    if (templateId) setPreviewTemplateId(templateId);
    else setPreviewTemplateId(flowData.selectedTemplateId);
    setCurrentStep("demo");
  };

  const goToAbout = () => setCurrentStep("about");
  const goToContact = () => setCurrentStep("contact");
  const goToAffiliate = () => setCurrentStep("affiliate");
  const goToLegal = (type: "terms" | "privacy" | "refund" | "shipping") => setCurrentStep(type as FlowStep);

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatePresence mode="wait">
        {/* ── Demo / Invitation Viewer ── */}
        {currentStep === "demo" && (
          <motion.div
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
                  if (flowData.paymentDone) {
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
              flowData={flowData}
            />
          </motion.div>
        )}

        {/* ── Templates ── */}
        {currentStep === "templates" && (
          <InfoPageWrapper stepKey="templates">
            <TemplatesPage
              selectedPlan={flowData.selectedPlan}
              onBack={handleBackToLanding}
              onPreview={(templateId) => goToDemo(templateId)}
              onSelectTemplate={handleSelectTemplate}
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
          <motion.div
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
            />
            <main className="flex-1">
              <Hero onViewTemplates={goToTemplates} onGetStarted={scrollToPricing} />
              {/* Explicit app purpose section — satisfies Google OAuth homepage requirement */}
              <AppPurposeSection onGetStarted={scrollToPricing} />
              <StatsBar />
              <Features />
              <TemplateShowcase onViewAllClick={goToTemplates} />
              <HowItWorks />
              {/* Google OAuth & Account Purpose Statement */}
              <section className="py-6 px-4 bg-background/30 border-y border-border/30 relative overflow-hidden flex justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald/2 to-gold/2 pointer-events-none" />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="max-w-lg w-full p-4 rounded-xl border border-gold/10 bg-background/50 backdrop-blur-md relative z-10 flex gap-3 items-center shadow-md shadow-gold/2 hover:border-gold/20 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald/10 border border-emerald/20 flex items-center justify-center shrink-0">
                    <Shield className="w-4.5 h-4.5 text-emerald" />
                  </div>
                  <div className="space-y-0.5 text-left">
                    <h4 className="font-display font-semibold text-[10px] sm:text-xs text-gold uppercase tracking-wider">Secure Account Sync &amp; Purpose</h4>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed">
                      ShaadiLink uses secure Google Sign-In to authenticate couples and generate their personal dashboard. Your Google profile details (name and email) are used solely to store, publish, and allow you to edit your digital wedding invitations and moderate RSVP/guest wishes securely.
                    </p>
                  </div>
                </motion.div>
              </section>
              <Comparison />
              <Testimonials />
              <Pricing onSelectPlan={handleGetStarted} />
              <FAQ onContactClick={goToContact} />

              {/* Live Demo CTA Section */}
              <section id="live-demo" className="py-24 px-6 bg-gradient-to-b from-background to-emerald-dark/10 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04]">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="demo-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                        <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
                        <circle cx="40" cy="40" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#demo-pattern)" />
                  </svg>
                </div>
                <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
                  <div className="flex items-center justify-center gap-4 mb-2">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold/50" />
                    <Sparkles className="w-5 h-5 text-gold" />
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold/50" />
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold">
                    See It <span className="gold-shimmer">Live</span>
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                    Experience the magic — from the grand door-opening to the interactive scratch card, countdown, and fireworks.
                  </p>


                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Button
                      onClick={() => goToDemo("emerald-noir")}
                      size="lg"
                      className="bg-emerald hover:bg-emerald-dark text-primary-foreground border border-gold/40 px-8 py-6 text-lg font-display pulse-glow gap-2"
                    >
                      <Eye className="w-5 h-5" />
                      View Live Demo
                    </Button>
                    <Button
                      variant="outline"
                      onClick={goToTemplates}
                      size="lg"
                      className="border-gold/30 text-gold hover:bg-gold/10 hover:text-gold-light px-6 py-6 text-base font-display"
                    >
                      Browse All Templates
                    </Button>
                  </div>
                </div>
              </section>

              <CTASection onGetStarted={scrollToPricing} />
            </main>
            <Footer
              onTemplatesClick={goToTemplates}
              onAboutClick={goToAbout}
              onContactClick={goToContact}
              onLegalClick={goToLegal}
              onAffiliateClick={goToAffiliate}
            />
          </motion.div>
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
