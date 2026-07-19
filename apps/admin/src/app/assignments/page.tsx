'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';

type Tab = 'open' | 'submitted' | 'approved' | 'rejected';

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-emerald-600/20 text-emerald-400',
  submitted: 'bg-blue-600/20 text-blue-400',
  approved: 'bg-purple-600/20 text-purple-400',
  rejected: 'bg-red-600/20 text-red-400',
  expired: 'bg-gray-600/20 text-gray-400',
};

export default function AssignmentsPage() {
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<Tab>('submitted');
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '', brief: '', category: 'general', country: 'NG',
    rewardAmount: 10000, rewardCurrency: 'NGN', certifiedOnly: false,
    assignedTo: '', deadline: '',
  });

  const load = () => adminAPI.assignments().then(setData).catch(() => {});
  useEffect(() => { load(); }, []);

  const notify = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(''), 4000); };

  const handleApprove = async (id: string) => {
    try { await adminAPI.approveAssignment(id); notify('✅ Assignment approved — reporter paid'); load(); }
    catch (e: any) { notify('❌ ' + (e.message || 'Failed')); }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Rejection reason (optional):') ?? '';
    try { await adminAPI.rejectAssignment(id, reason); notify('Assignment rejected — reopened'); load(); }
    catch (e: any) { notify('❌ ' + (e.message || 'Failed')); }
  };

  const handleCreate = async () => {
    if (!form.title || !form.brief) { notify('Title and brief required'); return; }
    try {
      await adminAPI.createAssignment(form);
      notify('✅ Assignment created');
      setCreating(false);
      setForm({ title: '', brief: '', category: 'general', country: 'NG', rewardAmount: 10000, rewardCurrency: 'NGN', certifiedOnly: false, assignedTo: '', deadline: '' });
      load();
    } catch (e: any) { notify('❌ ' + (e.message || 'Failed')); }
  };

  const all: any[] = data?.assignments || [];
  const filtered = all.filter((a: any) => a.status === tab);
  const counts = { open: 0, submitted: 0, approved: 0, rejected: 0 } as Record<Tab, number>;
  all.forEach((a: any) => { if (a.status in counts) counts[a.status as Tab]++; });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📋 Assignment Desk</h1>
        <button onClick={() => setCreating(!creating)}
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500">
          + Create Assignment
        </button>
      </div>

      {message && <div className="mb-4 p-3 rounded-lg bg-gray-800 border border-gray-700 text-sm">{message}</div>}

      {creating && (
        <div className="mb-6 bg-gray-800 rounded-xl border border-emerald-600/30 p-6">
          <h2 className="font-semibold mb-4">New Assignment</h2>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title"
              className="col-span-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-100 outline-none" />
            <textarea value={form.brief} onChange={e => setForm({ ...form, brief: e.target.value })} placeholder="Brief / instructions" rows={3}
              className="col-span-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-100 outline-none resize-none" />
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
            <input value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} placeholder="Assign to reporter ID (optional)"
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-100 outline-none" />
            <input type="datetime-local" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-100 outline-none" />
            <label className="col-span-2 flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={form.certifiedOnly} onChange={e => setForm({ ...form, certifiedOnly: e.target.checked })}
                className="rounded border-gray-600 bg-gray-700 text-emerald-500" />
              Certified reporters only
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500">Create</button>
            <button onClick={() => setCreating(false)} className="px-4 py-2 bg-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['submitted', 'open', 'approved', 'rejected'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize ${tab === t ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {t} {counts[t] > 0 && <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full">{counts[t]}</span>}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((a: any) => (
          <div key={a.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-medium text-gray-100">{a.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold capitalize ${STATUS_COLORS[a.status] || 'bg-gray-700 text-gray-400'}`}>
                    {a.status}
                  </span>
                  {a.certifiedOnly && <span className="text-[10px] px-2 py-0.5 bg-amber-600/20 text-amber-400 rounded">Certified Only</span>}
                  <span className="text-[10px] text-gray-500">{a.country}</span>
                </div>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{a.brief}</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                  <span className="text-amber-400 font-semibold">{a.rewardCurrency} {Number(a.rewardAmount).toLocaleString()}</span>
                  {a.assignedTo && <span>Reporter: <span className="text-gray-300">{a.assignedTo?.username || a.assignedToId?.slice(0, 8)}</span></span>}
                  {a.submittedAt && <span>Submitted: {new Date(a.submittedAt).toLocaleDateString()}</span>}
                  {a.deadline && <span>Deadline: {new Date(a.deadline).toLocaleDateString()}</span>}
                  <span>Created: {new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
                {a.reportId && (
                  <a href={`https://reportafrica.africa/report/${a.reportId}`} target="_blank" rel="noreferrer"
                    className="inline-block mt-1 text-xs text-blue-400 hover:underline">
                    📎 View submitted report →
                  </a>
                )}
                {a.submissionNote && <p className="text-xs text-blue-400 mt-1">Submission note: {a.submissionNote}</p>}
                {a.rejectionReason && <p className="text-xs text-red-400 mt-1">Rejection reason: {a.rejectionReason}</p>}
              </div>
              {a.status === 'submitted' && (
                <div className="flex gap-2 ml-4 shrink-0">
                  <button onClick={() => handleApprove(a.id)}
                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-500">
                    ✓ Approve & Pay
                  </button>
                  <button onClick={() => handleReject(a.id)}
                    className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-500">
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-gray-500 text-center py-10">No {tab} assignments</p>}
      </div>
      {data && <p className="text-xs text-gray-500 mt-4">Total: {all.length}</p>}
    </div>
  );
}
