'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';

export default function AIPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = () => {
    setLoading(true);
    adminAPI.aiDecisions().then(d => setReports(d.reports || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleOverride = async (id: string, action: 'approve' | 'flag') => {
    try {
      await adminAPI.aiOverride(id, action);
      setMessage(`✅ Report ${action === 'approve' ? 'approved' : 'flagged'}`);
      load();
    } catch (e: any) { setMessage('❌ ' + (e.message || 'Failed')); }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">🤖 AI Moderation</h1>
      <p className="text-sm text-gray-400 mb-6">View AI-generated headlines, moderation flags, and override decisions</p>

      {message && <div className="mb-4 p-3 rounded-lg bg-gray-800 border border-gray-700 text-sm">{message}</div>}

      {loading && <p className="text-gray-500 text-center py-10">Loading...</p>}

      <div className="space-y-3">
        {reports.map((r: any) => (
          <div key={r.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${r.severity === 'critical' ? 'bg-red-600' : r.severity === 'high' ? 'bg-orange-600' : 'bg-blue-600'} text-white`}>
                    {r.severity?.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{r.category?.replace('_', ' ')}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${r.verificationLevel === 'community_verified' ? 'bg-emerald-600/20 text-emerald-400' : r.verificationLevel === 'unverified' ? 'bg-amber-600/20 text-amber-400' : 'bg-gray-700 text-gray-400'}`}>
                    {r.verificationLevel}
                  </span>
                </div>

                {/* Original title */}
                <p className="text-xs text-gray-500">Original: <span className="text-gray-300">{r.title}</span></p>

                {/* AI headline */}
                {r.aiHeadline && (
                  <p className="text-xs text-gray-500 mt-1">🤖 AI Headline: <span className="text-emerald-400 font-medium">{r.aiHeadline}</span></p>
                )}

                {/* AI moderation score */}
                {r.aiModerationScore != null && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">AI Score:</span>
                    <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${r.aiModerationScore > 70 ? 'bg-red-500' : r.aiModerationScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${r.aiModerationScore}%` }} />
                    </div>
                    <span className={`text-xs font-bold ${r.aiModerationScore > 70 ? 'text-red-400' : r.aiModerationScore > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {r.aiModerationScore}%
                    </span>
                  </div>
                )}

                <p className="text-sm text-gray-400 mt-2 line-clamp-2">{r.description}</p>
                <p className="text-xs text-gray-600 mt-2">By: {r.author?.username || 'Anonymous'} · {new Date(r.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <button onClick={() => handleOverride(r.id, 'approve')}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-500">✓ Approve</button>
                <button onClick={() => handleOverride(r.id, 'flag')}
                  className="px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded hover:bg-amber-500">⚠ Flag</button>
              </div>
            </div>
          </div>
        ))}
        {!loading && reports.length === 0 && <p className="text-gray-500 text-center py-10">No AI decisions to review</p>}
      </div>
    </div>
  );
}
