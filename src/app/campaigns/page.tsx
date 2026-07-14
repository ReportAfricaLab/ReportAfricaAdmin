'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';

export default function CampaignsPage() {
  const [data, setData] = useState<any>(null);

  const load = () => adminAPI.campaigns(1, 'pending_review').then(setData).catch(() => {});
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Campaign Review</h1>
      <div className="space-y-4">
        {data?.campaigns?.map((c: any) => (
          <div key={c.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{c.title}</h3>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{c.description}</p>
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  <span>Category: {c.category}</span>
                  <span>Target: {c.currency} {Number(c.targetAmount).toLocaleString()}</span>
                  <span>By: {c.author?.displayName}</span>
                  {c.isEmergency && <span className="text-red-400 font-bold">🚨 EMERGENCY</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => adminAPI.approveCampaign(c.id).then(load)}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-500">Approve</button>
                <button onClick={() => adminAPI.rejectCampaign(c.id).then(load)}
                  className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-500">Reject</button>
              </div>
            </div>
          </div>
        ))}
        {data?.campaigns?.length === 0 && <p className="text-gray-500 text-center py-10">No campaigns pending review</p>}
      </div>
    </div>
  );
}
