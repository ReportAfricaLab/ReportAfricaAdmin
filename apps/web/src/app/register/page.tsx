'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const COUNTRIES = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'UG', name: 'Uganda' },
  { code: 'RW', name: 'Rwanda' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', username: '', displayName: '', password: '', country: 'NG' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.auth.register(form);
      login(data.user, data.token);
      router.push('/feed');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleGoogleSignUp = () => {
    setError('');
    setLoading(true);
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) { setError('Google OAuth not configured'); setLoading(false); return; }

    const width = 500, height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const redirectUri = window.location.origin + '/api/auth/callback/google';
    const scope = 'openid email profile';
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token+id_token&scope=${encodeURIComponent(scope)}&nonce=${Date.now()}`;

    const popup = window.open(url, 'google-signup', `width=${width},height=${height},left=${left},top=${top}`);

    const interval = setInterval(() => {
      try {
        if (!popup || popup.closed) { clearInterval(interval); setLoading(false); return; }
        if (popup.location.href.includes(window.location.origin)) {
          const hash = popup.location.hash;
          popup.close();
          clearInterval(interval);
          const params = new URLSearchParams(hash.substring(1));
          const idToken = params.get('id_token');
          if (idToken) {
            handleGoogleToken(idToken);
          } else {
            setError('No token received from Google');
            setLoading(false);
          }
        }
      } catch { /* cross-origin */ }
    }, 500);
  };

  const handleGoogleToken = async (idToken: string) => {
    try {
      const data = await api.auth.oauth('google', idToken, form.country);
      login(data.user, data.token);
      router.push('/feed');
    } catch (err: any) {
      setError(err.message || 'Google sign-up failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0F7B6C]">Join ReportAfrica</h1>
          <p className="text-gray-500 mt-2">Start reporting what matters in your community</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button type="button" onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <span className="text-sm font-medium text-gray-700">Sign up with Google</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-400">or register with email</span></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map((c) => (
                <button key={c.code} type="button" onClick={() => update('country', c.code)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition ${form.country === c.code ? 'bg-[#0F7B6C] text-white border-[#0F7B6C]' : 'border-gray-200 text-gray-600 hover:border-[#0F7B6C]'}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" value={form.displayName} onChange={(e) => update('displayName', e.target.value)} required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0F7B6C] focus:border-transparent outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" value={form.username} onChange={(e) => update('username', e.target.value)} required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0F7B6C] focus:border-transparent outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0F7B6C] focus:border-transparent outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required minLength={8}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0F7B6C] focus:border-transparent outline-none" placeholder="Min 8 characters" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-[#0F7B6C] text-white font-semibold rounded-lg hover:bg-[#0B6E4F] transition disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          Already have an account? <Link href="/login" className="text-[#0F7B6C] font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
