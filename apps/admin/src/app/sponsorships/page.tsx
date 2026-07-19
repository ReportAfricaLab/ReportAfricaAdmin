'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';

const CATEGORIES = ['traffic','police_security','government','election','emergency','environmental','gender_violence','health','corruption','utilities','missing_persons','market_consumer'];

export default function SponsorshipsPage() {
  const [data, setData] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    sponsorName: '', logoUrl: '', category: 'general', country: 'NG',
    rewardPerReport: 500, totalBudget: 50000, currency: 'NGN',
    startsAt: '', endsAt: '',
  });

  const load = () => adminAPI.sponsorships().then(setData).catch(() => {});
  useEffect(() => { load(); }, []);

  const notify = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(''), 4000); };

  const handlePause = async (id: string, isPaused: boolean) => {
    try {
      await adminAPI.pauseSponsorship(id);
      notify(isPaused ? '▶ Sponsorship resumed' : '⏸ Sponsorship paused');
      load();
    } catch (e: any) { notify('❌ ' + (e.message || 'Failed')); }
  };

  const handleCreate = async () => {
    if (!form.sponsorName || !form.startsAt || !form.endsAt) { notify('Sponsor name, start and end date required'); return; }
    try {
      await adminAPI.createSponsorship(form);
      notify('✅ Sponsorship created');
      setCreating(false);
      setForm({ sponsorName: '', logoUrl: '', category: 'general', country: 'NG', rewardPerReport: 500, totalBudget: 50000, currency: 'NGN', startsAt: '', endsAt: '' });
      load();
    } catch (e: any) { notify('❌ ' + (e.message || 'Failed')); }
  };

  const sponsorships: any[] = data?.sponsorships || data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🏷️ Category Sponsorships</h1>
        <button onClick={() => setCreating(!creating)}
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500">
          + Create Sponsorship
        </button>
      </div>

      {message && <div className="mb-4 p-3 rounded-lg bg-gray-800 border border-gray-700 text-sm">{message}</div>}

      {creating && (
        <div className="mb-6 bg-gray-800 rounded-xl border border-emerald-600/30 p-6">
          <h2 className="font-semibold mb-4">New Sponsorship</h2>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.sponsorName} onChange={e => setForm({ ...form, sponsorName: e.target.value })} placeholder="Sponsor / Business Name"
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-100 outline-none" />
            <input value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })} placeholder="Logo URL (optional)"
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-100 outline-none" />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-100 outline-none">
              {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </select>
            <input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="Country (e.g. NG)"
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-100 outline-none" />
            <input type="number" value={form.rewardPerReport} onChange={e => setForm({ ...form, rewardPerReport: Number(e.target.value) })} placeholder="Reward per report"
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-100 outline-none" />
            <input type="number" value={form.totalBudget} onChange={e => setForm({ ...form, totalBudget: Number(e.target.value) })} placeholder="Total Budget"
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-100 outline-none" />
            <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-100 outline-none">
              {['NGN','GHS','KES','ZAR','USD'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div />
            <div>
              <label className="text-xs text-gray-400 block mb-1">Start Date</label>
              <input type="datetime-local" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-100 outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">End Date</label>
              <input type="datetime-local" value={form.endsAt} onChange={e => setForm({ ...form, endsAt: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-100 outline-none" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500">Create</button>
            <button onClick={() => setCreating(false)} className="px-4 py-2 bg-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-600">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sponsorships.map((s: any) => {
          const budgetUsedPct = s.totalBudget > 0 ? Math.min(100, Math.round((s.spentAmount / s.totalBudget) * 100)) : 0;
          const isPaused = s.status === 'paused';
          return (
            <div key={s.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {s.logoUrl && <img src={s.logoUrl} alt="" className="w-6 h-6 rounded object-cover" />}
                    <h3 className="font-medium text-gray-100">{s.sponsorName}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold capitalize ${isPaused ? 'bg-gray-600/20 text-gray-400' : 'bg-emerald-600/20 text-emerald-400'}`}>
                      {s.status || 'active'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded capitalize">{s.category?.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-gray-500">{s.country}</span>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                    <span>Reward: <span className="text-amber-400 font-semibold">{s.currency} {Number(s.rewardPerReport).toLocaleString()} / report</span></span>
                    <span>Budget: {s.currency} {Number(s.totalBudget).toLocaleString()}</span>
                    <span>Spent: {s.currency} {Number(s.spentAmount || 0).toLocaleString()}</span>
                    {s.startsAt && <span>{new Date(s.startsAt).toLocaleDateString()} → {new Date(s.endsAt).toLocaleDateString()}</span>}
                  </div>
                  {/* Budget progress bar */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${budgetUsedPct > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${budgetUsedPct}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400">{budgetUsedPct}% used</span>
                  </div>
                </div>
                <button onClick={() => handlePause(s.id, isPaused)}
                  className={`ml-4 px-3 py-1.5 text-xs font-medium rounded shrink-0 ${isPaused ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-amber-600 text-white hover:bg-amber-500'}`}>
                  {isPaused ? '▶ Resume' : '⏸ Pause'}
                </button>
              </div>
            </div>
          );
        })}
        {sponsorships.length === 0 && <p className="text-gray-500 text-center py-10">No sponsorships yet</p>}
      </div>
      {data && <p className="text-xs text-gray-500 mt-4">Total: {sponsorships.length}</p>}
    </div>
  );
}
