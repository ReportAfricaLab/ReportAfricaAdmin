'use client';
import { useState, useEffect } from 'react';
import { govAPI } from '@/lib/api';

export default function IncidentsPage() {
  const [data, setData] = useState<any[]>([]);
  const [country, setCountry] = useState('NG');

  useEffect(() => { govAPI.mapData(country).then((d: any) => setData(d.data || [])).catch(() => {}); }, [country]);

  const incidents = data.filter((r: any) => ['critical', 'high'].includes(r.severity));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">⚠️ Active Incidents</h1>
        <select value={country} onChange={(e) => setCountry(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none">
          <option value="NG">Nigeria</option><option value="GH">Ghana</option><option value="KE">Kenya</option><option value="ZA">South Africa</option>
        </select>
      </div>
      <div className="space-y-3">
        {incidents.map((r: any) => (
          <div key={r.id} className="bg-[#1E293B] rounded-xl p-5 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded text-white ${r.severity === 'critical' ? 'bg-red-600' : 'bg-orange-600'}`}>{r.severity?.toUpperCase()}</span>
              <span className="text-xs text-gray-400 capitalize">{r.category?.replace('_', ' ')}</span>
              <span className="text-xs text-gray-500 ml-auto">{new Date(r.createdAt).toLocaleString()}</span>
            </div>
            <h3 className="font-medium text-gray-100">{r.title}</h3>
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{r.description}</p>
            <p className="text-xs text-gray-500 mt-2">{r.state || r.city || ''} · {r.latitude ? `${Number(r.latitude).toFixed(3)}, ${Number(r.longitude).toFixed(3)}` : 'No coords'}</p>
          </div>
        ))}
        {incidents.length === 0 && <p className="text-gray-500 text-center py-12">No active critical/high incidents</p>}
      </div>
    </div>
  );
}
