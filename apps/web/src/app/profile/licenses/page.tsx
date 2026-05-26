'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function MyLicensesPage() {
  const { token, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!token) return;
    try {
      const [reqs, stats] = await Promise.all([
        api.licensing.incoming(token),
        api.earnings.stats(token),
      ]);
      setRequests(reqs);
      setEarnings(stats);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [token]);

  const handleRespond = async (id: string, action: 'approved' | 'rejected') => {
    if (!token) return;
    await api.licensing.respond(token, id, action);
    load();
  };

  if (!isAuthenticated) return <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">Please sign in to view your licenses.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My License Requests</h1>
      <p className="text-gray-500 mb-6">Media houses requesting to use your content</p>

      {/* Earnings Summary */}
      {earnings?.earnings?.length > 0 && (
        <div className="bg-gradient-to-r from-[#0F7B6C] to-[#0B6E4F] rounded-xl p-6 text-white mb-8">
          <p className="text-sm opacity-80">Total Earnings from Licensing</p>
          {earnings.earnings.map((e: any) => (
            <p key={e.currency} className="text-2xl font-bold mt-1">{e.currency} {Number(e.total).toLocaleString()} <span className="text-sm font-normal opacity-70">({e.transactions} transactions)</span></p>
          ))}
        </div>
      )}

      {/* Requests */}
      {loading ? (
        <p className="text-center text-gray-400 py-10">Loading...</p>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-4xl mb-3">📄</p>
          <p className="text-gray-400">No license requests yet</p>
          <p className="text-xs text-gray-300 mt-1">When media houses want to use your reports, requests will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req: any) => (
            <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{req.organizationName}</h3>
                  <p className="text-xs text-gray-500 capitalize">{req.organizationType.replace('_', ' ')}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-medium ${req.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : req.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {req.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mt-3">{req.purpose}</p>

              <div className="flex gap-4 mt-3 text-xs text-gray-500">
                {req.offeredAmount && <span>Offered: {req.currency} {Number(req.offeredAmount).toLocaleString()}</span>}
                <span>Type: {req.licenseType?.replace('_', ' ')}</span>
                <span>Report: {req.report?.title?.substring(0, 40)}...</span>
              </div>

              {req.status === 'pending' && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button onClick={() => handleRespond(req.id, 'approved')}
                    className="px-4 py-2 bg-[#0F7B6C] text-white text-sm font-medium rounded-lg hover:bg-[#0B6E4F]">
                    ✓ Approve
                  </button>
                  <button onClick={() => handleRespond(req.id, 'rejected')}
                    className="px-4 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100">
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
