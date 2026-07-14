'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function ObserversAdminPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [active, setActive] = useState<any[]>([]);
  const [tab, setTab] = useState<'pending' | 'active'>('pending');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const token = localStorage.getItem('admin_token');
    const headers = { Authorization: `Bearer ${token}` };
    const [p, a] = await Promise.all([
      fetch(`${API_URL}/observers/admin/pending`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/observers/admin/active`, { headers }).then(r => r.json()),
    ]);
    setPending(Array.isArray(p) ? p : []);
    setActive(Array.isArray(a) ? a : []);
  };

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'activate') => {
    const token = localStorage.getItem('admin_token');
    await fetch(`${API_URL}/observers/admin/${id}/${action}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    loadData();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">🗳️ Election Observers</h1>
      <p className="text-gray-400 text-sm mb-6">Review accreditation and manage observer subscriptions</p>

      <div className="flex gap-3 mb-6">
        <button onClick={() => setTab('pending')} className={`px-4 py-2 text-sm rounded-lg font-medium ${tab === 'pending' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
          Pending ({pending.length})
        </button>
        <button onClick={() => setTab('active')} className={`px-4 py-2 text-sm rounded-lg font-medium ${tab === 'active' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
          Active ({active.length})
        </button>
      </div>

      {tab === 'pending' && (
        <div className="space-y-4">
          {pending.length === 0 ? <p className="text-gray-500 text-center py-12">No pending applications</p> : pending.map((o: any) => (
            <div key={o.id} className="bg-[#1E293B] rounded-xl border border-gray-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-white">{o.user?.displayName || o.userId}</p>
                  <p className="text-xs text-gray-400">{o.user?.email} · {o.orgName || 'Individual'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-blue-900/50 text-blue-400 rounded capitalize">{o.tier}</span>
                  <span className="text-xs text-gray-500">{o.country}</span>
                </div>
              </div>
              {o.accreditationUrl && (
                <a href={o.accreditationUrl} target="_blank" className="text-xs text-emerald-400 hover:underline block mb-3">📎 View accreditation document</a>
              )}
              <div className="flex gap-2">
                <button onClick={() => handleAction(o.id, 'approve')} className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500">✓ Approve</button>
                <button onClick={() => handleAction(o.id, 'activate')} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500">⚡ Activate (skip payment)</button>
                <button onClick={() => handleAction(o.id, 'reject')} className="px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-500">✕ Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'active' && (
        <div className="space-y-3">
          {active.length === 0 ? <p className="text-gray-500 text-center py-12">No active observers</p> : active.map((o: any) => (
            <div key={o.id} className="bg-[#1E293B] rounded-xl border border-gray-700 p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{o.user?.displayName || o.userId}</p>
                <p className="text-xs text-gray-400">{o.orgName || 'Individual'} · {o.country} · Expires: {o.expiresAt ? new Date(o.expiresAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-emerald-900/50 text-emerald-400 rounded capitalize">{o.tier}</span>
                <span className="text-xs text-gray-500">{o.seats} seats</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grant Access Form */}
      <GrantAccessForm observers={[...pending, ...active]} onGranted={loadData} />
    </div>
  );
}

function GrantAccessForm({ observers, onGranted }: { observers: any[]; onGranted: () => void }) {
  const [selectedId, setSelectedId] = useState('');
  const [manualId, setManualId] = useState('');
  const [tier, setTier] = useState('individual');
  const [days, setDays] = useState('90');
  const [loading, setLoading] = useState(false);

  const handleGrant = async () => {
    const id = selectedId || manualId;
    if (!id) { alert('Select an observer or enter an ID'); return; }
    setLoading(true);
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_URL}/observers/admin/${id}/activate`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier, days: Number(days) }),
    });
    const data = await res.json();
    if (data.id) { alert(`Access granted: ${tier} for ${days} days`); onGranted(); }
    else alert(data.message || 'Failed');
    setLoading(false);
  };

  return (
    <div className="mt-8 bg-[#1E293B] rounded-xl border border-gray-700 p-6">
      <h3 className="text-sm font-semibold text-white mb-4">🎟️ Grant Observer Access (No Payment)</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {observers.length > 0 ? (
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white text-sm outline-none">
            <option value="">Select observer...</option>
            {observers.map((o: any) => <option key={o.id} value={o.id}>{o.user?.displayName || o.userId} ({o.country})</option>)}
          </select>
        ) : (
          <input value={manualId} onChange={e => setManualId(e.target.value)} placeholder="Enter observer ID" className="px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white text-sm outline-none" />
        )}
        <select value={tier} onChange={e => setTier(e.target.value)} className="px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white text-sm outline-none">
          <option value="individual">Individual (1 seat)</option>
          <option value="organization">Organization (5 seats)</option>
          <option value="enterprise">Enterprise (20 seats)</option>
        </select>
        <input value={days} onChange={e => setDays(e.target.value)} type="number" placeholder="Days" className="px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white text-sm outline-none" />
        <button onClick={handleGrant} disabled={loading} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50">
          {loading ? '...' : 'Grant Access'}
        </button>
      </div>
    </div>
  );
}
