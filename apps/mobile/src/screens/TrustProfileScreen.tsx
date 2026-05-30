import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import api from '../services/api';
import { theme } from '../theme';

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

export default function TrustProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/trust/profile').then((res) => setProfile(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.center}><Text style={styles.loadingText}>Loading...</Text></View>;
  if (!profile) return <View style={styles.center}><Text style={styles.loadingText}>Could not load trust profile</Text></View>;

  const currentLevel = TRUST_LEVELS.find((l) => l.name === profile.trustLevel) || TRUST_LEVELS[0];
  const nextLevel = profile.nextLevel;
  const progress = nextLevel ? Math.min(100, Math.round(((profile.trustScore - (currentLevel.minScore)) / (nextLevel.pointsNeeded + profile.trustScore - currentLevel.minScore)) * 100)) : 100;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🛡️ Trust Profile</Text>

      {/* Score + Level */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreValue}>{profile.trustScore}</Text>
        <Text style={styles.scoreLabel}>Trust Score</Text>
        <View style={[styles.levelBadge, { backgroundColor: currentLevel.color + '20' }]}>
          <View style={[styles.levelDot, { backgroundColor: currentLevel.color }]} />
          <Text style={[styles.levelText, { color: currentLevel.color }]}>{currentLevel.label}</Text>
        </View>
      </View>

      {/* Progress to Next Level */}
      {nextLevel && (
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Next: {nextLevel.name.replace('_', ' ')} ({nextLevel.pointsNeeded} points needed)</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{profile.totalReports}</Text>
          <Text style={styles.statLabel}>Reports</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{profile.totalUpvotes}</Text>
          <Text style={styles.statLabel}>Upvotes</Text>
        </View>
      </View>

      {/* Badges */}
      <Text style={styles.badgesTitle}>🏅 Badges Earned</Text>
      {profile.badges?.length > 0 ? (
        <View style={styles.badgesGrid}>
          {profile.badges.map((badge: string) => {
            const info = BADGE_LABELS[badge] || { icon: '🏅', label: badge };
            return (
              <View key={badge} style={styles.badgeItem}>
                <Text style={styles.badgeIcon}>{info.icon}</Text>
                <Text style={styles.badgeLabel}>{info.label}</Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={styles.noBadges}>Keep reporting to earn badges!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.light.background, padding: 16, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: theme.colors.light.textSecondary },
  heading: { fontSize: theme.fontSize.xl, fontWeight: '700', color: theme.colors.light.text, marginBottom: 20 },
  scoreCard: { backgroundColor: '#fff', padding: 24, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.light.border, marginBottom: 20 },
  scoreValue: { fontSize: 48, fontWeight: '700', color: theme.colors.primary },
  scoreLabel: { fontSize: 14, color: theme.colors.light.textSecondary, marginTop: 4 },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  levelDot: { width: 10, height: 10, borderRadius: 5 },
  levelText: { fontSize: 13, fontWeight: '600' },
  progressSection: { marginBottom: 20 },
  progressLabel: { fontSize: 12, color: theme.colors.light.textSecondary, marginBottom: 6, textTransform: 'capitalize' },
  progressBar: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.light.border },
  statValue: { fontSize: 22, fontWeight: '700', color: theme.colors.light.text },
  statLabel: { fontSize: 12, color: theme.colors.light.textSecondary, marginTop: 4 },
  badgesTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.light.text, marginBottom: 12 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.light.border },
  badgeIcon: { fontSize: 16 },
  badgeLabel: { fontSize: 12, fontWeight: '500', color: theme.colors.light.text },
  noBadges: { fontSize: 13, color: theme.colors.light.textSecondary, textAlign: 'center', marginTop: 12 },
});
