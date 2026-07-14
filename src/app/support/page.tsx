'use client';
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/lib/api';

const TIER_STYLE: Record<number, string> = {
  1: 'bg-emerald-600/20 text-emerald-400',
  2: 'bg-amber-600/20 text-amber-400',
  3: 'bg-red-600/20 text-red-400',
};

const STATUS_STYLE: Record<string, string> = {
  open: 'bg-gray-700 text-gray-300',
  escalated: 'bg-amber-600/20 text-amber-400',
  resolving: 'bg-blue-600/20 text-blue-400',
  resolved: 'bg-emerald-600/20 text-emerald-400',
  rejected: 'bg-gray-600/20 text-gray-500',
};

export default function AMARADashboard() {
  const [stats, setStats] = useState<any>(null);
  const [weekly, setWeekly] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, i, w] = await Promise.all([
        adminAPI.support.stats(),
        adminAPI.support.incidents(1),
        adminAPI.support.weeklyStats(),
      ]);
      setStats(s);
      setIncidents(i.data || []);
      setWeekly(w);
    } catch { }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const statCards = [
    { label: 'Incidents Today', value: stats?.todayCount ?? '—', color: 'text-blue-400' },
    { label: 'Auto-Resolved', value: stats ? `${stats.automationRate}%` : '—', color: 'text-emerald-400' },
    { label: 'Open Escalations', value: stats?.escalated ?? '—', color: 'text-amber-400' },
    { label: 'Avg Resolution (min)', value: stats?.mttrMinutes ?? '—', color: 'text-purple-400' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">🛡️ AMARA Support</h1>
          <p className="text-sm text-gray-400 mt-1">AI-powered incident detection and escalation</p>
        </div>
        <div className="flex gap-2">
          <a href="/support/playbooks" className="px-3 py-1.5 bg-gray-800 border border-gray-700 text-sm text-gray-300 rounded hover:border-emerald-500 transition">📋 Playbooks</a>
          <a href="/support/escalations" className="px-3 py-1.5 bg-amber-600/20 border border-amber-600/40 text-sm text-amber-400 rounded hover:bg-amber-600/30 transition">⚠️ Escalations</a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map(s => (
          <div key={s.label} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Weekly Stats */}
      {weekly && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">📊 Weekly Summary <span className="text-gray-500 font-normal text-xs ml-1">{weekly.period}</span></h2>
            {weekly.promotionReady > 0 && (
              <a href="/support/playbooks" className="text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-600/40 px-2 py-1 rounded hover:bg-emerald-600/30 transition">
                ⬆️ {weekly.promotionReady} playbook{weekly.promotionReady > 1 ? 's' : ''} ready for Tier 1
              </a>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Total', value: weekly.total, color: 'text-gray-200' },
              { label: 'Resolved', value: `${weekly.resolved} (${weekly.automationRate}%)`, color: 'text-emerald-400' },
              { label: 'MTTR', value: `${weekly.mttrMinutes}m`, color: 'text-purple-400' },
              { label: 'Tier 3', value: weekly.tier3Count, color: weekly.tier3Count > 0 ? 'text-red-400' : 'text-gray-500' },
              { label: 'New Playbooks', value: weekly.newPlaybooks, color: 'text-blue-400' },
            ].map(s => (
              <div key={s.label} className="bg-gray-900 rounded-lg p-3">
                <p className="text-[10px] text-gray-500">{s.label}</p>
                <p className={`text-lg font-bold mt-0.5 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
          {weekly.byFeature?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {weekly.byFeature.slice(0, 5).map((f: any) => (
                <span key={f.feature} className="text-[10px] bg-gray-700 text-gray-300 px-2 py-1 rounded">
                  {f.feature}: <span className="text-white font-semibold">{f.count}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Incident Feed */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold text-sm">Live Incident Feed</h2>
          <span className="text-[10px] text-gray-500">Auto-refreshes every 10s</span>
        </div>

        {loading && <p className="text-gray-500 text-center py-10 text-sm">Loading...</p>}

        <div className="divide-y divide-gray-700">
          {incidents.map((inc: any) => (
            <div key={inc.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${TIER_STYLE[inc.tier] || TIER_STYLE[2]}`}>
                      TIER {inc.tier}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] rounded ${STATUS_STYLE[inc.status] || STATUS_STYLE['open']}`}>
                      {inc.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-gray-500 capitalize">{inc.feature}</span>
                    {inc.playbook && <span className="text-[10px] text-emerald-400">{inc.playbook.issueId}</span>}
                  </div>
                  <p className="text-sm text-gray-200 truncate">{inc.errorMessage}</p>
                  {inc.amaraRecommendation && (
                    <p className="text-xs text-gray-400 mt-1">🤖 AMARA: {inc.amaraRecommendation}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    {inc.amaraConfidence != null && (
                      <span className="text-[10px] text-gray-500">Confidence: <span className="text-gray-300">{inc.amaraConfidence}%</span></span>
                    )}
                    <span className="text-[10px] text-gray-600">{new Date(inc.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => setExpanded(expanded === inc.id ? null : inc.id)}
                  className="text-xs text-gray-500 hover:text-gray-300 shrink-0"
                >
                  {expanded === inc.id ? '▲ Hide' : '▼ Details'}
                </button>
              </div>

              {expanded === inc.id && (
                <div className="mt-3 p-3 bg-gray-900 rounded-lg text-xs text-gray-400 font-mono overflow-auto max-h-48">
                  <pre>{JSON.stringify(inc.contextPackage, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
          {!loading && incidents.length === 0 && (
            <p className="text-gray-500 text-center py-10 text-sm">No incidents yet — AMARA is watching 👁️</p>
          )}
        </div>
      </div>
    </div>
  );
}
