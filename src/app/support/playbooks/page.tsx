'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';

const TIER_STYLE: Record<number, string> = {
  1: 'bg-emerald-600/20 text-emerald-400',
  2: 'bg-amber-600/20 text-amber-400',
  3: 'bg-red-600/20 text-red-400',
};

const EMPTY_FORM = {
  issueId: '', feature: '', symptoms: '', diagnosticSteps: '',
  resolutionProcedure: '', tier: 2, autoResolveAction: '',
};

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | '1' | '2' | '3'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState('');
  const [myRole, setMyRole] = useState('');

  const load = () => adminAPI.support.playbooks().then(setPlaybooks).catch(() => {});

  useEffect(() => {
    load();
    adminAPI.getMe().then((d: any) => setMyRole(d.role)).catch(() => {});
  }, []);

  const notify = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  const handleCreate = async () => {
    try {
      await adminAPI.support.createPlaybook({
        ...form,
        symptoms: form.symptoms.split('\n').map((s: string) => s.trim()).filter(Boolean),
        diagnosticSteps: form.diagnosticSteps.split('\n').map((s: string) => s.trim()).filter(Boolean),
        resolutionProcedure: form.resolutionProcedure.split('\n').map((s: string) => s.trim()).filter(Boolean),
        tier: Number(form.tier),
      });
      notify('✅ Playbook created');
      setShowCreate(false);
      setForm(EMPTY_FORM);
      load();
    } catch (e: any) { notify('❌ ' + (e.message || 'Failed')); }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await adminAPI.support.updatePlaybook(id, data);
      notify('✅ Updated');
      setEditing(null);
      load();
    } catch (e: any) { notify('❌ ' + (e.message || 'Failed')); }
  };

  const handlePromote = async (id: string) => {
    if (!confirm('Promote to Tier 1 Autonomous? AMARA will execute this fix without human approval.')) return;
    try {
      await adminAPI.support.promotePlaybook(id);
      notify('✅ Promoted to Tier 1 Autonomous');
      load();
    } catch (e: any) { notify('❌ ' + (e.message || 'Failed')); }
  };

  const filtered = filter === 'all' ? playbooks : playbooks.filter(p => String(p.tier) === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">📋 Playbook Manager</h1>
          <p className="text-sm text-gray-400 mt-1">AMARA's knowledge base — {playbooks.length} playbooks</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500">
          ➕ Add Playbook
        </button>
      </div>

      {message && <div className="mb-4 p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm">{message}</div>}

      {/* Create Form */}
      {showCreate && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
          <h3 className="font-semibold mb-4 text-sm">New Playbook</h3>
          <div className="grid grid-cols-2 gap-3">
            {[['issueId', 'Issue ID (e.g. AUTH_001)'], ['feature', 'Feature (e.g. authentication)'], ['autoResolveAction', 'Auto Resolve Action (optional)']].map(([k, ph]) => (
              <input key={k} placeholder={ph} value={(form as any)[k]}
                onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-gray-100 outline-none focus:border-emerald-500" />
            ))}
            <select value={form.tier} onChange={e => setForm(f => ({ ...f, tier: Number(e.target.value) }))}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-gray-100 outline-none">
              <option value={2}>Tier 2 — Human Approval</option>
              <option value={3}>Tier 3 — Critical</option>
            </select>
          </div>
          {[['symptoms', 'Symptoms (one per line)'], ['diagnosticSteps', 'Diagnostic Steps (one per line)'], ['resolutionProcedure', 'Resolution Procedure (one per line)']].map(([k, ph]) => (
            <textarea key={k} placeholder={ph} value={(form as any)[k]} rows={3}
              onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
              className="w-full mt-3 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-gray-100 outline-none focus:border-emerald-500 resize-none" />
          ))}
          <div className="flex gap-2 mt-3">
            <button onClick={handleCreate} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-500">Save</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-700 text-gray-300 text-sm rounded hover:bg-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', '2', '1', '3'] as const).map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1.5 text-xs rounded transition ${filter === t ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {t === 'all' ? 'All' : t === '1' ? 'Tier 1 Autonomous' : t === '2' ? 'Tier 2' : 'Tier 3 Critical'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-700 text-left text-gray-400 text-xs">
            <tr>
              <th className="px-4 py-3">Issue ID</th>
              <th className="px-4 py-3">Feature</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Symptoms</th>
              <th className="px-4 py-3">Last Updated</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filtered.map((p: any) => (
              <>
                <tr key={p.id} className="hover:bg-gray-750">
                  <td className="px-4 py-3 font-mono text-xs text-emerald-400">{p.issueId}</td>
                  <td className="px-4 py-3 capitalize text-gray-300">{p.feature}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${TIER_STYLE[p.tier]}`}>
                      TIER {p.tier}{p.isAutonomous ? ' AUTO' : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{p.symptoms?.length || 0} symptoms</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(p.lastUpdated).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                        className="text-xs text-gray-400 hover:text-gray-200">
                        {expanded === p.id ? '▲' : '▼'}
                      </button>
                      <button onClick={() => setEditing(editing === p.id ? null : p.id)}
                        className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
                      {myRole === 'super_admin' && !p.isAutonomous && p.autoResolveAction && (
                        <button onClick={() => handlePromote(p.id)}
                          className="text-xs text-emerald-400 hover:text-emerald-300">Promote →T1</button>
                      )}
                    </div>
                  </td>
                </tr>

                {expanded === p.id && (
                  <tr key={`${p.id}-exp`}>
                    <td colSpan={6} className="px-4 pb-4">
                      <div className="bg-gray-900 rounded-lg p-3 text-xs font-mono text-gray-400 overflow-auto max-h-48">
                        <pre>{JSON.stringify({ symptoms: p.symptoms, diagnosticSteps: p.diagnosticSteps, resolutionProcedure: p.resolutionProcedure, escalationCriteria: p.escalationCriteria }, null, 2)}</pre>
                      </div>
                    </td>
                  </tr>
                )}

                {editing === p.id && (
                  <tr key={`${p.id}-edit`}>
                    <td colSpan={6} className="px-4 pb-4">
                      <EditForm playbook={p} onSave={(data: any) => handleUpdate(p.id, data)} onCancel={() => setEditing(null)} />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-gray-500 text-center py-10 text-sm">No playbooks found</p>}
      </div>
    </div>
  );
}

function EditForm({ playbook, onSave, onCancel }: { playbook: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [symptoms, setSymptoms] = useState(playbook.symptoms?.join('\n') || '');
  const [steps, setSteps] = useState(playbook.diagnosticSteps?.join('\n') || '');
  const [procedure, setProcedure] = useState(playbook.resolutionProcedure?.join('\n') || '');
  const [action, setAction] = useState(playbook.autoResolveAction || '');

  const save = () => onSave({
    symptoms: symptoms.split('\n').map((s: string) => s.trim()).filter(Boolean),
    diagnosticSteps: steps.split('\n').map((s: string) => s.trim()).filter(Boolean),
    resolutionProcedure: procedure.split('\n').map((s: string) => s.trim()).filter(Boolean),
    autoResolveAction: action || null,
  });

  return (
    <div className="bg-gray-900 rounded-lg p-4 space-y-3">
      {[['Symptoms', symptoms, setSymptoms], ['Diagnostic Steps', steps, setSteps], ['Resolution Procedure', procedure, setProcedure]].map(([label, val, setter]: any) => (
        <div key={label}>
          <p className="text-[10px] text-gray-500 mb-1">{label} (one per line)</p>
          <textarea value={val} onChange={e => setter(e.target.value)} rows={3}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-xs text-gray-100 outline-none focus:border-emerald-500 resize-none" />
        </div>
      ))}
      <input value={action} onChange={e => setAction(e.target.value)} placeholder="Auto resolve action (optional)"
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-xs text-gray-100 outline-none focus:border-emerald-500" />
      <div className="flex gap-2">
        <button onClick={save} className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-500">Save</button>
        <button onClick={onCancel} className="px-3 py-1.5 bg-gray-700 text-gray-300 text-xs rounded hover:bg-gray-600">Cancel</button>
      </div>
    </div>
  );
}
