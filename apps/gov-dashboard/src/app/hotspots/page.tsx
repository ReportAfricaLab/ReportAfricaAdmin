'use client';
import { useState, useEffect } from 'react';
import { govAPI } from '@/lib/api';

export default function HotspotsPage() {
  const [data, setData] = useState<any[]>([]);
  const [country, setCountry] = useState('NG');

  useEffect(() => { govAPI.hotspots(country).then((d: any) => setData(Array.isArray(d) ? d : d.data || [])).catch(() => {}); }, [country]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🔥 Hotspot Areas</h1>
        <select value={country} onChange={(e) => setCountry(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none">
          <option value="NG">Nigeria</option><option value="GH">Ghana</option><option value="KE">Kenya</option><option value="ZA">South Africa</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {data.map((h: any, i: number) => (
          <div key={i} className="bg-[#1E293B] rounded-xl p-5 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-100">{h.state || h.city || 'Unknown'}</h3>
              <span className="text-xs px-2 py-0.5 bg-red-600/20 text-red-400 rounded capitalize">{h.category?.replace('_', ' ') || h.type}</span>
            </div>
            <p className="text-3xl font-bold text-orange-400">{h.count || h.reportCount || 0}</p>
            <p className="text-xs text-gray-500">reports</p>
          </div>
        ))}
        {data.length === 0 && <p className="text-gray-500 text-center py-12 col-span-2">No hotspots detected</p>}
      </div>
    </div>
  );
}
