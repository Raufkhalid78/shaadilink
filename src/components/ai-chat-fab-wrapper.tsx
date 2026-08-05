'use client';

import dynamic from 'next/dynamic';

export const AIChatFABWrapper = dynamic(
  () => import('@/components/ai-chat-fab').then((m) => m.AIChatFAB),
  { ssr: false }
);
