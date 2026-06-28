import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { electionsAPI } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';

type Tab = 'feed' | 'live' | 'incidents' | 'results' | 'hotspots' | 'parallel';

const ELECTIONS = ['2027 General Election', '2025 Off-Cycle Governorship'];

const INCIDENT_COLORS: Record<string, string> = {
  violence: '#DC2626',
  vote_buying: '#F97316',
  intimidation: '#7C2D12',
  ballot_snatching: '#991B1B',
  result_upload: '#059669',
  observer_report: '#2563EB',
};

export default function ElectionsScreen() {
  const { country } = useAppStore();
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<Tab>('feed');
  const [data, setData] = useState<any[]>([]);
  const [liveStreams, setLiveStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [election, setElection] = useState(ELECTIONS[0]);

  useEffect(() => { loadData(); }, [tab, country, election]);

  const loadData = async () => {
    setLoading(true);
    try {
      let res;
      switch (tab) {
        case 'feed': res = await electionsAPI.getFeed(country, election); break;
        case 'live': res = await electionsAPI.getLive(country, election); setLiveStreams(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []); setLoading(false); return;
        case 'incidents': res = await electionsAPI.getIncidents(country); break;
        case 'results': res = await electionsAPI.getResults(country, election); break;
        case 'hotspots': res = await electionsAPI.getHotspots(country, election); break;
      }
      setData(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  const renderFeedItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ReportDetail', { id: item.id })}>
      <View style={styles.cardRow}>
        <View style={[styles.typeBadge, { backgroundColor: INCIDENT_COLORS[item.type] || '#6B7280' }]}>
          <Text style={styles.typeBadgeText}>{item.type?.replace('_', ' ').toUpperCase()}</Text>
        </View>
        {item.state && <Text style={styles.stateMeta}>{item.state}</Text>}
        {item.verificationStatus === 'citizen_verified' && <Text style={styles.verifiedBadge}>✅ Verified</Text>}
        {item.verificationStatus === 'disputed' && <Text style={styles.disputedBadge}>⚠️ Disputed</Text>}
      </View>
      {item.overVotingFlag && (
        <View style={styles.overVoteBadge}>
          <Text style={styles.overVoteText}>🚨 Over-voting detected ({Object.values(item.results || {}).reduce((a: number, b: any) => a + Number(b), 0)} votes)</Text>
        </View>
      )}
      <Text style={styles.cardDesc} numberOfLines={3}>{item.description || item.electionName}</Text>
      {item.results && Object.keys(item.results).length > 0 && (
        <View style={styles.resultsBox}>
          {Object.entries(item.results).map(([party, votes]) => (
            <View key={party} style={styles.resultRow}>
              <Text style={styles.resultParty}>{party}</Text>
              <Text style={styles.resultVotes}>{String(votes)}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.cardFooter}>
        <Text style={styles.cardTime}>
          {item.user?.displayName || 'Anonymous'} · {new Date(item.createdAt).toLocaleString()}
          {item.isVerifiedObserver ? ' ✓ Observer' : ''}
        </Text>
        {item.resultHash && <Text style={styles.sealedBadge}>🔒 Sealed</Text>}
      </View>
    </TouchableOpacity>
  );

  const renderHotspot = ({ item }: { item: any }) => (
    <View style={styles.hotspotCard}>
      <View style={styles.hotspotHeader}>
        <Text style={styles.hotspotState}>{item.state || 'Unknown'}</Text>
        <View style={[styles.typeBadge, { backgroundColor: INCIDENT_COLORS[item.type] || '#6B7280' }]}>
          <Text style={styles.typeBadgeText}>{item.type?.replace('_', ' ')}</Text>
        </View>
      </View>
      <Text style={styles.hotspotCount}>{item.count}</Text>
      <Text style={styles.hotspotLabel}>reports</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>🗳️ Election Monitor</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={[styles.reportBtn, { backgroundColor: '#059669' }]} onPress={() => navigation.navigate('CreateElectionReport', { quickResult: true })}>
              <Text style={styles.reportBtnText}>📊 Results</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.reportBtn, { backgroundColor: '#000' }]} onPress={() => navigation.navigate('GoLive', { election, state: '' })}>
              <Text style={styles.reportBtnText}>🔴 Go Live</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportBtn} onPress={() => navigation.navigate('CreateElectionReport')}>
              <Text style={styles.reportBtnText}>+ Report</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.electionSelector}>
          {ELECTIONS.map((e) => (
            <TouchableOpacity key={e} style={[styles.electionChip, election === e && styles.electionChipActive]} onPress={() => setElection(e)}>
              <Text style={[styles.electionChipText, election === e && styles.electionChipTextActive]} numberOfLines={1}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.tabBar}>
        {([['feed', '📰 Feed'], ['live', '🔴 Live'], ['incidents', '⚠️ Incidents'], ['results', '📊 Results'], ['hotspots', '🔥 Hot'], ['parallel', '🗳️ PVT']] as [Tab, string][]).map(([key, label]) => (
          <TouchableOpacity key={key} style={[styles.tab, tab === key && styles.tabActive]} onPress={() => setTab(key)}>
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'live' ? (
        <FlatList
          data={liveStreams}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🔴</Text>
              <Text style={styles.emptyTitle}>{loading ? 'Loading...' : 'No election livestreams'}</Text>
              <Text style={styles.emptyDesc}>Go live from a polling unit during elections</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('GoLive', { watchStreamId: item.id })}>
              <View style={styles.cardRow}>
                <View style={[styles.typeBadge, { backgroundColor: '#DC2626' }]}>
                  <Text style={styles.typeBadgeText}>🔴 LIVE</Text>
                </View>
                {item.electionState && <Text style={styles.stateMeta}>{item.electionState}</Text>}
                <Text style={[styles.stateMeta, { marginLeft: 'auto' }]}>👁 {item.viewerCount || 0}</Text>
              </View>
              <Text style={styles.cardDesc}>{item.title}</Text>
              <Text style={styles.cardTime}>{item.user?.displayName || 'Anonymous'} · Started {new Date(item.startedAt).toLocaleTimeString()}</Text>
            </TouchableOpacity>
          )}
        />
      ) : tab === 'parallel' ? (
        <ParallelCountTab country={country} election={election} />
      ) : (
      <FlatList
        data={data}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>{tab === 'incidents' ? '✅' : '🗳️'}</Text>
            <Text style={styles.emptyTitle}>{loading ? 'Loading...' : tab === 'incidents' ? 'No incidents reported' : 'No data yet'}</Text>
            <Text style={styles.emptyDesc}>Reports will appear here during elections</Text>
          </View>
        }
        renderItem={tab === 'hotspots' ? renderHotspot : renderFeedItem}
        numColumns={tab === 'hotspots' ? 2 : 1}
        key={tab === 'hotspots' ? 'grid' : 'list'}
        columnWrapperStyle={tab === 'hotspots' ? styles.hotspotRow : undefined}
      />
      )}
    </View>
  );
}

// === Parallel Vote Tabulation ===
function ParallelCountTab({ country, election }: { country: string; election: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    electionsAPI.getParallelCount(country, election)
      .then(r => setData(r.data || r))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [country, election]);

  if (loading) return <View style={styles.emptyBox}><Text style={styles.emptyTitle}>Loading parallel count...</Text></View>;
  if (!data?.stateResults || Object.keys(data.stateResults).length === 0) {
    return <View style={styles.emptyBox}><Text style={styles.emptyIcon}>🗳️</Text><Text style={styles.emptyTitle}>No results uploaded yet</Text><Text style={styles.emptyDesc}>As citizens upload PU results, the parallel count appears here</Text></View>;
  }

  const states = Object.entries(data.stateResults).sort((a: any, b: any) => b[1].puCount - a[1].puCount);

  return (
    <FlatList
      data={states}
      keyExtractor={([state]) => state}
      contentContainerStyle={styles.pvtContainer}
      ListHeaderComponent={
        <View style={styles.pvtInfo}>
          <Text style={styles.pvtInfoTitle}>🗳️ Citizen Parallel Vote Tabulation</Text>
          <Text style={styles.pvtInfoDesc}>Vote totals from citizen-uploaded PU results. Total PUs: {data.totalPUs}</Text>
        </View>
      }
      renderItem={({ item: [state, info] }: { item: [string, any] }) => (
        <View style={styles.pvtStateCard}>
          <View style={styles.pvtStateHeader}>
            <Text style={styles.pvtStateName}>{state}</Text>
            <Text style={styles.pvtPuCount}>{info.puCount} PUs</Text>
          </View>
          {Object.entries(info.parties).map(([party, votes]) => (
            <View key={party} style={styles.pvtPartyRow}>
              <Text style={styles.pvtParty}>{party}</Text>
              <Text style={styles.pvtVotes}>{Number(votes).toLocaleString()}</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
            {info.verified > 0 && <Text style={styles.verifiedBadge}>✓ {info.verified} verified</Text>}
            {info.disputed > 0 && <Text style={styles.disputedBadge}>⚠️ {info.disputed} disputed</Text>}
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.light.background },
  header: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.light.border },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: theme.colors.light.text },
  reportBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  reportBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  electionSelector: { flexDirection: 'row', gap: 8, marginTop: 10 },
  electionChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: theme.colors.light.background, borderWidth: 1, borderColor: theme.colors.light.border },
  electionChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  electionChipText: { fontSize: 11, color: theme.colors.light.textSecondary },
  electionChipTextActive: { color: '#fff', fontWeight: '600' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.light.border },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: theme.colors.primary },
  tabText: { fontSize: 11, color: theme.colors.light.textSecondary, fontWeight: '600' },
  tabTextActive: { color: theme.colors.primary },
  listContent: { padding: 16, gap: 10 },
  // Feed/Incidents cards
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: theme.colors.light.border },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeBadgeText: { fontSize: 9, fontWeight: '700', color: '#fff', textTransform: 'capitalize' },
  stateMeta: { fontSize: 11, color: theme.colors.light.textSecondary },
  verifiedBadge: { fontSize: 9, color: '#059669', fontWeight: '700', backgroundColor: '#D1FAE5', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  disputedBadge: { fontSize: 9, color: '#DC2626', fontWeight: '700', backgroundColor: '#FEE2E2', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  overVoteBadge: { backgroundColor: '#FEF3C7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 6 },
  overVoteText: { fontSize: 10, color: '#92400E', fontWeight: '600' },
  sealedBadge: { fontSize: 9, color: '#2563EB', fontWeight: '600', backgroundColor: '#EFF6FF', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  cardDesc: { fontSize: 13, color: theme.colors.light.text, lineHeight: 19 },
  resultsBox: { marginTop: 8, backgroundColor: theme.colors.light.background, borderRadius: 8, padding: 10 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  resultParty: { fontSize: 12, fontWeight: '500', color: theme.colors.light.text },
  resultVotes: { fontSize: 12, fontWeight: '700', color: theme.colors.light.text },
  cardTime: { fontSize: 11, color: theme.colors.light.textSecondary },
  // Hotspots
  hotspotRow: { gap: 10 },
  hotspotCard: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: theme.colors.light.border },
  hotspotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  hotspotState: { fontSize: 13, fontWeight: '600', color: theme.colors.light.text },
  hotspotCount: { fontSize: 24, fontWeight: '800', color: theme.colors.light.text },
  hotspotLabel: { fontSize: 11, color: theme.colors.light.textSecondary },
  // Parallel
  pvtContainer: { padding: 16 },
  pvtInfo: { backgroundColor: '#EFF6FF', borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#BFDBFE' },
  pvtInfoTitle: { fontSize: 13, fontWeight: '700', color: '#1E40AF' },
  pvtInfoDesc: { fontSize: 11, color: '#3B82F6', marginTop: 4 },
  pvtStateCard: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: theme.colors.light.border },
  pvtStateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  pvtStateName: { fontSize: 14, fontWeight: '700', color: theme.colors.light.text },
  pvtPuCount: { fontSize: 10, color: theme.colors.light.textSecondary, backgroundColor: theme.colors.light.background, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  pvtPartyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  pvtParty: { fontSize: 12, fontWeight: '500', color: theme.colors.light.text },
  pvtVotes: { fontSize: 12, fontWeight: '700', color: theme.colors.light.text },
  // Empty
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: theme.colors.light.text },
  emptyDesc: { fontSize: 12, color: theme.colors.light.textSecondary, marginTop: 4 },
});
