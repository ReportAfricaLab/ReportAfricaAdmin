'use client';
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/lib/api';

export default function EscalationsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminAPI.support.incidents(1, 'escalated')
      .then((d: any) => setIncidents(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const notify = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(''), 4000); };

  const handleApprove = async (id: string) => {
    try {
      await adminAPI.support.approve(id);
      notify('✅ Approved — AMARA is executing the resolution');
      load();
    } catch (e: any) { notify('❌ ' + (e.message || 'Failed')); }
  };

  const handleReject = async (id: string) => {
    const reason = rejectReason[id]?.trim();
    if (!reason) { notify('Please enter a rejection reason'); return; }
    try {
      await adminAPI.support.reject(id, reason);
      notify('✅ Rejected and logged');
      setRejectReason(r => ({ ...r, [id]: '' }));
      load();
    } catch (e: any) { notify('❌ ' + (e.message || 'Failed')); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">⚠️ Escalation Queue</h1>
        <p className="text-sm text-gray-400 mt-1">AMARA needs your approval before executing — review and decide</p>
      </div>

      {message && <div className="mb-4 p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm">{message}</div>}

      {loading && <p className="text-gray-500 text-center py-10 text-sm">Loading...</p>}

      <div className="space-y-4">
        {incidents.map((inc: any) => (
          <div key={inc.id} className="bg-gray-800 rounded-xl border border-amber-600/30 p-5">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-600/20 text-amber-400">
                    TIER {inc.tier}
                  </span>
                  <span className="text-xs font-mono text-emerald-400">{inc.playbook?.issueId || 'UNMATCHED'}</span>
                  <span className="text-xs text-gray-400 capitalize">{inc.feature}</span>
                  <span className="text-xs text-gray-600">{new Date(inc.createdAt).toLocaleString()}</span>
                </div>

                {/* Error */}
                <p className="text-sm text-gray-200 mb-2">{inc.errorMessage}</p>

                {/* AMARA recommendation */}
                <div className="bg-gray-900 rounded-lg p-3 mb-3">
                  <p className="text-[10px] text-gray-500 mb-1">🤖 AMARA RECOMMENDATION</p>
                  <p className="text-sm text-emerald-400">{inc.amaraRecommendation || 'No specific recommendation — manual review required'}</p>
                  {inc.amaraConfidence != null && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-gray-500">Confidence:</span>
                      <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${inc.amaraConfidence > 70 ? 'bg-emerald-500' : inc.amaraConfidence > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${inc.amaraConfidence}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-300">{inc.amaraConfidence}%</span>
                    </div>
                  )}
                </div>

                {/* Context details */}
                {inc.contextPackage?.user_id && (
                  <p className="text-xs text-gray-500 mb-1">User: <span className="text-gray-300">{inc.contextPackage.user_id}</span></p>
                )}
                {inc.contextPackage?.sentry_url && (
                  <a href={inc.contextPackage.sentry_url} target="_blank" rel="noreferrer"
                    className="text-xs text-blue-400 hover:underline">View in Sentry →</a>
                )}

                {/* Expandable context */}
                <button onClick={() => setExpanded(expanded === inc.id ? null : inc.id)}
                  className="text-xs text-gray-500 hover:text-gray-300 mt-2 block">
                  {expanded === inc.id ? '▲ Hide context' : '▼ Full context'}
                </button>
                {expanded === inc.id && (
                  <div className="mt-2 p-3 bg-gray-900 rounded-lg text-xs font-mono text-gray-400 overflow-auto max-h-40">
                    <pre>{JSON.stringify(inc.contextPackage, null, 2)}</pre>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 shrink-0 min-w-[140px]">
                <button onClick={() => handleApprove(inc.id)}
                  className="px-3 py-2 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-500">
                  ✓ Approve & Execute
                </button>
                <textarea
                  value={rejectReason[inc.id] || ''}
                  onChange={e => setRejectReason(r => ({ ...r, [inc.id]: e.target.value }))}
                  placeholder="Rejection reason..."
                  rows={2}
                  className="px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-xs text-gray-200 outline-none resize-none focus:border-red-500"
                />
                <button onClick={() => handleReject(inc.id)}
                  className="px-3 py-2 bg-red-600/20 text-red-400 text-xs font-medium rounded hover:bg-red-600/30 border border-red-600/30">
                  ✗ Reject
                </button>
              </div>
            </div>
          </div>
        ))}

        {!loading && incidents.length === 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-10 text-center">
            <p className="text-gray-500 text-sm">No pending escalations</p>
            <p className="text-gray-600 text-xs mt-1">AMARA has nothing waiting for your approval</p>
          </div>
        )}
      </div>
    </div>
  );
}
