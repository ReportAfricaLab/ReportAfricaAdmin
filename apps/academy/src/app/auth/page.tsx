'use client';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function AuthHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('academy_token', token);
      // Decode JWT to get user info (no verification on client — server verifies on API calls)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        localStorage.setItem('academy_user', JSON.stringify({ id: payload.sub, email: payload.email, country: payload.country || 'NG' }));
      } catch {}
      router.push('/');
    } else {
      router.push('/');
    }
  }, [searchParams, router]);

  return <div className="max-w-md mx-auto px-4 py-20 text-center text-gray-500">Signing you in...</div>;
}

export default function AuthPage() {
  return <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}><AuthHandler /></Suspense>;
}
