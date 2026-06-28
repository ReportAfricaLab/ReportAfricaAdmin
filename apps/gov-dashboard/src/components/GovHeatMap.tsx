'use client';
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface HeatPoint {
  id: string;
  latitude: number;
  longitude: number;
  type: string;
  state?: string;
}

export default function GovHeatMap({ points, center }: { points: HeatPoint[]; center?: [number, number] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: center || [8.0, 9.5],
      zoom: 5.5,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.on('load', () => addHeatLayer());

    return () => { map.current?.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    if (map.current?.isStyleLoaded()) addHeatLayer();
  }, [points]);

  const addHeatLayer = () => {
    if (!map.current || points.length === 0) return;

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: points.map(p => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [Number(p.longitude), Number(p.latitude)] },
        properties: { type: p.type, state: p.state || '' },
      })),
    };

    if (map.current.getSource('incidents')) {
      (map.current.getSource('incidents') as mapboxgl.GeoJSONSource).setData(geojson);
    } else {
      map.current.addSource('incidents', { type: 'geojson', data: geojson });

      map.current.addLayer({
        id: 'incidents-heat',
        type: 'heatmap',
        source: 'incidents',
        paint: {
          'heatmap-weight': 1,
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 15, 9, 30],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, '#3B82F6',
            0.4, '#F59E0B',
            0.6, '#EF4444',
            0.8, '#DC2626',
            1, '#7F1D1D',
          ],
          'heatmap-opacity': 0.85,
        },
      });

      map.current.addLayer({
        id: 'incidents-points',
        type: 'circle',
        source: 'incidents',
        minzoom: 8,
        paint: {
          'circle-radius': 6,
          'circle-color': ['match', ['get', 'type'],
            'violence', '#DC2626',
            'vote_buying', '#F97316',
            'intimidation', '#7C2D12',
            'ballot_snatching', '#991B1B',
            '#6B7280',
          ],
          'circle-stroke-width': 1,
          'circle-stroke-color': '#334155',
          'circle-opacity': 0.9,
        },
      });

      map.current.on('click', 'incidents-points', (e) => {
        const props = e.features?.[0]?.properties;
        if (!props) return;
        new mapboxgl.Popup({ closeButton: false, offset: 10 })
          .setLngLat(e.lngLat)
          .setHTML(`<div style="font-size:12px;color:#111"><strong>${props.type.replace('_',' ')}</strong><br/>${props.state}</div>`)
          .addTo(map.current!);
      });
    }
  };

  return (
    <div ref={mapContainer} className="w-full h-[500px] rounded-xl overflow-hidden border border-gray-700" />
  );
}
