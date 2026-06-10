"use client";

import { useState, useEffect, useCallback } from "react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
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
import { ArrowLeft, Eye, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { FlowData, FlowStep } from "@/lib/flow-types";
import { initialFlowData } from "@/lib/flow-types";
import { getTheme } from "@/components/viewer/invitation-viewer";
import { createClient } from "@/lib/supabase/client";

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

export default function Home() {
  const [currentStep, setCurrentStep] = useState<FlowStep>("landing");
  const [flowData, setFlowData] = useState<FlowData>(initialFlowData);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  // Track previous step so Details → Back works correctly
  const [stepBeforeDetails, setStepBeforeDetails] = useState<FlowStep>("signup");
  useScrollReveal();

  // Restore session on mount — if user is already logged in, pre-populate email/userId
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setFlowData((prev) => ({
          ...prev,
          userId: session.user.id,
          email: session.user.email ?? prev.email,
          fullName: session.user.user_metadata?.full_name ?? prev.fullName,
        }));
      }
    });
  }, []);

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
    setStepBeforeDetails("signup");
    setCurrentStep("details");
  };

  const handleLoginComplete = (userId: string, email: string) => {
    updateFlowData({ userId, email });
    // If a template was already selected, go to details; otherwise go to dashboard
    if (flowData.selectedTemplateId) {
      setStepBeforeDetails("login");
      setCurrentStep("details");
    } else {
      setCurrentStep("dashboard");
    }
  };

  const handleDetailsComplete = () => {
    setCurrentStep("payment");
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
    setCurrentStep("dashboard");
  };

  const handleSignOut = () => {
    setFlowData(initialFlowData);
    setPreviewTemplateId(null);
    setCurrentStep("landing");
  };

  const handleCreateNew = () => {
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
  // Removed "shipping" — irrelevant for a digital product
  const goToLegal = (type: "terms" | "privacy" | "refund") => setCurrentStep(type);

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
              onSignOut={handleSignOut}
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
        {(currentStep === "terms" || currentStep === "privacy" || currentStep === "refund") && (
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
            />
            <main className="flex-1">
              <Hero onViewTemplates={goToTemplates} onGetStarted={scrollToPricing} />
              <StatsBar />
              <Features />
              <TemplateShowcase />
              <HowItWorks />
              <Comparison />
              <Testimonials />
              <Pricing onSelectPlan={handleGetStarted} />
              <FAQ />

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
