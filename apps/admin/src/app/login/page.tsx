'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await adminAPI.login(email, password);
      localStorage.setItem('admin_token', data.token);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-gray-800 rounded-xl border border-gray-700 p-8 space-y-5">
        <h1 className="text-2xl font-bold text-emerald-400 text-center">Admin Panel</h1>
        <p className="text-gray-400 text-sm text-center">ReportAfrica Administration</p>
        {error && <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-sm text-red-400">{error}</div>}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Admin email"
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 outline-none focus:border-emerald-500" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password"
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 outline-none focus:border-emerald-500" />
        <button type="submit" disabled={loading}
          className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 disabled:opacity-50">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
