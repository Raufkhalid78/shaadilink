"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginPageProps {
  onBack: () => void;
  onLogin: () => void;
  onSignup: () => void;
  onForgotPassword: () => void;
}

export function LoginPage({
  onBack,
  onLogin,
  onSignup,
  onForgotPassword,
}: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Please enter a valid email";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
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

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald text-primary-foreground">
                <Heart className="h-4 w-4 fill-current" />
              </div>
              <span className="font-display text-lg font-bold">
                Shaadi<span className="text-gold">Link</span>
              </span>
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
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald text-primary-foreground">
                <Heart className="h-6 w-6 fill-current" />
              </div>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Welcome Back
            </h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Login to manage your wedding invitations
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`pl-10 h-11 ${
                    errors.email ? "border-red-400 focus-visible:ring-red-400" : ""
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                onClick={onForgotPassword}
                className="text-xs text-gold hover:text-gold-light font-medium"
              >
                Forgot password?
              </button>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full h-12 bg-emerald hover:bg-emerald-dark text-primary-foreground border border-gold/30 font-semibold text-base mt-2"
            >
              Login
            </Button>
          </div>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <button onClick={onSignup} className="text-gold hover:text-gold-light font-semibold underline">
              Sign up
            </button>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
