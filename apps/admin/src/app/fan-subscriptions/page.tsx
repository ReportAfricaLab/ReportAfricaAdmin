'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';

export default function FanSubscriptionsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.fanSubStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">⭐ Fan Subscriptions</h1>
      <p className="text-sm text-gray-400 mb-6">Overview of reporter fan subscription revenue</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-xs text-gray-400">Active Subscriptions</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{stats?.totalActive ?? '—'}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-xs text-gray-400">Total Revenue</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">
            {stats?.totalRevenue != null ? Number(stats.totalRevenue).toLocaleString() : '—'}
          </p>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-xs text-gray-400">Platform Cut (20%)</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">
            {stats?.platformCut != null ? Number(stats.platformCut).toLocaleString() : '—'}
          </p>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-xs text-gray-400">Basic / Premium</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">
            {stats ? `${stats.basicCount} / ${stats.premiumCount}` : '—'}
          </p>
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

      {/* Top Reporters Table */}
      {!loading && stats?.topReporters?.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-700">
            <h2 className="font-semibold">Top Reporters by Subscribers</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr className="text-left text-gray-400">
                <th className="px-4 py-3">Reporter</th>
                <th className="px-4 py-3">Subscribers</th>
                <th className="px-4 py-3">Basic</th>
                <th className="px-4 py-3">Premium</th>
                <th className="px-4 py-3">Monthly Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {stats.topReporters.map((r: any) => (
                <tr key={r.reporterId} className="hover:bg-gray-750">
                  <td className="px-4 py-3 font-medium">{r.displayName || r.username || r.reporterId?.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-emerald-400 font-semibold">{r.totalSubscribers}</td>
                  <td className="px-4 py-3 text-gray-400">{r.basicCount}</td>
                  <td className="px-4 py-3 text-gray-400">{r.premiumCount}</td>
                  <td className="px-4 py-3 text-amber-400">{r.currency} {Number(r.monthlyRevenue).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && (!stats || stats.totalActive === 0) && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-10 text-center">
          <p className="text-gray-500">No fan subscriptions yet</p>
          <p className="text-xs text-gray-600 mt-1">Data appears once reporters have active subscribers</p>
        </div>
      )}
    </div>
  );
}
