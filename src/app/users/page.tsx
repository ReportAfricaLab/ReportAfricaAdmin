'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';

export default function UsersPage() {
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const load = () => adminAPI.users(1, search || undefined).then(setData).catch(() => {});
  useEffect(() => { load(); }, [search]);

  const handleAction = async (id: string, action: 'suspend' | 'ban' | 'lift') => {
    const labels = { suspend: 'Suspend this user?', ban: 'Ban this user permanently?', lift: 'Lift restriction on this user?' };
    if (!confirm(labels[action])) return;
    try {
      if (action === 'suspend') await adminAPI.suspendUser(id);
      else if (action === 'ban') await adminAPI.banUser(id);
      else await adminAPI.liftRestriction(id);
      setMessage(`✅ User ${action === 'lift' ? 'restriction lifted' : action + 'ed'}`);
      load();
    } catch (e: any) { setMessage('❌ ' + (e.message || 'Failed')); }
    setTimeout(() => setMessage(''), 3000);
  };

  const getStatusBadge = (user: any) => {
    const status = user.accountStatus || 'active';
    if (status === 'banned') return <span className="text-[10px] px-2 py-0.5 bg-red-600/20 text-red-400 rounded font-bold">BANNED</span>;
    if (status === 'suspended') return <span className="text-[10px] px-2 py-0.5 bg-amber-600/20 text-amber-400 rounded font-bold">SUSPENDED</span>;
    return <span className="text-[10px] px-2 py-0.5 bg-emerald-600/20 text-emerald-400 rounded font-bold">ACTIVE</span>;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search username..."
        className="w-full max-w-md px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 mb-6 outline-none focus:border-emerald-500" />

      {message && <div className="mb-4 p-3 rounded-lg bg-gray-800 border border-gray-700 text-sm">{message}</div>}

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-750 border-b border-gray-700">
            <tr className="text-left text-gray-400">
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Trust</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data?.users?.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-750">
                <td className="px-4 py-3 font-medium">{user.username}</td>
                <td className="px-4 py-3 text-gray-400">{user.email}</td>
                <td className="px-4 py-3">{user.country}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-gray-700 rounded text-xs">{user.role}</span></td>
                <td className="px-4 py-3 text-emerald-400">{user.trustScore}</td>
                <td className="px-4 py-3">{getStatusBadge(user)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {(user.accountStatus || 'active') === 'active' && (
                      <>
                        <button onClick={() => handleAction(user.id, 'suspend')} className="text-[10px] px-2 py-1 bg-amber-600/20 text-amber-400 rounded hover:bg-amber-600/40">Suspend</button>
                        <button onClick={() => handleAction(user.id, 'ban')} className="text-[10px] px-2 py-1 bg-red-600/20 text-red-400 rounded hover:bg-red-600/40">Ban</button>
                      </>
                    )}
                    {(user.accountStatus === 'suspended' || user.accountStatus === 'banned') && (
                      <button onClick={() => handleAction(user.id, 'lift')} className="text-[10px] px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded hover:bg-emerald-600/40">Lift</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data && <p className="text-xs text-gray-500 mt-4">Total: {data.total} users</p>}
    </div>
  );
}
