'use client';
import { useState, useEffect } from 'react';
import { govAPI } from '@/lib/api';

export default function GovDashboard() {
  const [data, setData] = useState<any>(null);
  const [country, setCountry] = useState('NG');

  useEffect(() => { govAPI.dashboard(country).then(setData).catch(() => {}); }, [country]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Civic Intelligence Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time incident monitoring</p>
        </div>
        <select value={country} onChange={(e) => setCountry(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none">
          {[
            { code: 'NG', name: 'Nigeria' }, { code: 'GH', name: 'Ghana' }, { code: 'KE', name: 'Kenya' },
            { code: 'ZA', name: 'South Africa' }, { code: 'UG', name: 'Uganda' }, { code: 'RW', name: 'Rwanda' },
            { code: 'TZ', name: 'Tanzania' }, { code: 'ET', name: 'Ethiopia' }, { code: 'SN', name: 'Senegal' },
            { code: 'CM', name: 'Cameroon' }, { code: 'EG', name: 'Egypt' }, { code: 'MA', name: 'Morocco' },
            { code: 'DZ', name: 'Algeria' }, { code: 'TN', name: 'Tunisia' }, { code: 'CI', name: "Côte d'Ivoire" },
            { code: 'AO', name: 'Angola' }, { code: 'MZ', name: 'Mozambique' }, { code: 'CD', name: 'DR Congo' },
            { code: 'SD', name: 'Sudan' }, { code: 'LY', name: 'Libya' }, { code: 'ZW', name: 'Zimbabwe' },
            { code: 'ZM', name: 'Zambia' }, { code: 'MW', name: 'Malawi' }, { code: 'BJ', name: 'Benin' },
            { code: 'TG', name: 'Togo' }, { code: 'ML', name: 'Mali' }, { code: 'BF', name: 'Burkina Faso' },
            { code: 'NE', name: 'Niger' }, { code: 'SL', name: 'Sierra Leone' }, { code: 'LR', name: 'Liberia' },
            { code: 'SO', name: 'Somalia' }, { code: 'MG', name: 'Madagascar' },
          ].map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Reports', value: data?.totalReports || 0, color: 'text-blue-400' },
          { label: 'Total Users', value: data?.totalUsers || 0, color: 'text-emerald-400' },
          { label: 'Emergency Reports', value: data?.emergencyReports || 0, color: 'text-red-400' },
          { label: 'Active Incidents', value: data?.activeReports || 0, color: 'text-orange-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#1E293B] rounded-xl p-5 border border-gray-700">
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#1E293B] rounded-xl p-6 border border-gray-700">
          <h2 className="font-semibold mb-4">Category Breakdown</h2>
          {data?.categoryBreakdown?.length > 0 ? (
            <div className="space-y-2">
              {data.categoryBreakdown.map((cat: any) => (
                <div key={cat.category} className="flex justify-between items-center">
                  <span className="text-sm text-gray-300 capitalize">{cat.category.replace('_', ' ')}</span>
                  <span className="text-sm font-semibold text-blue-400">{cat.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No data available</p>
          )}
        </div>

        <div className="bg-[#1E293B] rounded-xl p-6 border border-gray-700">
          <h2 className="font-semibold mb-4">Recent Reports</h2>
          {data?.recentReports?.length > 0 ? (
            <div className="space-y-3">
              {data.recentReports.map((r: any) => (
                <div key={r.id} className="border-b border-gray-700 pb-2 last:border-0">
                  <p className="text-sm font-medium text-gray-200 line-clamp-1">{r.title}</p>
                  <p className="text-xs text-gray-500">{r.category} · {r.severity}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No recent reports</p>
          )}
        </div>
      </div>
    </div>
  );
}
