'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';

const POOL_LABELS: Record<string, string> = {
  breaking_news: '🔴 Breaking News',
  ad_revenue: '📊 Ad Revenue',
  assignment_desk: '📋 Assignment Desk',
  trust_bonus: '🛡️ Trust Bonus',
  referral: '🎁 Referral',
};

export default function RevenuePage() {
  const [data, setData] = useState<any>(null);
  const [pools, setPools] = useState<any>(null);
  const [distributing, setDistributing] = useState(false);
  const [runningBonus, setRunningBonus] = useState(false);
  const [message, setMessage] = useState('');

  const notify = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(''), 5000); };

  useEffect(() => {
    adminAPI.revenue().then(setData).catch(() => {});
    adminAPI.getPools().then(setPools).catch(() => {});
  }, []);

  const handleDistribute = async () => {
    if (!confirm('Run ad revenue distribution for all countries now?')) return;
    setDistributing(true);
    try { await adminAPI.distributeAdRevenue(); notify('✅ Ad revenue distribution triggered'); }
    catch (e: any) { notify('❌ ' + (e.message || 'Failed')); }
    setDistributing(false);
    adminAPI.getPools().then(setPools).catch(() => {});
  };

  const handleTrustBonus = async () => {
    if (!confirm('Run monthly trust bonus for all certified reporters now?')) return;
    setRunningBonus(true);
    try { await adminAPI.runTrustBonus(); notify('✅ Trust bonus run triggered'); }
    catch (e: any) { notify('❌ ' + (e.message || 'Failed')); }
    setRunningBonus(false);
    adminAPI.getPools().then(setPools).catch(() => {});
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Platform Revenue</h1>

      {message && <div className="mb-4 p-3 rounded-lg bg-gray-800 border border-gray-700 text-sm">{message}</div>}

      {/* Media Licensing Revenue */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-sm text-gray-400">Total Licenses</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{data?.totalLicenses || 0}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-sm text-gray-400">Pending Licenses</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{data?.pendingLicenses || 0}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-sm text-gray-400">Revenue Split</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">50/50</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
        <h2 className="font-semibold mb-4">Revenue by Currency</h2>
        {data?.platformRevenue?.length > 0 ? (
          <div className="space-y-3">
            {data.platformRevenue.map((r: any) => (
              <div key={r.currency} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                <span className="font-medium">{r.currency}</span>
                <div className="text-right">
                  <p className="text-emerald-400 font-semibold">Platform: {r.currency} {Number(r.platformEarned).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">Reporters paid: {r.currency} {Number(r.reportersPaid).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No revenue data yet. Revenue is generated from media licensing (50/50 split via Kora Pay).</p>
        )}
      </div>

      {/* Earnings Pools */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Earnings Pools</h2>
          <div className="flex gap-2">
            <button onClick={handleDistribute} disabled={distributing}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-500 disabled:opacity-50">
              {distributing ? 'Running...' : '📊 Distribute Ad Revenue'}
            </button>
            <button onClick={handleTrustBonus} disabled={runningBonus}
              className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-500 disabled:opacity-50">
              {runningBonus ? 'Running...' : '🛡️ Run Trust Bonus'}
            </button>
          </div>
        </div>
        {pools ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(pools).map(([key, balance]) => (
              <div key={key} className="bg-gray-900 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">{POOL_LABELS[key] || key}</p>
                <p className="text-lg font-bold text-amber-400">{Number(balance).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Loading pool balances...</p>
        )}
        <p className="text-xs text-gray-600 mt-3">Pool balances are in the platform base currency. Ad revenue distributes weekly (Mon 09:00 UTC). Trust bonus runs monthly (1st of month).</p>
      </div>
    </div>
  );
}
