import React from 'react';
import { Sparkles } from 'lucide-react';

export default function InvitationLoading() {
  return (
    <div className="min-h-screen bg-[#080B10] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden select-none">
      {/* Subtle Ambient Radial Gold Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 45%, rgba(201, 168, 76, 0.12) 0%, transparent 65%)',
        }}
      />

      {/* Luxury Loading Card */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full space-y-6">
        {/* Animated Gold Crest */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full border border-amber-500/20 animate-ping opacity-30" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-transparent border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(201,168,76,0.25)] backdrop-blur-md">
            <Sparkles className="w-7 h-7 animate-pulse text-amber-300" />
          </div>
        </div>

        {/* Title & Status */}
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.3em] font-semibold text-amber-400/80">
            ✦  Smart Invites  ✦
          </p>
          <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-white">
            Opening Invitation
          </h2>
          <p className="text-xs text-white/60 tracking-wider">
            Preparing your royal experience...
          </p>
        </div>

        {/* Shimmering Gold Progress Line */}
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden relative">
          <div
            className="absolute top-0 bottom-0 w-24 rounded-full bg-gradient-to-r from-transparent via-amber-400 to-transparent"
            style={{
              animation: 'shimmer 1.5s infinite ease-in-out',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
