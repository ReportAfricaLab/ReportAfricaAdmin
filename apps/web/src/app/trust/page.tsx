'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const TRUST_LEVELS = [
  { name: 'new_reporter', label: 'New Reporter', color: '#6B7280', minScore: 0 },
  { name: 'community_reporter', label: 'Community Reporter', color: '#2563EB', minScore: 50 },
  { name: 'trusted_reporter', label: 'Trusted Reporter', color: '#059669', minScore: 200 },
  { name: 'elite_reporter', label: 'Elite Reporter', color: '#7C3AED', minScore: 500 },
  { name: 'investigative_reporter', label: 'Investigative Reporter', color: '#DC2626', minScore: 1000 },
];

const BADGE_LABELS: Record<string, { icon: string; label: string }> = {
  first_report: { icon: '📝', label: 'First Report' },
  active_reporter: { icon: '🔥', label: 'Active Reporter (10+)' },
  prolific_reporter: { icon: '⭐', label: 'Prolific Reporter (50+)' },
  trusted: { icon: '✅', label: 'Trusted (100+ score)' },
  elite: { icon: '💎', label: 'Elite (500+ score)' },
};

export default function TrustPage() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/trust/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then(setProfile).finally(() => setLoading(false));
  }, [token]);

  if (!token) return <div className="max-w-md mx-auto px-4 py-20 text-center text-gray-400">Please log in</div>;
  if (loading) return <div className="max-w-md mx-auto px-4 py-20 text-center text-gray-400">Loading...</div>;
  if (!profile) return <div className="max-w-md mx-auto px-4 py-20 text-center text-gray-400">Could not load trust profile</div>;

  const currentLevel = TRUST_LEVELS.find((l) => l.name === profile.trustLevel) || TRUST_LEVELS[0];
  const nextLevel = profile.nextLevel;
  const progress = nextLevel ? Math.min(100, Math.round(((profile.trustScore - currentLevel.minScore) / (nextLevel.pointsNeeded + profile.trustScore - currentLevel.minScore)) * 100)) : 100;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">🛡️ Trust Profile</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center mb-6">
        <p className="text-5xl font-bold text-[#0F7B6C]">{profile.trustScore}</p>
        <p className="text-sm text-gray-500 mt-2">Trust Score</p>
        <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full" style={{ backgroundColor: currentLevel.color + '15' }}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentLevel.color }} />
          <span className="text-sm font-semibold" style={{ color: currentLevel.color }}>{currentLevel.label}</span>
        </div>
      </div>

      {nextLevel && (
        <div className="mb-6">
          <p className="text-xs text-gray-500 mb-2 capitalize">Next: {nextLevel.name.replace('_', ' ')} ({nextLevel.pointsNeeded} points needed)</p>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#0F7B6C] rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
          <p className="text-2xl font-bold text-gray-900">{profile.totalReports}</p>
          <p className="text-xs text-gray-500">Reports</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
          <p className="text-2xl font-bold text-gray-900">{profile.totalUpvotes}</p>
          <p className="text-xs text-gray-500">Upvotes</p>
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-3">🏅 Badges Earned</h2>
      {profile.badges?.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {profile.badges.map((badge: string) => {
            const info = BADGE_LABELS[badge] || { icon: '🏅', label: badge };
            return (
              <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700">
                {info.icon} {info.label}
              </span>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center">Keep reporting to earn badges!</p>
      )}
    </div>
  );
}
