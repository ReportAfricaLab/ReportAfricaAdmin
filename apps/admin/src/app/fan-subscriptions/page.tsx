'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';

export default function FanSubscriptionsPage() {
  const [pools, setPools] = useState<any>(null);

  useEffect(() => {
    adminAPI.getPools().then(setPools).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">⭐ Fan Subscriptions</h1>
      <p className="text-sm text-gray-400 mb-6">Overview of reporter fan subscription revenue and pool balances</p>

      {/* Pool Balances */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-xs text-gray-400">Ad Revenue Pool</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{pools?.ad_revenue != null ? Number(pools.ad_revenue).toLocaleString() : '—'}</p>
          <p className="text-[10px] text-gray-500 mt-1">20% of fan sub revenue flows here</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-xs text-gray-400">Breaking News Pool</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{pools?.breaking_news != null ? Number(pools.breaking_news).toLocaleString() : '—'}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-xs text-gray-400">Trust Bonus Pool</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{pools?.trust_bonus != null ? Number(pools.trust_bonus).toLocaleString() : '—'}</p>
        </div>
      </div>

      {/* Tier Info */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
        <h2 className="font-semibold mb-4">Subscription Tiers</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-200">Basic Tier</span>
              <span className="text-xs text-gray-400">$1/mo</span>
            </div>
            <p className="text-xs text-gray-400">Reporter earns <span className="text-emerald-400 font-semibold">80%</span> · Platform takes 20% → ad_revenue pool</p>
          </div>
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-200">Premium Tier</span>
              <span className="text-xs text-gray-400">$3/mo</span>
            </div>
            <p className="text-xs text-gray-400">Reporter earns <span className="text-amber-400 font-semibold">80%</span> · Platform takes 20% → ad_revenue pool</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h2 className="font-semibold mb-2">Note</h2>
        <p className="text-sm text-gray-400">Per-reporter subscriber counts and revenue breakdowns require a dedicated admin stats endpoint. Currently available: pool balances above reflect cumulative platform revenue from all fan subscriptions. Individual reporter subscriber data is visible on each reporter’s profile page.</p>
      </div>
    </div>
  );
}
