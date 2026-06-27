'use client';
import { useState, useEffect } from 'react';
import { govAPI } from '@/lib/api';

export default function TrendsPage() {
  const [data, setData] = useState<any>(null);
  const [country, setCountry] = useState('NG');

  useEffect(() => { govAPI.trending(country).then(setData).catch(() => {}); }, [country]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📈 Trends</h1>
        <select value={country} onChange={(e) => setCountry(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none">
          <option value="NG">Nigeria</option><option value="GH">Ghana</option><option value="KE">Kenya</option><option value="ZA">South Africa</option>
        </select>
      </div>
      <p className="text-sm text-gray-400 mb-6">Trending reports and patterns</p>

      <div className="space-y-3">
        {data?.trending?.map((r: any, i: number) => (
          <div key={r.id || i} className="bg-[#1E293B] rounded-xl p-5 border border-gray-700 flex items-center gap-4">
            <span className="text-lg font-bold text-gray-500 w-8">#{i + 1}</span>
            <div className="flex-1">
              <h3 className="font-medium text-gray-100">{r.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{r.category} · {r.severity} · ↑{r.upvotes} · 💬{r.commentCount}</p>
            </div>
            <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
        {(!data?.trending || data.trending.length === 0) && <p className="text-gray-500 text-center py-12">No trending data available</p>}
      </div>
    </div>
  );
}
