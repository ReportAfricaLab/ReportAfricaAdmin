'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';

const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

type Tab = 'pending' | 'milestone';

export default function CampaignsPage() {
  const [tab, setTab] = useState<Tab>('pending');
  const [data, setData] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const notify = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(''), 4000); };

  const loadPending = () => adminAPI.campaigns(1, 'pending_review').then(setData).catch(() => {});

  const loadMilestones = async () => {
    const res = await adminAPI.campaigns(1, 'active').catch(() => null);
    const all: any[] = res?.campaigns || [];
    const pending = all.filter((c: any) => c.milestoneRequired && c.milestoneProofIpfsCid && !c.milestoneVerifiedAt);
    setMilestones(pending);
  };

  useEffect(() => {
    loadPending();
    loadMilestones();
  }, []);

  const handleRelease = async (id: string) => {
    if (!confirm('Verify milestone and release funds to beneficiary?')) return;
    try {
      await adminAPI.verifyMilestone(id);
      notify('✅ Milestone verified — funds released to beneficiary');
      loadMilestones();
    } catch (e: any) { notify('❌ ' + (e.message || 'Failed')); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Campaign Review</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab('pending')}
            className={`px-3 py-1.5 text-xs rounded transition ${tab === 'pending' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            Pending Review
          </button>
          <button onClick={() => setTab('milestone')}
            className={`px-3 py-1.5 text-xs rounded transition flex items-center gap-1.5 ${tab === 'milestone' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            ⏳ Milestone Pending
            {milestones.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{milestones.length}</span>
            )}
          </button>
        </div>
      </div>

      {message && <div className="mb-4 p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm">{message}</div>}

      {/* Pending Review Tab */}
      {tab === 'pending' && (
        <div className="space-y-4">
          {data?.campaigns?.map((c: any) => (
            <div key={c.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-lg">{c.title}</h3>
                    {c.milestoneRequired && (
                      <span className="px-2 py-0.5 text-[10px] bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded">
                        🔒 Milestone Required
                      </span>
                    )}
                    {c.isEmergency && <span className="text-red-400 font-bold text-xs">🚨 EMERGENCY</span>}
                  </div>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{c.description}</p>
                  <div className="flex gap-4 mt-3 text-xs text-gray-500">
                    <span>Category: {c.category}</span>
                    <span>Target: {c.currency} {Number(c.targetAmount).toLocaleString()}</span>
                    <span>By: {c.author?.displayName}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => adminAPI.approveCampaign(c.id).then(loadPending)}
                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-500">Approve</button>
                  <button onClick={() => adminAPI.rejectCampaign(c.id).then(loadPending)}
                    className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-500">Reject</button>
                </div>
              </div>
            </div>
          ))}
          {data?.campaigns?.length === 0 && <p className="text-gray-500 text-center py-10">No campaigns pending review</p>}
        </div>
      )}

      {/* Milestone Pending Tab */}
      {tab === 'milestone' && (
        <div className="space-y-4">
          {milestones.map((c: any) => (
            <div key={c.id} className="bg-gray-800 rounded-xl border border-amber-600/30 p-5">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold">{c.title}</h3>
                    {c.milestoneVerifiedAt ? (
                      <span className="px-2 py-0.5 text-[10px] bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 rounded">
                        ✓ Funds Released
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] bg-amber-600/20 text-amber-400 border border-amber-600/30 rounded">
                        ⏳ Proof Submitted
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">{c.description}</p>
                  <div className="flex gap-4 text-xs text-gray-500 mb-3">
                    <span>Target: {c.currency} {Number(c.targetAmount).toLocaleString()}</span>
                    <span>Raised: {c.currency} {Number(c.raisedAmount || 0).toLocaleString()}</span>
                    <span>By: {c.author?.displayName}</span>
                  </div>
                  {c.milestoneProofIpfsCid && (
                    <a
                      href={`${PINATA_GATEWAY}/${c.milestoneProofIpfsCid}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      📌 View Proof on IPFS →
                    </a>
                  )}
                </div>
                {!c.milestoneVerifiedAt && (
                  <button onClick={() => handleRelease(c.id)}
                    className="shrink-0 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-500">
                    ✓ Release Funds
                  </button>
                )}
              </div>
            </div>
          ))}
          {milestones.length === 0 && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-10 text-center">
              <p className="text-gray-500 text-sm">No milestone proofs pending</p>
              <p className="text-gray-600 text-xs mt-1">Campaigns with submitted proof will appear here</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
