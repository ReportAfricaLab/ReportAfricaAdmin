'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';

const COUNTRY_CONFIG: Record<string, { brandName: string }> = {
  NG: { brandName: 'Nigeria' },
  GH: { brandName: 'Ghana' },
  KE: { brandName: 'Kenya' },
  ZA: { brandName: 'South Africa' },
  UG: { brandName: 'Uganda' },
  RW: { brandName: 'Rwanda' },
  TZ: { brandName: 'Tanzania' },
  ET: { brandName: 'Ethiopia' },
  SN: { brandName: 'Senegal' },
  CM: { brandName: 'Cameroon' },
  EG: { brandName: 'Egypt' },
  MA: { brandName: 'Morocco' },
  DZ: { brandName: 'Algeria' },
  TN: { brandName: 'Tunisia' },
  CI: { brandName: "Côte d'Ivoire" },
  AO: { brandName: 'Angola' },
  MZ: { brandName: 'Mozambique' },
  CD: { brandName: 'DR Congo' },
  SD: { brandName: 'Sudan' },
  LY: { brandName: 'Libya' },
  ZW: { brandName: 'Zimbabwe' },
  ZM: { brandName: 'Zambia' },
  MW: { brandName: 'Malawi' },
  BJ: { brandName: 'Benin' },
  TG: { brandName: 'Togo' },
  ML: { brandName: 'Mali' },
  BF: { brandName: 'Burkina Faso' },
  NE: { brandName: 'Niger' },
  SL: { brandName: 'Sierra Leone' },
  LR: { brandName: 'Liberia' },
  SO: { brandName: 'Somalia' },
  MG: { brandName: 'Madagascar' },
};

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const brandName = user?.country ? COUNTRY_CONFIG[user.country]?.brandName || 'Africa' : 'Africa';

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="ReportAfrica" width={300} height={80} className="h-[80px] w-auto" priority />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-[#0F7B6C]">{brandName}</span>
            <span className="text-xs text-gray-500">Live Reports</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/feed" className="hover:text-[#0F7B6C] transition">Feed</Link>
          <Link href="/search" className="hover:text-[#0F7B6C] transition">Search</Link>
          <Link href="/donations" className="hover:text-[#F97316] transition">Helping Hands</Link>
          <Link href="/elections" className="hover:text-[#0F7B6C] transition">Elections</Link>
          <Link href="/media-licensing" className="hover:text-[#0F7B6C] transition">Media</Link>
          <Link href="/map" className="hover:text-[#0F7B6C] transition">Map</Link>
          <Link href="/live" className="hover:text-[#D92D20] transition">🔴 Live</Link>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/create-report" className="px-4 py-2 text-sm font-semibold text-white bg-[#D92D20] rounded-lg hover:bg-red-700 transition">
                + Report
              </Link>
              <Link href="/emergency" className="px-3 py-2 text-sm font-semibold text-[#D92D20] border border-[#D92D20] rounded-lg hover:bg-red-50 transition">
                🚨 SOS
              </Link>
              <Link href="/profile/licenses" className="text-sm text-gray-500 hover:text-gray-700">Licenses</Link>
              <Link href="/profile" className="text-sm font-medium text-gray-700 hover:text-[#0F7B6C] hidden sm:inline">{user?.username}</Link>
              <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-[#0F7B6C] border border-[#0F7B6C] rounded-lg hover:bg-[#0F7B6C]/5">
                Log In
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-[#0F7B6C] rounded-lg hover:bg-[#0B6E4F]">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
