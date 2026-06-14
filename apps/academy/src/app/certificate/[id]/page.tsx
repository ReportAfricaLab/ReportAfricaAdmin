'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { COURSES } from '@/lib/courses';

export default function CertificatePage() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);

  const isBundle = id === 'bundle';
  const course = isBundle ? null : COURSES.find(c => c.id === id);
  const title = isBundle ? 'Complete Citizen Journalism Program' : course?.title || 'Course';

  useEffect(() => {
    const stored = localStorage.getItem('academy_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const userName = user?.email?.split('@')[0] || 'Student';
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-6">
        <button onClick={() => window.print()} className="px-4 py-2 bg-[#0F7B6C] text-white text-sm rounded-lg hover:bg-[#0B6E4F]">🖨️ Print Certificate</button>
      </div>

      {/* Certificate */}
      <div className="bg-white border-4 border-[#0F7B6C] rounded-2xl p-12 text-center print:border-2" id="certificate">
        <div className="border-2 border-gray-200 rounded-xl p-10">
          <p className="text-sm text-gray-500 tracking-widest uppercase mb-4">Certificate of Completion</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎓 ReportAfrica Academy</h1>
          <div className="w-16 h-0.5 bg-[#0F7B6C] mx-auto my-6" />
          <p className="text-gray-500 mb-2">This certifies that</p>
          <p className="text-2xl font-bold text-[#0F7B6C] mb-4 capitalize">{userName}</p>
          <p className="text-gray-500 mb-2">has successfully completed</p>
          <p className="text-xl font-bold text-gray-900 mb-6">{title}</p>
          <div className="w-16 h-0.5 bg-gray-200 mx-auto my-6" />
          <p className="text-sm text-gray-400">{date}</p>
          <p className="text-xs text-gray-400 mt-2">ReportAfrica — Africa&apos;s Citizen-Powered Reporting Platform</p>
        </div>
      </div>
    </div>
  );
}
