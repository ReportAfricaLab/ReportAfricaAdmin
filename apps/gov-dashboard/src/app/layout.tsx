import type { Metadata } from 'next';
import './globals.css';
import GovShell from './GovShell';

export const metadata: Metadata = {
  title: 'ReportAfrica - Government Intelligence Dashboard',
  description: 'Real-time civic intelligence for government agencies',
};

export default function GovLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0F172A] text-gray-100 min-h-screen">
        <GovShell>{children}</GovShell>
      </body>
    </html>
  );
}
