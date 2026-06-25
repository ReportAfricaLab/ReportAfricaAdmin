'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function SafeTripPage() {
  const { token } = useAuth();
  const [tab, setTab] = useState<'start' | 'active' | 'watching'>('start');
  const [username, setUsername] = useState('');
  const [destination, setDestination] = useState('');
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [watching, setWatching] = useState<any[]>([]);
  const [dangers, setDangers] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (!token) return;
    loadActiveTrip();
    loadWatching();
  }, [token]);

  useEffect(() => {
    // Auto-update location every 30s if trip is active
    if (activeTrip?.isActive) {
      intervalRef.current = setInterval(updateLocation, 30000);
      return () => clearInterval(intervalRef.current);
    }
  }, [activeTrip]);

  const loadActiveTrip = async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/trips/active`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data?.id) { setActiveTrip(data); setTab('active'); }
  };

  const loadWatching = async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/trips/watching`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) setWatching(data);
  };

  const startTrip = async () => {
    if (!token || !username.trim()) { setMessage('Enter the username of who should watch your trip'); return; }
    setLoading(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
      const res = await fetch(`${API_URL}/trips/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sharedWithUsername: username.trim(), latitude: pos.coords.latitude, longitude: pos.coords.longitude, destination: destination || undefined }),
      });
      const data = await res.json();
      if (res.ok) { setActiveTrip(data); setTab('active'); setMessage(''); }
      else setMessage(data.message || 'Failed to start trip');
    } catch { setMessage('Location access required'); }
    setLoading(false);
  };

  const updateLocation = async () => {
    if (!token) return;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
      await fetch(`${API_URL}/trips/update-location`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      });
    } catch {}
  };

  const endTrip = async () => {
    if (!token) return;
    await fetch(`${API_URL}/trips/end`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    setActiveTrip(null);
    clearInterval(intervalRef.current);
    setTab('start');
  };

  const loadDangers = async (tripId: string) => {
    if (!token) return;
    const res = await fetch(`${API_URL}/trips/${tripId}/dangers`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setDangers(Array.isArray(data) ? data : []);
  };

  if (!token) return <div className="max-w-md mx-auto px-4 py-20 text-center text-gray-400">Please log in</div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">🛡️ Safe Trip</h1>
      <p className="text-gray-500 text-sm mb-6">Share your live location with a trusted contact. They'll see dangers along your route.</p>

      <div className="flex gap-2 mb-6">
        {(['start', 'active', 'watching'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium rounded-lg ${tab === t ? 'bg-[#0F7B6C] text-white' : 'bg-gray-100 text-gray-600'}`}>
            {t === 'start' ? '🚀 Start Trip' : t === 'active' ? '📍 My Trip' : '👁 Watching'}
          </button>
        ))}
      </div>

      {tab === 'start' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 text-xs text-blue-800">
            <p className="font-semibold mb-1">How it works:</p>
            <p>1. Enter the username of your trusted contact</p>
            <p>2. Your live location is shared every 30 seconds</p>
            <p>3. They see your position + danger alerts along your route</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Guardian's Username *</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. johndoe"
              className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Destination (optional)</label>
            <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Lagos to Ibadan"
              className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-lg text-sm" />
          </div>
          {message && <p className="text-sm text-red-600">{message}</p>}
          <button onClick={startTrip} disabled={loading}
            className="w-full py-3 bg-[#0F7B6C] text-white font-semibold rounded-lg disabled:opacity-50 hover:bg-[#0B6E4F]">
            {loading ? 'Starting...' : '🛡️ Start Safe Trip'}
          </button>
        </div>
      )}

      {tab === 'active' && (
        <div className="space-y-4">
          {!activeTrip ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-400">No active trip. Start one from the "Start Trip" tab.</p>
            </div>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-green-800">🟢 Trip Active</span>
                  <span className="text-xs text-green-600">Sharing with: {activeTrip.sharedWithUser?.username || 'Contact'}</span>
                </div>
                {activeTrip.destination && <p className="text-sm text-gray-700 mb-2">📍 Destination: {activeTrip.destination}</p>}
                <p className="text-xs text-gray-500">Location updates every 30 seconds automatically.</p>
              </div>
              <button onClick={endTrip} className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">
                ⏹️ End Trip
              </button>
            </>
          )}
        </div>
      )}

      {tab === 'watching' && (
        <div className="space-y-4">
          {watching.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-400">No one is sharing their trip with you right now.</p>
            </div>
          ) : watching.map((trip: any) => (
            <div key={trip.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-900">🟢 {trip.user?.displayName || trip.user?.username} is traveling</span>
                <button onClick={() => loadDangers(trip.id)} className="text-xs text-red-600 font-medium">⚠️ Check Dangers</button>
              </div>
              {trip.destination && <p className="text-sm text-gray-600 mb-1">📍 To: {trip.destination}</p>}
              <p className="text-xs text-gray-400">Current: {Number(trip.currentLat).toFixed(4)}, {Number(trip.currentLng).toFixed(4)}</p>
              <p className="text-xs text-gray-400">Started: {new Date(trip.startedAt).toLocaleTimeString()}</p>
            </div>
          ))}

          {dangers.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-bold text-red-800 mb-2">⚠️ Dangers Nearby ({dangers.length})</p>
              {dangers.map((d: any) => (
                <div key={d.id} className="py-2 border-b border-red-100 last:border-0">
                  <p className="text-xs font-medium text-red-900">{d.title}</p>
                  <p className="text-xs text-red-700">{d.category} · {d.severity} · {new Date(d.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
