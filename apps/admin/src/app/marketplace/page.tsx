'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';

type Tab = 'pending' | 'approved' | 'rejected';

const STATUS_COLORS: Record<string, string> = {
  pending_payment: 'bg-gray-600/20 text-gray-400',
  escrowed: 'bg-blue-600/20 text-blue-400',
  accepted: 'bg-cyan-600/20 text-cyan-400',
  submitted: 'bg-amber-600/20 text-amber-400',
  approved: 'bg-emerald-600/20 text-emerald-400',
  paid: 'bg-purple-600/20 text-purple-400',
  rejected: 'bg-red-600/20 text-red-400',
};

export default function MarketplacePage() {
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<Tab>('pending');
  const [message, setMessage] = useState('');

  const load = () => adminAPI.marketplacePending().then(setData).catch(() => {});
  useEffect(() => { load(); }, []);

  const notify = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(''), 4000); };

  const handleApprove = async (id: string) => {
    try { await adminAPI.approveCommission(id); notify('✅ Work approved — reporter paid'); load(); }
    catch (e: any) { notify('❌ ' + (e.message || 'Failed')); }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Rejection reason:');
    if (reason === null) return;
    try { await adminAPI.rejectCommission(id, reason); notify('Work rejected'); load(); }
    catch (e: any) { notify('❌ ' + (e.message || 'Failed')); }
  };

  const all: any[] = data?.commissions || [];
  const tabMap: Record<Tab, string[]> = {
    pending: ['escrowed', 'accepted', 'submitted'],
    approved: ['approved', 'paid'],
    rejected: ['rejected'],
  };
  const filtered = all.filter((c: any) => tabMap[tab].includes(c.status));
  const pendingCount = all.filter((c: any) => tabMap.pending.includes(c.status)).length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">💼 Reporter Marketplace</h1>
      <p className="text-sm text-gray-400 mb-6">Review commissioned work submissions and approve payouts</p>

      {message && <div className="mb-4 p-3 rounded-lg bg-gray-800 border border-gray-700 text-sm">{message}</div>}

      <div className="flex gap-2 mb-6">
        {(['pending', 'approved', 'rejected'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize ${tab === t ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {t} {t === 'pending' && pendingCount > 0 && (
              <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((c: any) => (
          <div key={c.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold capitalize ${STATUS_COLORS[c.status] || 'bg-gray-700 text-gray-400'}`}>
                    {c.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-400">Reporter: <span className="text-gray-200">{c.reporter?.displayName || c.reporter?.username || c.reporterId?.slice(0, 8)}</span></span>
                  <span className="text-xs text-gray-400">Client: <span className="text-gray-200">{c.client?.displayName || c.client?.username || c.clientId?.slice(0, 8)}</span></span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{c.brief}</p>
                <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
                  <span className="text-amber-400 font-semibold">{c.currency} {Number(c.budget).toLocaleString()}</span>
                  {c.deadline && <span>Deadline: {new Date(c.deadline).toLocaleDateString()}</span>}
                  <span>Created: {new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                {c.submissionUrl && (
                  <a href={c.submissionUrl} target="_blank" rel="noreferrer"
                    className="inline-block mt-2 text-xs text-blue-400 hover:underline">
                    📎 View submitted work →
                  </a>
                )}
                {c.submissionNote && <p className="text-xs text-gray-400 mt-1">Note: {c.submissionNote}</p>}
                {c.rejectionReason && <p className="text-xs text-red-400 mt-1">Rejection: {c.rejectionReason}</p>}
              </div>
              {c.status === 'submitted' && (
                <div className="flex gap-2 ml-4 shrink-0">
                  <button onClick={() => handleApprove(c.id)}
                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-500">
                    ✓ Approve & Pay
                  </button>
                  <button onClick={() => handleReject(c.id)}
                    className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-500">
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-gray-500 text-center py-10">No {tab} commissions</p>}
      </div>
    </div>
  );
}
