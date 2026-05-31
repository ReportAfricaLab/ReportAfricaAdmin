'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { govAPI } from '@/lib/api';

export default function GovLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await govAPI.login(email, password);
      if (data.token) {
        localStorage.setItem('gov_token', data.token);
        router.push('/');
      } else {
        setError('Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-[#1E293B] rounded-xl border border-gray-700 p-8 space-y-5">
        <h1 className="text-2xl font-bold text-blue-400 text-center">Government Dashboard</h1>
        <p className="text-gray-400 text-sm text-center">Civic Intelligence Platform</p>
        {error && <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-sm text-red-400">{error}</div>}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Government email"
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 outline-none focus:border-blue-500" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password"
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 outline-none focus:border-blue-500" />
        <button type="submit" disabled={loading}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 disabled:opacity-50">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
