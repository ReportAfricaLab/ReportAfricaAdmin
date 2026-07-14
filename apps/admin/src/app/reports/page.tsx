'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [message, setMessage] = useState('');

  const load = () => adminAPI.reports(1, undefined, flaggedOnly).then(setData).catch(() => {});
  useEffect(() => { load(); }, [flaggedOnly]);

  const handleVerify = async (id: string) => {
    try {
      await adminAPI.verifyReport(id, 'community_verified');
      setMessage('✅ Report verified');
      setData((prev: any) => prev ? { ...prev, reports: prev.reports.filter((r: any) => r.id !== id) } : prev);
    } catch (e: any) { setMessage('❌ ' + (e.message || 'Failed')); }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this report permanently?')) return;
    try {
      await adminAPI.deleteReport(id);
      setMessage('✅ Report deleted');
      setData((prev: any) => prev ? { ...prev, reports: prev.reports.filter((r: any) => r.id !== id) } : prev);
    } catch (e: any) { setMessage('❌ ' + (e.message || 'Failed')); }
    setTimeout(() => setMessage(''), 3000);
  };

  const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

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

      {message && <div className="mb-4 p-3 rounded-lg bg-gray-800 border border-gray-700 text-sm">{message}</div>}

      <div className="space-y-3">
        {data?.reports?.map((r: any) => (
          <div key={r.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${r.severity === 'critical' ? 'bg-red-600' : r.severity === 'high' ? 'bg-orange-600' : 'bg-blue-600'} text-white`}>
                    {r.severity?.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{r.category?.replace('_', ' ')}</span>
                  <span className="text-xs text-gray-600">{r.country}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${r.verificationLevel === 'community_verified' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                    {r.verificationLevel}
                  </span>
                  {r.ipfsCid && (
                    <a href={`${PINATA_GATEWAY}/${r.ipfsCid}`} target="_blank" rel="noreferrer"
                      className="px-2 py-0.5 text-[10px] bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 rounded hover:bg-emerald-600/30 transition">
                      📌 IPFS
                    </a>
                  )}
                </div>
                <h3 className="font-medium text-gray-100">{r.title}</h3>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{r.description}</p>
                <p className="text-xs text-gray-600 mt-2">By: {r.author?.username || 'Anonymous'} · {new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => handleVerify(r.id)}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-500">Verify</button>
                <button onClick={() => handleDelete(r.id)}
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
