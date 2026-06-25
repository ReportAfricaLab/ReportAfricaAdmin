import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, AppState } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { API_URL } from '../constants';
import { getCurrentLocation } from '../services/location';

type Tab = 'start' | 'active' | 'watching';

export default function SafeTripScreen() {
  const { token } = useAppStore();
  const [tab, setTab] = useState<Tab>('start');
  const [username, setUsername] = useState('');
  const [destination, setDestination] = useState('');
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [watching, setWatching] = useState<any[]>([]);
  const [dangers, setDangers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (!token) return;
    loadActive();
    loadWatching();
  }, [token]);

  useEffect(() => {
    if (activeTrip?.isActive) {
      intervalRef.current = setInterval(updateLocation, 30000);
      return () => clearInterval(intervalRef.current);
    }
  }, [activeTrip]);

  const loadActive = async () => {
    try {
      const res = await fetch(`${API_URL}/trips/active`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data?.id) { setActiveTrip(data); setTab('active'); }
    } catch {}
  };

  const loadWatching = async () => {
    try {
      const res = await fetch(`${API_URL}/trips/watching`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setWatching(data);
    } catch {}
  };

  const startTrip = async () => {
    if (!username.trim()) { Alert.alert('Error', 'Enter guardian username'); return; }
    setLoading(true);
    try {
      const loc = await getCurrentLocation();
      if (!loc) { Alert.alert('Error', 'Location required'); setLoading(false); return; }
      const res = await fetch(`${API_URL}/trips/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sharedWithUsername: username.trim(), latitude: loc.latitude, longitude: loc.longitude, destination: destination || undefined }),
      });
      const data = await res.json();
      if (res.ok) { setActiveTrip(data); setTab('active'); }
      else Alert.alert('Error', data.message || 'Failed');
    } catch { Alert.alert('Error', 'Failed to start'); }
    setLoading(false);
  };

  const updateLocation = async () => {
    try {
      const loc = await getCurrentLocation();
      if (!loc) return;
      await fetch(`${API_URL}/trips/update-location`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: loc.latitude, longitude: loc.longitude }),
      });
    } catch {}
  };

  const endTrip = async () => {
    await fetch(`${API_URL}/trips/end`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    setActiveTrip(null);
    clearInterval(intervalRef.current);
    setTab('start');
    Alert.alert('Trip Ended', 'Location sharing stopped.');
  };

  const loadDangers = async (tripId: string) => {
    try {
      const res = await fetch(`${API_URL}/trips/${tripId}/dangers`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setDangers(Array.isArray(data) ? data : []);
    } catch {}
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>🛡️ Safe Trip</Text>
      <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Share live location with a trusted contact.</Text>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {(['start', 'active', 'watching'] as Tab[]).map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', backgroundColor: tab === t ? '#0F7B6C' : '#f3f4f6' }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: tab === t ? '#fff' : '#6b7280' }}>
              {t === 'start' ? '🚀 Start' : t === 'active' ? '📍 My Trip' : '👁 Watching'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'start' && (
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
          <View style={{ backgroundColor: '#eff6ff', borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <Text style={{ fontSize: 11, color: '#1e40af' }}>1. Enter guardian's username{'\n'}2. Location shared every 30s{'\n'}3. They see your position + nearby dangers</Text>
          </View>
          <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 4 }}>Guardian's Username *</Text>
          <TextInput value={username} onChangeText={setUsername} placeholder="e.g. johndoe"
            style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12 }} />
          <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 4 }}>Destination (optional)</Text>
          <TextInput value={destination} onChangeText={setDestination} placeholder="e.g. Lagos to Ibadan"
            style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 16 }} />
          <TouchableOpacity onPress={startTrip} disabled={loading}
            style={{ backgroundColor: '#0F7B6C', borderRadius: 10, padding: 14, alignItems: 'center', opacity: loading ? 0.5 : 1 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>{loading ? 'Starting...' : '🛡️ Start Safe Trip'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {tab === 'active' && (
        <View>
          {!activeTrip ? (
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, alignItems: 'center' }}>
              <Text style={{ color: '#9ca3af' }}>No active trip</Text>
            </View>
          ) : (
            <>
              <View style={{ backgroundColor: '#f0fdf4', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <Text style={{ fontWeight: 'bold', color: '#166534', marginBottom: 4 }}>🟢 Trip Active</Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>Sharing with: {activeTrip.sharedWithUser?.username || 'Contact'}</Text>
                {activeTrip.destination && <Text style={{ fontSize: 12, color: '#374151', marginTop: 4 }}>📍 {activeTrip.destination}</Text>}
                <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Auto-updating every 30s</Text>
              </View>
              <TouchableOpacity onPress={endTrip} style={{ backgroundColor: '#dc2626', borderRadius: 10, padding: 14, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>⏹️ End Trip</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {tab === 'watching' && (
        <View>
          {watching.length === 0 ? (
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, alignItems: 'center' }}>
              <Text style={{ color: '#9ca3af' }}>No one is sharing with you</Text>
            </View>
          ) : watching.map((trip: any) => (
            <View key={trip.id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>🟢 {trip.user?.displayName || trip.user?.username} is traveling</Text>
              {trip.destination && <Text style={{ fontSize: 12, color: '#6b7280' }}>📍 To: {trip.destination}</Text>}
              <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Position: {Number(trip.currentLat).toFixed(4)}, {Number(trip.currentLng).toFixed(4)}</Text>
              <TouchableOpacity onPress={() => loadDangers(trip.id)} style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 12, color: '#dc2626', fontWeight: '600' }}>⚠️ Check Dangers Nearby</Text>
              </TouchableOpacity>
            </View>
          ))}
          {dangers.length > 0 && (
            <View style={{ backgroundColor: '#fef2f2', borderRadius: 12, padding: 12, marginTop: 8 }}>
              <Text style={{ fontWeight: 'bold', color: '#991b1b', marginBottom: 8 }}>⚠️ Dangers ({dangers.length})</Text>
              {dangers.map((d: any) => (
                <View key={d.id} style={{ paddingVertical: 6, borderBottomWidth: 1, borderColor: '#fecaca' }}>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#7f1d1d' }}>{d.title}</Text>
                  <Text style={{ fontSize: 10, color: '#991b1b' }}>{d.category} · {d.severity}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
