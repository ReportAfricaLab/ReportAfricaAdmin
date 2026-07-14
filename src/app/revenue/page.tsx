'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';

export default function RevenuePage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { adminAPI.revenue().then(setData).catch(() => {}); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Platform Revenue</h1>

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

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
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
    </div>
  );
}
