'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function NotificationsPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/notifications/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { setNotifications(d.data || []); setUnreadCount(d.unreadCount || 0); })
      .finally(() => setLoading(false));
  }, [token]);

  const markAllRead = async () => {
    if (!token) return;
    await fetch(`${API_URL}/notifications/read-all`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  if (!token) return <div className="max-w-md mx-auto px-4 py-20 text-center text-gray-400">Please log in</div>;
  if (loading) return <div className="max-w-md mx-auto px-4 py-20 text-center text-gray-400">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🔔 Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs font-medium text-[#0F7B6C] hover:underline">Mark all read</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No notifications yet</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <div key={n.id} className={`p-4 rounded-lg border ${n.isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#0F7B6C] mt-1.5" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
