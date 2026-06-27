'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.reportafrica.africa/api/v1';

export default function ReportDetailPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/reports/${id}`).then(r => r.json()).then(setReport).catch(() => {});
  }, [id]);

  if (!report) return <p className="text-gray-400 text-center py-20">Loading...</p>;

  return (
    <div className="max-w-3xl">
      <a href="/incidents" className="text-sm text-blue-400 hover:underline mb-4 block">← Back to Incidents</a>
      <div className="bg-[#1E293B] rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded text-white ${report.severity === 'critical' ? 'bg-red-600' : report.severity === 'high' ? 'bg-orange-600' : 'bg-blue-600'}`}>{report.severity?.toUpperCase()}</span>
          <span className="text-xs text-gray-400 capitalize">{report.category?.replace('_', ' ')}</span>
          <span className={`text-xs px-2 py-0.5 rounded ${report.verificationLevel === 'community_verified' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>{report.verificationLevel}</span>
        </div>
        <h1 className="text-xl font-bold text-gray-100 mb-2">{report.title}</h1>
        {report.aiHeadline && <p className="text-sm text-blue-300 mb-3">🤖 {report.aiHeadline}</p>}
        <p className="text-gray-300 leading-relaxed mb-4">{report.description}</p>

        {report.media?.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {report.media.map((m: any, i: number) => (
              <div key={i} className="rounded-lg overflow-hidden bg-gray-800">
                {m.type?.startsWith('video') ? (
                  <video src={m.url} controls className="w-full aspect-video object-cover" />
                ) : (
                  <img src={m.url} alt="" className="w-full aspect-video object-cover" />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800 rounded-lg text-xs">
          <div><span className="text-gray-500">Location:</span> <span className="text-gray-200">{report.state || report.city || 'Unknown'}</span></div>
          <div><span className="text-gray-500">Coords:</span> <span className="text-gray-200">{report.latitude ? `${Number(report.latitude).toFixed(4)}, ${Number(report.longitude).toFixed(4)}` : 'N/A'}</span></div>
          <div><span className="text-gray-500">Reporter:</span> <span className="text-gray-200">{report.author?.displayName || 'Anonymous'}</span></div>
          <div><span className="text-gray-500">Trust:</span> <span className="text-gray-200">{report.author?.trustLevel || 'Unknown'}</span></div>
          <div><span className="text-gray-500">Upvotes:</span> <span className="text-emerald-400">{report.upvotes}</span></div>
          <div><span className="text-gray-500">Disputes:</span> <span className="text-red-400">{report.downvotes}</span></div>
          <div><span className="text-gray-500">Views:</span> <span className="text-gray-200">{report.viewCount}</span></div>
          <div><span className="text-gray-500">Date:</span> <span className="text-gray-200">{new Date(report.createdAt).toLocaleString()}</span></div>
        </div>
      </div>
    </div>
  );
}
