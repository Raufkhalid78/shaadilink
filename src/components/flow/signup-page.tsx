"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Heart,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FlowData } from "@/lib/flow-types";

interface SignupPageProps {
  flowData: FlowData;
  onUpdateData: (updates: Partial<FlowData>) => void;
  onBack: () => void;
  onContinue: () => void;
  onLogin: () => void;
}

export function SignupPage({
  flowData,
  onUpdateData,
  onBack,
  onContinue,
  onLogin,
}: SignupPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!flowData.password) newErrors.password = "Password is required";
    else if (flowData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (flowData.password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onContinue();
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

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald text-primary-foreground">
                <Heart className="h-5 w-5 fill-current" />
              </div>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
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
              icon={<User className="w-4 h-4" />}
              value={flowData.fullName}
              onChange={(v) => onUpdateData({ fullName: v })}
              placeholder="Enter your full name"
              error={errors.fullName}
            />
            <FormField
              label="Email"
              icon={<Mail className="w-4 h-4" />}
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
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={flowData.password}
                  onChange={(e) => onUpdateData({ password: e.target.value })}
                  placeholder="At least 8 characters"
                  className={`pl-10 pr-10 h-11 ${
                    errors.password ? "border-red-400 focus-visible:ring-red-400" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Re-enter Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className={`pl-10 h-11 ${
                    errors.confirmPassword ? "border-red-400 focus-visible:ring-red-400" : ""
                  }`}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full h-12 bg-emerald hover:bg-emerald-dark text-primary-foreground border border-gold/30 font-semibold text-base mt-2"
            >
              Create Account
            </Button>
          </div>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <button onClick={onLogin} className="text-gold hover:text-gold-light font-semibold underline">
              Login
            </button>
          </p>
        </motion.div>
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
          className={`pl-10 h-11 ${error ? "border-red-400 focus-visible:ring-red-400" : ""}`}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
