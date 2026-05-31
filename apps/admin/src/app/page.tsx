'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => { adminAPI.overview().then(setData).catch(() => {}); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: data?.totalUsers || '—', color: 'text-emerald-400' },
          { label: 'Total Reports', value: data?.totalReports || '—', color: 'text-blue-400' },
          { label: 'Active Campaigns', value: data?.activeCampaigns || '—', color: 'text-orange-400' },
          { label: 'Platform Revenue', value: data?.revenue || '—', color: 'text-yellow-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <a href="/users" className="p-4 bg-gray-750 rounded-lg border border-gray-700 hover:border-emerald-500 transition text-center">
            <p className="text-lg">👥</p><p className="text-sm text-gray-300 mt-1">Users</p>
          </a>
          <a href="/reports" className="p-4 bg-gray-750 rounded-lg border border-gray-700 hover:border-emerald-500 transition text-center">
            <p className="text-lg">📰</p><p className="text-sm text-gray-300 mt-1">Reports</p>
          </a>
          <a href="/campaigns" className="p-4 bg-gray-750 rounded-lg border border-gray-700 hover:border-emerald-500 transition text-center">
            <p className="text-lg">🤝</p><p className="text-sm text-gray-300 mt-1">Campaigns</p>
          </a>
        </div>
      </div>
    </div>
  );
}
