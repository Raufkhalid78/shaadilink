'use client';

import dynamic from 'next/dynamic';

export const RevenueChart = dynamic(() => import('./revenue-chart').then(mod => mod.RevenueChart), { ssr: false });
export const OrdersChart = dynamic(() => import('./orders-chart').then(mod => mod.OrdersChart), { ssr: false });
