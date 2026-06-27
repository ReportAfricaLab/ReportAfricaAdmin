'use client';
import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.reportafrica.africa/api/v1';

export default function EmergenciesPage() {
  const [data, setData] = useState<any[]>([]);
  const [country, setCountry] = useState('NG');

  useEffect(() => {
    fetch(`${API_URL}/emergency/active?country=${country}`).then(r => r.json()).then(d => setData(Array.isArray(d) ? d : [])).catch(() => {});
  }, [country]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🚨 Active Emergencies</h1>
        <select value={country} onChange={(e) => setCountry(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none">
          <option value="NG">Nigeria</option><option value="GH">Ghana</option><option value="KE">Kenya</option><option value="ZA">South Africa</option>
        </select>
      </div>
      <p className="text-sm text-gray-400 mb-6">SOS alerts and critical emergency reports from the last hour</p>
      <div className="space-y-3">
        {data.map((r: any) => (
          <div key={r.id} className="bg-red-950/30 rounded-xl p-5 border border-red-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-400">EMERGENCY</span>
              <span className="text-xs text-gray-400 capitalize">{r.category?.replace('_', ' ')}</span>
              <span className="text-xs text-gray-500 ml-auto">{new Date(r.createdAt).toLocaleTimeString()}</span>
            </div>
            <h3 className="font-medium text-gray-100">{r.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{r.description}</p>
            <p className="text-xs text-gray-500 mt-2">{r.state || r.city || ''} · {r.latitude ? `${Number(r.latitude).toFixed(4)}, ${Number(r.longitude).toFixed(4)}` : ''}</p>
          </div>
        ))}
        {data.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-gray-400">No active emergencies in the last hour</p>
          </div>
        )}
      </div>
    </div>
  );
}
