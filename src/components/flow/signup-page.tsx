"use client";

import { useState } from "react";
import { m } from "framer-motion";
import {
  ArrowLeft, Eye, EyeOff, Mail, Lock, User, Heart, Check, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { FlowData } from "@/lib/flow-types";
import { createClient } from "@/lib/supabase/client";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

interface SignupPageProps {
  flowData: FlowData;
  onUpdateData: (updates: Partial<FlowData>) => void;
  onBack: () => void;
  onContinue: () => void;
  onLogin: () => void;
  crumbs: { label: string; onClick?: () => void }[];
}

export function SignupPage({
  flowData,
  onUpdateData,
  onBack,
  onContinue,
  onLogin,
  crumbs,
}: SignupPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      localStorage.setItem("shaadilink_oauth_in_progress", "true");
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) {
        toast.error(error.message);
        localStorage.removeItem("shaadilink_oauth_in_progress");
      }
    } catch (err) {
      console.error("Google signup error:", err);
      toast.error("Could not initialize Google signup.");
      localStorage.removeItem("shaadilink_oauth_in_progress");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const templateName =
    flowData.selectedTemplateId
      ?.split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || "Selected Template";

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!flowData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!flowData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(flowData.email))
      newErrors.email = "Please enter a valid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: flowData.email.trim(),
        password,
        options: {
          data: { full_name: flowData.fullName.trim() },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please log in instead.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        onUpdateData({ userId: data.user.id, email: flowData.email.trim(), fullName: flowData.fullName.trim() });
        toast.success("Account created! Welcome to ShaadiLink 🎉");
        onContinue();
      }
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with progress */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={onBack}
              className="gap-2 text-foreground/70 hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            {/* Progress indicator */}
            <div className="flex items-center gap-1.5">
              <StepDot done label="Template" />
              <StepLine active />
              <StepDot current label="Account" />
              <StepLine />
              <StepDot label="Details" />
              <StepLine />
              <StepDot label="Payment" />
            </div>

            <div className="w-16" />
          </div>
        </div>
      </header>

      {/* Breadcrumb path */}
      <PageBreadcrumb crumbs={crumbs} />

      <main id="main-content" className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background ambient elements */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md glass-card-strong p-8 sm:p-10 rounded-2xl relative overflow-hidden shadow-2xl border border-emerald/10"
        >
          {/* Card ambient glows */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald/15 blur-[60px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gold/5 blur-[60px] rounded-full pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Brand */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald to-emerald-dark text-primary-foreground shadow-lg shadow-emerald/20 border border-emerald/30">
                  <Heart className="h-5 w-5 fill-current text-gold animate-pulse" />
                </div>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Create Your Account
              </h1>
              <p className="mt-2 text-muted-foreground text-sm">
                Sign up to get started with your{" "}
                <span className="text-gold font-semibold">{templateName}</span>{" "}
                invitation
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <FormField
                label="Full Name"
                icon={<User className="w-4 h-4 text-emerald" />}
                value={flowData.fullName}
                onChange={(v) => onUpdateData({ fullName: v })}
                placeholder="Enter your full name"
                error={errors.fullName}
              />
              <FormField
                label="Email"
                icon={<Mail className="w-4 h-4 text-emerald" />}
                type="email"
                value={flowData.email}
                onChange={(v) => onUpdateData({ email: v })}
                placeholder="you@example.com"
                error={errors.email}
              />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className={`pl-10 pr-10 h-11 bg-background/50 border-emerald/20 focus-visible:ring-emerald ${
                      errors.password ? "border-red-500/50 focus-visible:ring-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Re-enter Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className={`pl-10 h-11 bg-background/50 border-emerald/20 focus-visible:ring-emerald ${
                      errors.confirmPassword ? "border-red-500/50 focus-visible:ring-red-500" : ""
                    }`}
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full h-12 bg-emerald hover:bg-emerald-dark text-primary-foreground border border-gold/30 font-semibold text-base mt-2 shadow-lg shadow-emerald/20 transition-all hover:scale-[1.01]"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating Account...</>
                ) : (
                  "Create Account"
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-emerald/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase z-10">
                  <span className="bg-background/90 px-3 text-muted-foreground/80 backdrop-blur-xl rounded-full border border-emerald/10 py-0.5">
                    or
                  </span>
                </div>
              </div>

              {/* Google Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignup}
                disabled={isLoading || isGoogleLoading}
                className="w-full h-12 bg-background/40 hover:bg-background/80 border border-emerald/20 hover:border-gold/30 text-foreground font-semibold text-base shadow-md transition-all hover:scale-[1.01] flex items-center justify-center gap-3"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.53 14.98 1 12 1 7.35 1 3.37 3.67 1.38 7.56l3.85 2.99c.9-2.7 3.42-4.51 6.77-4.51z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.99 3.7-8.62z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.23 14.45c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.38 6.88C.5 8.65 0 10.62 0 12.72s.5 4.07 1.38 5.84l3.85-2.99c-.9-2.7-3.42-4.51-6.77-4.51z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.1.74-2.5 1.18-4.23 1.18-3.35 0-5.88-2.19-6.78-4.9l-3.84 2.99C3.37 20.33 7.35 23 12 23z"
                    />
                  </svg>
                )}
                Continue with Google
              </Button>
            </div>

            <p className="text-center mt-6 text-sm text-muted-foreground">
              Already have an account?{" "}
              <button onClick={onLogin} className="text-gold hover:text-gold-light font-semibold underline transition-colors">
                Login
              </button>
            </p>
          </div>
        </m.div>
      </main>
    </div>
  );
}

/* ---------- Helper Components ---------- */
function StepDot({ done, current, label }: { done?: boolean; current?: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div
        className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
          done
            ? "bg-gold text-emerald-dark"
            : current
            ? "bg-emerald text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? <Check className="w-3 h-3" /> : current ? "2" : ""}
      </div>
      <span className={`text-xs hidden sm:inline ${current ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );
}

function StepLine({ active }: { active?: boolean }) {
  return <div className={`w-4 sm:w-6 h-px ${active ? "bg-gold/30" : "bg-border"}`} />;
}

function FormField({
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  icon: React.ReactNode;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pl-10 h-11 bg-background/50 border-emerald/20 focus-visible:ring-emerald ${error ? "border-red-500/50 focus-visible:ring-red-500" : ""}`}
        />
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
