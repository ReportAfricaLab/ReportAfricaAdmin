import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { theme } from '../theme';

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = () => {
    api.get('/notifications/history').then((res) => {
      setNotifications(res.data?.data || []);
      setUnreadCount(res.data?.unreadCount || 0);
    }).finally(() => setLoading(false));
  };

  const handleTap = async (item: any) => {
    if (!item.isRead) {
      await api.patch(`/notifications/${item.id}/read`).catch(() => {});
      setNotifications((prev) => prev.map((n) => n.id === item.id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    // Navigate based on type
    if (item.data?.reportId) navigation.navigate('ReportDetail', { id: item.data.reportId });
    else if (item.data?.userId) navigation.navigate('Followers', { userId: item.data.userId });
  };

  const handleMarkAllRead = async () => {
    await api.patch('/notifications/read-all').catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={[styles.row, !item.isRead && styles.rowUnread]} onPress={() => handleTap(item)}>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowBody} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.rowTime}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  if (loading) return <View style={styles.center}><Text style={styles.loadingText}>Loading...</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>🔔 Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>No notifications yet</Text>
      ) : (
        <FlatList data={notifications} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={styles.list} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.light.background, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: theme.colors.light.textSecondary },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  heading: { fontSize: theme.fontSize.xl, fontWeight: '700', color: theme.colors.light.text },
  markAllRead: { fontSize: 12, color: theme.colors.primary, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  row: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.light.border, flexDirection: 'row', alignItems: 'center' },
  rowUnread: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 13, fontWeight: '600', color: theme.colors.light.text },
  rowBody: { fontSize: 12, color: theme.colors.light.textSecondary, marginTop: 2 },
  rowTime: { fontSize: 10, color: theme.colors.light.textSecondary, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary, marginLeft: 8 },
  emptyText: { textAlign: 'center', color: theme.colors.light.textSecondary, marginTop: 40 },
});
