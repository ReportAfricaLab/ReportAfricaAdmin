'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';

export default function ElectionsAdminPage() {
  const [data, setData] = useState<any>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = () => adminAPI.elections().then(setData).catch(() => {});
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🗳️ Election Reports</h1>
      <div className="space-y-3">
        {data?.reports?.map((r: any) => (
          <div key={r.id} onClick={() => setExpanded(expanded === r.id ? null : r.id)}
            className="bg-gray-800 rounded-xl border border-gray-700 p-5 cursor-pointer hover:border-emerald-500 transition">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold text-white ${r.type === 'violence' ? 'bg-red-600' : r.type === 'result_upload' ? 'bg-green-600' : 'bg-orange-600'}`}>{r.type?.replace('_', ' ').toUpperCase()}</span>
                  {r.state && <span className="text-xs text-gray-400">{r.state}</span>}
                  {r.pollingUnit && <span className="text-xs text-gray-500">· PU: {r.pollingUnit}</span>}
                  {r.isVerifiedObserver && <span className="text-[10px] text-emerald-400 font-bold">✓ OBSERVER</span>}
                </div>
                <p className={`text-sm text-gray-200 mt-1 ${expanded === r.id ? '' : 'line-clamp-2'}`}>{r.description || r.electionName}</p>
              </div>
              {!r.isVerifiedObserver && (
                <button onClick={(e) => { e.stopPropagation(); adminAPI.verifyObserver(r.id).then(load); }}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-500 ml-3">Mark Observer</button>
              )}
            </div>

            {expanded === r.id && (
              <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                {r.lga && <p className="text-xs text-gray-400">📍 LGA: {r.lga}{r.ward ? ` · Ward: ${r.ward}` : ''}</p>}
                {r.pollingUnit && <p className="text-xs text-gray-400">🏛️ Polling Unit: {r.pollingUnit}</p>}
                {r.latitude && <p className="text-xs text-gray-500">Coords: {Number(r.latitude).toFixed(4)}, {Number(r.longitude).toFixed(4)} · <a href={`https://www.google.com/maps?q=${r.latitude},${r.longitude}`} target="_blank" className="text-emerald-400 hover:underline">Map →</a></p>}
                {r.results && Object.keys(r.results).length > 0 && (
                  <div className="p-3 bg-gray-900 rounded-lg">
                    <p className="text-xs font-semibold text-gray-300 mb-2">📊 Results:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(r.results).map(([party, votes]) => (
                        <div key={party} className="flex justify-between text-xs">
                          <span className="text-gray-300">{party}</span>
                          <span className="text-white font-bold">{String(votes)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {r.media?.length > 0 && (
                  <div className="flex gap-2">
                    {r.media.map((m: any, i: number) => (
                      <div key={i} className="w-20 h-20 rounded overflow-hidden bg-gray-900">
                        {m.type?.startsWith('video') ? (
                          <video src={m.url} className="w-full h-full object-cover" controls />
                        ) : (
                          <img src={m.url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500">Election: {r.electionName} · {new Date(r.createdAt).toLocaleString()}</p>
                <p className="text-xs text-gray-500">By: {r.user?.displayName || 'Anonymous'}</p>
              </div>
            )}

            {expanded !== r.id && <p className="text-xs text-gray-500 mt-1">By: {r.user?.displayName || 'Anonymous'} · {new Date(r.createdAt).toLocaleString()}</p>}
          </div>
        ))}
        {data?.reports?.length === 0 && <p className="text-gray-500 text-center py-10">No election reports</p>}
      </div>
    </div>
  );
}
