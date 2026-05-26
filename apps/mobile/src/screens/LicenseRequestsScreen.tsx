import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';

const API_URL = 'http://10.162.41.17:3001/api/v1';

export default function LicenseRequestsScreen() {
  const { token } = useAppStore();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await axios.get(`${API_URL}/media-licensing/incoming`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRespond = async (id: string, action: 'approved' | 'rejected') => {
    try {
      await axios.patch(`${API_URL}/media-licensing/${id}/respond`, { action }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Done', `Request ${action}`);
      load();
    } catch {
      Alert.alert('Error', 'Failed to respond');
    }
  };

  const renderRequest = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orgName}>{item.organizationName}</Text>
        <Text style={[styles.status, item.status === 'pending' ? styles.statusPending : item.status === 'approved' ? styles.statusApproved : styles.statusRejected]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.orgType}>{item.organizationType.replace('_', ' ')}</Text>
      <Text style={styles.purpose} numberOfLines={3}>{item.purpose}</Text>

      {item.offeredAmount && (
        <Text style={styles.amount}>{item.currency} {Number(item.offeredAmount).toLocaleString()} offered</Text>
      )}

      {item.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.approveBtn} onPress={() => handleRespond(item.id, 'approved')}>
            <Text style={styles.approveBtnText}>✓ Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRespond(item.id, 'rejected')}>
            <Text style={styles.rejectBtnText}>✕ Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>License Requests</Text>
        <Text style={styles.headerSub}>Media houses requesting your content</Text>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderRequest}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyText}>{loading ? 'Loading...' : 'No license requests yet'}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.light.background },
  header: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.light.border },
  headerTitle: { fontSize: theme.fontSize.xl, fontWeight: '700', color: theme.colors.primary },
  headerSub: { fontSize: theme.fontSize.xs, color: theme.colors.light.textSecondary, marginTop: 2 },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: theme.borderRadius.md, padding: 16, borderWidth: 1, borderColor: theme.colors.light.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orgName: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.light.text },
  orgType: { fontSize: 12, color: theme.colors.light.textSecondary, textTransform: 'capitalize', marginBottom: 8 },
  purpose: { fontSize: theme.fontSize.sm, color: theme.colors.light.textSecondary, lineHeight: 20, marginBottom: 8 },
  amount: { fontSize: 13, fontWeight: '600', color: theme.colors.primary, marginBottom: 12 },
  status: { fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  statusPending: { backgroundColor: '#fef3c7', color: '#92400e' },
  statusApproved: { backgroundColor: '#d1fae5', color: '#065f46' },
  statusRejected: { backgroundColor: '#fee2e2', color: '#991b1b' },
  actions: { flexDirection: 'row', gap: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.light.border },
  approveBtn: { flex: 1, paddingVertical: 10, backgroundColor: theme.colors.primary, borderRadius: 8, alignItems: 'center' },
  approveBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  rejectBtn: { flex: 1, paddingVertical: 10, backgroundColor: '#fef2f2', borderRadius: 8, alignItems: 'center' },
  rejectBtnText: { color: '#dc2626', fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: theme.fontSize.md, color: theme.colors.light.textSecondary },
});
