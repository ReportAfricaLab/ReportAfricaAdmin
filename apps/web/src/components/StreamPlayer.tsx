'use client';
import { useEffect, useRef, useState } from 'react';

interface StreamPlayerProps {
  playbackUrl: string;
  title?: string;
  onError?: () => void;
}

export default function StreamPlayer({ playbackUrl, title, onError }: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!playbackUrl || !videoRef.current) return;

    let hls: any;

    const initPlayer = async () => {
      const Hls = (await import('hls.js')).default;

      if (Hls.isSupported()) {
        hls = new Hls({ liveSyncDurationCount: 3, liveMaxLatencyDurationCount: 6 });
        hlsRef.current = hls;

        hls.loadSource(playbackUrl);
        hls.attachMedia(videoRef.current!);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current?.play().then(() => setPlaying(true)).catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (_: any, data: any) => {
          if (data.fatal) {
            setError('Stream unavailable');
            onError?.();
          }
        });
      } else if (videoRef.current!.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS
        videoRef.current!.src = playbackUrl;
        videoRef.current!.addEventListener('loadedmetadata', () => {
          videoRef.current?.play().then(() => setPlaying(true)).catch(() => {});
        });
      } else {
        setError('HLS playback not supported');
      }
    };

    initPlayer();

    return () => {
      if (hls) { hls.destroy(); hlsRef.current = null; }
    };
  }, [playbackUrl]);

  return (
    <div className="relative bg-black aspect-video rounded-lg overflow-hidden">
      <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-cover" />
      {!playing && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <p className="text-white text-sm">{error}</p>
            <p className="text-gray-400 text-xs mt-1">The broadcaster may have ended the stream</p>
          </div>
        </div>
      )}
      {title && playing && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
          <p className="text-white text-sm font-medium truncate">{title}</p>
        </div>
      )}
    </div>
  );
}
