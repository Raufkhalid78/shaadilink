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
import InvitationViewer from "@/components/viewer/invitation-viewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { FlowData, FlowStep } from "@/lib/flow-types";
import { initialFlowData } from "@/lib/flow-types";

/* Wrapper for page transitions - defined outside render to avoid state reset */
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
  useScrollReveal();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [currentStep]);

  const updateFlowData = useCallback((updates: Partial<FlowData>) => {
    setFlowData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleGetStarted = (plan: "classic" | "royal") => {
    updateFlowData({ selectedPlan: plan });
    setCurrentStep("templates");
  };

  const handleSelectTemplate = (templateId: string) => {
    updateFlowData({ selectedTemplateId: templateId });
    setCurrentStep("signup");
  };

  const handleSignupComplete = () => {
    setCurrentStep("details");
  };

  const handleLoginComplete = () => {
    setCurrentStep("details");
  };

  const handleDetailsComplete = () => {
    setCurrentStep("payment");
  };

  const handlePaymentComplete = () => {
    setCurrentStep("success");
  };

  const handleViewInvitation = () => {
    setCurrentStep("demo");
  };

  const handleGoHome = () => {
    setFlowData(initialFlowData);
    setCurrentStep("landing");
  };

  const handleBackToLanding = () => {
    setCurrentStep("landing");
  };

  const handleLoginClick = () => {
    setCurrentStep("login");
  };

  const handleGoToSignup = () => {
    setCurrentStep("signup");
  };

  const handleGoToLogin = () => {
    setCurrentStep("login");
  };

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const goToTemplates = () => {
    updateFlowData({ selectedPlan: null });
    setCurrentStep("templates");
  };

  const goToDemo = () => setCurrentStep("demo");

  const goToAbout = () => setCurrentStep("about");
  const goToContact = () => setCurrentStep("contact");
  const goToAffiliate = () => setCurrentStep("affiliate");
  const goToLegal = (type: "terms" | "privacy" | "refund" | "shipping") => setCurrentStep(type);

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatePresence mode="wait">
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
                  } else {
                    setCurrentStep("landing");
                  }
                }}
                className="bg-[#0f1a16]/90 backdrop-blur-md text-gold border border-gold/40 hover:bg-[#0f1a16] hover:text-gold-light hover:border-gold/60 hover:shadow-[0_0_20px_rgba(180,145,77,0.2)] gap-2 font-display px-4 py-2 transition-all duration-300"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </div>
            <InvitationViewer />
          </motion.div>
        )}

        {currentStep === "templates" && (
          <InfoPageWrapper stepKey="templates">
            <TemplatesPage
              selectedPlan={flowData.selectedPlan}
              onBack={handleBackToLanding}
              onPreview={goToDemo}
              onSelectTemplate={handleSelectTemplate}
            />
          </InfoPageWrapper>
        )}

        {currentStep === "signup" && (
          <InfoPageWrapper stepKey="signup">
            <SignupPage
              flowData={flowData}
              onUpdateData={updateFlowData}
              onBack={() => setCurrentStep("templates")}
              onContinue={handleSignupComplete}
              onLogin={handleGoToLogin}
            />
          </InfoPageWrapper>
        )}

        {currentStep === "login" && (
          <InfoPageWrapper stepKey="login">
            <LoginPage
              onBack={handleBackToLanding}
              onLogin={handleLoginComplete}
              onSignup={handleGoToSignup}
              onForgotPassword={() => {
                alert("Password reset link sent to your email!");
              }}
            />
          </InfoPageWrapper>
        )}

        {currentStep === "details" && (
          <InfoPageWrapper stepKey="details">
            <DetailsPage
              flowData={flowData}
              onUpdateData={updateFlowData}
              onBack={() => setCurrentStep("signup")}
              onContinue={handleDetailsComplete}
            />
          </InfoPageWrapper>
        )}

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

        {currentStep === "success" && (
          <InfoPageWrapper stepKey="success">
            <SuccessPage
              flowData={flowData}
              onViewInvitation={handleViewInvitation}
              onGoHome={handleGoHome}
            />
          </InfoPageWrapper>
        )}

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
              <Hero
                onViewTemplates={goToTemplates}
                onGetStarted={scrollToPricing}
              />
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
                <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
                  <div className="flex items-center justify-center gap-4 mb-2">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold/50" />
                    <Sparkles className="w-5 h-5 text-gold" />
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold/50" />
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold">
                    See It <span className="gold-shimmer">Live</span>
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                    Experience the magic of our premium invitation viewer — from
                    the grand door-opening to the interactive scratch card,
                    countdown, and fireworks.
                  </p>
                  <Button
                    onClick={goToDemo}
                    size="lg"
                    className="bg-emerald hover:bg-emerald-dark text-primary-foreground border border-gold/40 px-8 py-6 text-lg font-display pulse-glow gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    View Live Demo
                  </Button>
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
