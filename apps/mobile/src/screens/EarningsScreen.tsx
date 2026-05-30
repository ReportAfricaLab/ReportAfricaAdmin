import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useI18n } from '../store/useI18n';
import { theme } from '../theme';
import api from '../services/api';

export default function EarningsScreen() {
  const { t } = useI18n();
  const [stats, setStats] = useState<any>(null);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/earnings/stats').then((r) => setStats(r.data)),
      api.get('/earnings').then((r) => setEarnings(r.data || [])),
    ]).finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowSource}>{item.source === 'tip' ? '💰' : item.source === 'media_license' ? '📄' : '🎁'} {item.source.replace('_', ' ')}</Text>
        <Text style={styles.rowDesc}>{item.description || 'Earning'}</Text>
        <Text style={styles.rowDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.rowAmount}>+{item.currency} {Number(item.amount).toLocaleString()}</Text>
    </View>
  );

  if (loading) return <View style={styles.center}><Text style={styles.loadingText}>Loading...</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>💰 My Earnings</Text>

      {stats?.earnings?.length > 0 && (
        <View style={styles.statsRow}>
          {stats.earnings.map((s: any) => (
            <View key={s.currency} style={styles.statBox}>
              <Text style={styles.statValue}>{s.currency} {Number(s.total).toLocaleString()}</Text>
              <Text style={styles.statLabel}>{s.transactions} transactions</Text>
            </View>
          ))}
        </View>
      )}

      {earnings.length === 0 ? (
        <Text style={styles.emptyText}>No earnings yet. Tip income and media license fees will appear here.</Text>
      ) : (
        <FlatList data={earnings} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={styles.list} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.light.background, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: theme.colors.light.textSecondary },
  heading: { fontSize: theme.fontSize.xl, fontWeight: '700', color: theme.colors.light.text, paddingHorizontal: 16, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: '#ecfdf5', padding: 16, borderRadius: 12, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#059669' },
  statLabel: { fontSize: 11, color: '#059669', marginTop: 4 },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.light.border },
  rowLeft: { flex: 1 },
  rowSource: { fontSize: 13, fontWeight: '600', color: theme.colors.light.text, textTransform: 'capitalize' },
  rowDesc: { fontSize: 12, color: theme.colors.light.textSecondary, marginTop: 2 },
  rowDate: { fontSize: 10, color: theme.colors.light.textSecondary, marginTop: 2 },
  rowAmount: { fontSize: 15, fontWeight: '700', color: '#059669' },
  emptyText: { textAlign: 'center', color: theme.colors.light.textSecondary, paddingHorizontal: 32, marginTop: 40 },
});
