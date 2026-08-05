'use client';

import dynamic from 'next/dynamic';

export const RevenueChart = dynamic(() => import('./revenue-chart').then(mod => mod.RevenueChart), { ssr: false });
