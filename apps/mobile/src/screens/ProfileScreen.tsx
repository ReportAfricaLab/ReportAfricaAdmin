import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';

export default function ProfileScreen() {
  const { user, logout } = useAppStore();
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{user?.displayName || 'Reporter'}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
        <Text style={styles.country}>{user?.country}</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('LicenseRequests')}>
          <Text style={styles.menuIcon}>📄</Text>
          <Text style={styles.menuText}>License Requests</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.light.background },
  header: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.light.border, alignItems: 'center' },
  name: { fontSize: 20, fontWeight: '700', color: theme.colors.light.text },
  username: { fontSize: 14, color: theme.colors.light.textSecondary, marginTop: 2 },
  country: { fontSize: 12, color: theme.colors.primary, marginTop: 4 },
  menu: { padding: 16, gap: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.light.border },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuText: { flex: 1, fontSize: theme.fontSize.md, fontWeight: '500', color: theme.colors.light.text },
  menuArrow: { fontSize: 20, color: theme.colors.light.textSecondary },
  logoutBtn: { marginHorizontal: 16, marginTop: 20, paddingVertical: 14, backgroundColor: '#fef2f2', borderRadius: theme.borderRadius.md, alignItems: 'center' },
  logoutText: { color: '#dc2626', fontSize: theme.fontSize.md, fontWeight: '600' },
});
