'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  const load = () => adminAPI.reports(1, undefined, flaggedOnly).then(setData).catch(() => {});
  useEffect(() => { load(); }, [flaggedOnly]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Report Moderation</h1>
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input type="checkbox" checked={flaggedOnly} onChange={(e) => setFlaggedOnly(e.target.checked)}
            className="rounded border-gray-600 bg-gray-700 text-emerald-500" />
          Flagged only
        </label>
      </div>

      <div className="space-y-3">
        {data?.reports?.map((r: any) => (
          <div key={r.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${r.severity === 'critical' ? 'bg-red-600' : r.severity === 'high' ? 'bg-orange-600' : 'bg-blue-600'} text-white`}>
                    {r.severity?.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{r.category?.replace('_', ' ')}</span>
                  <span className="text-xs text-gray-600">{r.country}</span>
                </div>
                <h3 className="font-medium text-gray-100">{r.title}</h3>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{r.description}</p>
                <p className="text-xs text-gray-600 mt-2">By: {r.author?.username || 'Anonymous'} · {new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => adminAPI.verifyReport(r.id, 'community_verified').then(load)}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-500">Verify</button>
                <button onClick={() => adminAPI.deleteReport(r.id).then(load)}
                  className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-500">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {data?.reports?.length === 0 && <p className="text-gray-500 text-center py-10">No reports to moderate</p>}
      </div>
      {data && <p className="text-xs text-gray-500 mt-4">Total: {data.total} reports</p>}
    </div>
  );
}
