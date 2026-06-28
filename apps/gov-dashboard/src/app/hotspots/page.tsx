'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { govAPI } from '@/lib/api';
import { useJurisdiction } from '@/lib/useJurisdiction';

const GovHeatMap = dynamic(() => import('@/components/GovHeatMap'), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function HotspotsPage() {
  const { country, dateFrom } = useJurisdiction();
  const [data, setData] = useState<any[]>([]);
  const [geoPoints, setGeoPoints] = useState<any[]>([]);

  useEffect(() => {
    govAPI.hotspots(country).then((d: any) => setData(Array.isArray(d) ? d : d.data || [])).catch(() => {});
    fetch(`${API_URL}/elections/hotspots-geo?country=${country}&election=2027 General Election`)
      .then(r => r.json()).then(d => setGeoPoints(Array.isArray(d) ? d : [])).catch(() => {});
  }, [country, dateFrom]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">🔥 Hotspot Areas</h1>
      <p className="text-gray-400 text-sm mb-6">Areas with highest incident density — {country}</p>

      {geoPoints.length > 0 ? (
        <GovHeatMap points={geoPoints} />
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center mb-4">
          <p className="text-gray-400 text-sm">🗺️ Heat map will appear once election reports include GPS coordinates</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mt-6">
        {data.map((h: any, i: number) => (
          <div key={i} className="bg-[#1E293B] rounded-xl p-5 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-100">{h.state || h.city || 'Unknown'}</h3>
              <span className="text-xs px-2 py-0.5 bg-red-600/20 text-red-400 rounded capitalize">{h.category?.replace('_', ' ') || h.type}</span>
            </div>
            <p className="text-3xl font-bold text-orange-400">{h.count || h.reportCount || 0}</p>
            <p className="text-xs text-gray-500">reports</p>
          </div>
        ))}
        {data.length === 0 && <p className="text-gray-500 text-center py-12 col-span-2">No hotspots detected</p>}
      </div>
    </div>
  );
}
