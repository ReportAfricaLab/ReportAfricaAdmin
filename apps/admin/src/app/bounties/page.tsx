'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';

type StatusFilter = 'all' | 'open' | 'claimed' | 'completed' | 'expired';

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-emerald-600/20 text-emerald-400',
  claimed: 'bg-blue-600/20 text-blue-400',
  completed: 'bg-purple-600/20 text-purple-400',
  expired: 'bg-gray-600/20 text-gray-400',
  disputed: 'bg-red-600/20 text-red-400',
};

export default function BountiesPage() {
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'general', country: 'NG',
    rewardAmount: 5000, rewardCurrency: 'NGN', expiresAt: '',
  });

  const load = () => adminAPI.bounties().then(setData).catch(() => {});
  useEffect(() => { load(); }, []);

  const notify = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(''), 4000); };

  const handleApprove = async (id: string) => {
    try { await adminAPI.approveBounty(id); notify('✅ Bounty approved — reporter paid'); load(); }
    catch (e: any) { notify('❌ ' + (e.message || 'Failed')); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this bounty? It will be marked as expired.')) return;
    try { await adminAPI.cancelBounty(id); notify('✅ Bounty cancelled'); load(); }
    catch (e: any) { notify('❌ ' + (e.message || 'Failed')); }
  };

  const handleDispute = async (id: string) => {
    const reason = prompt('Dispute reason:');
    if (reason === null) return;
    try { await adminAPI.disputeBounty(id, reason); notify('Bounty disputed'); load(); }
    catch (e: any) { notify('❌ ' + (e.message || 'Failed')); }
  };

  const handleCreate = async () => {
    if (!form.title || !form.rewardAmount) { notify('Title and reward required'); return; }
    try {
      await adminAPI.createBounty(form);
      notify('✅ Bounty created');
      setCreating(false);
      setForm({ title: '', description: '', category: 'general', country: 'NG', rewardAmount: 5000, rewardCurrency: 'NGN', expiresAt: '' });
      load();
    } catch (e: any) { notify('❌ ' + (e.message || 'Failed')); }
  };

  const bounties: any[] = (data?.bounties || []).filter((b: any) => status === 'all' || b.status === status);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🏹 Bounty Board</h1>
        <button onClick={() => setCreating(!creating)}
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500">
          + Create Bounty
        </button>
      </div>

      {message && <div className="mb-4 p-3 rounded-lg bg-gray-800 border border-gray-700 text-sm">{message}</div>}

      {creating && (
        <div className="mb-6 bg-gray-800 rounded-xl border border-emerald-600/30 p-6">
          <h2 className="font-semibold mb-4">New Bounty</h2>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title"
              className="col-span-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-100 outline-none" />
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)"
              className="col-span-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-100 outline-none" />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-100 outline-none">
              {['general','traffic','police_security','government','election','emergency','environmental','health','corruption'].map(c => (
                <option key={c} value={c}>{c.replace('_', ' ')}</option>
              ))}
            </select>
            <input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="Country (e.g. NG)"
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-100 outline-none" />
            <input type="number" value={form.rewardAmount} onChange={e => setForm({ ...form, rewardAmount: Number(e.target.value) })} placeholder="Reward Amount"
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-100 outline-none" />
            <select value={form.rewardCurrency} onChange={e => setForm({ ...form, rewardCurrency: e.target.value })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-100 outline-none">
              {['NGN','GHS','KES','ZAR','USD'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="datetime-local" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })}
              className="col-span-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-100 outline-none" />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500">Create</button>
            <button onClick={() => setCreating(false)} className="px-4 py-2 bg-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-600">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {(['all', 'open', 'claimed', 'completed', 'expired'] as StatusFilter[]).map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize ${status === s ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {bounties.map((b: any) => (
          <div key={b.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-medium text-gray-100">{b.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold capitalize ${STATUS_COLORS[b.status] || 'bg-gray-700 text-gray-400'}`}>
                    {b.status}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-gray-700 text-gray-300 rounded capitalize">{b.category?.replace('_', ' ')}</span>
                  <span className="text-[10px] text-gray-500">{b.country}</span>
                </div>
                {b.description && <p className="text-sm text-gray-400 mt-1">{b.description}</p>}
                <div className="flex gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                  <span className="text-amber-400 font-semibold">{b.rewardCurrency} {Number(b.rewardAmount).toLocaleString()}</span>
                  {b.claimedBy && <span>Claimed by: <span className="text-gray-300">{b.claimedBy?.username || b.claimedById?.slice(0, 8)}</span></span>}
                  {b.expiresAt && <span>Expires: {new Date(b.expiresAt).toLocaleDateString()}</span>}
                  <span>Posted: {new Date(b.createdAt).toLocaleDateString()}</span>
                </div>
                {b.submissionNote && <p className="text-xs text-blue-400 mt-1">Note: {b.submissionNote}</p>}
              </div>
              <div className="flex gap-2 ml-4 shrink-0">
                {b.status === 'open' && (
                  <button onClick={() => handleCancel(b.id)}
                    className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-500">
                    Cancel
                  </button>
                )}
                {b.status === 'claimed' && (
                  <>
                    <button onClick={() => handleApprove(b.id)}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-500">
                      ✓ Approve & Pay
                    </button>
                    <button onClick={() => handleDispute(b.id)}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-500">
                      Dispute
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {bounties.length === 0 && <p className="text-gray-500 text-center py-10">No bounties found</p>}
      </div>
      {data && <p className="text-xs text-gray-500 mt-4">Total: {data.total || data.bounties?.length || 0}</p>}
    </div>
  );
}
