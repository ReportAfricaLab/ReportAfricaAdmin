'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

interface BroadcastClientConfig {
  ingestEndpoint: string;
  streamKey: string;
}

interface StreamBroadcasterProps {
  config?: BroadcastClientConfig;
  onStatusChange?: (status: 'idle' | 'preview' | 'live' | 'error') => void;
  autoPreview?: boolean;
}

export default function StreamBroadcaster({ config, onStatusChange, autoPreview = true }: StreamBroadcasterProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const clientRef = useRef<any>(null);
  const [status, setStatus] = useState<'idle' | 'preview' | 'live' | 'error'>('idle');
  const [error, setError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);

  const updateStatus = useCallback((s: 'idle' | 'preview' | 'live' | 'error') => {
    setStatus(s);
    onStatusChange?.(s);
  }, [onStatusChange]);

  // Start camera preview
  const startPreview = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'environment' },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
      updateStatus('preview');
      setError('');
    } catch (err: any) {
      setError('Camera access denied. Please allow camera and microphone.');
      updateStatus('error');
    }
  }, [updateStatus]);

  useEffect(() => {
    if (autoPreview) startPreview();
    return () => stopAll();
  }, []);

  // Start broadcasting to IVS
  const startBroadcast = async () => {
    if (!config || !streamRef.current) {
      setError('No stream configuration or camera not ready');
      return;
    }

    try {
      const IVSBroadcastClient = (await import('amazon-ivs-web-broadcast')).default;

      const client = IVSBroadcastClient.create({
        streamConfig: IVSBroadcastClient.STANDARD_LANDSCAPE,
        ingestEndpoint: config.ingestEndpoint,
      });
      clientRef.current = client;

      const stream = streamRef.current;
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      if (videoTrack) {
        await client.addVideoInputDevice(new MediaStream([videoTrack]), 'camera', { index: 0 });
      }
      if (audioTrack) {
        await client.addAudioInputDevice(new MediaStream([audioTrack]), 'mic');
      }

      await client.startBroadcast(config.streamKey);
      updateStatus('live');
      setError('');
    } catch (err: any) {
      console.error('Broadcast error:', err);
      setError(err.message || 'Failed to start broadcast');
      updateStatus('error');
    }
  };

  const stopBroadcast = async () => {
    try {
      if (clientRef.current) {
        await clientRef.current.stopBroadcast();
        clientRef.current.delete();
        clientRef.current = null;
      }
    } catch {}
    updateStatus('preview');
  };

  const stopAll = () => {
    try { clientRef.current?.stopBroadcast(); } catch {}
    try { clientRef.current?.delete(); } catch {}
    clientRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);
    updateStatus('idle');
  };

  const toggleCamera = async () => {
    if (!streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack) videoTrack.enabled = !videoTrack.enabled;
  };

  const toggleMic = async () => {
    if (!streamRef.current) return;
    const audioTrack = streamRef.current.getAudioTracks()[0];
    if (audioTrack) audioTrack.enabled = !audioTrack.enabled;
  };

  return (
    <div className="relative bg-black rounded-xl overflow-hidden">
      <div className="aspect-video">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        {!cameraReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white text-sm">Starting camera...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center px-4">
              <p className="text-red-400 text-sm">{error}</p>
              <button onClick={startPreview} className="mt-3 px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20">
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status badge */}
      {status === 'live' && (
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> LIVE
        </div>
      )}
      {status === 'preview' && (
        <div className="absolute top-3 left-3 px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
          PREVIEW
        </div>
      )}

      {/* Controls */}
      {cameraReady && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex gap-2">
            <button onClick={toggleCamera} className="w-9 h-9 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70 text-sm">
              📷
            </button>
            <button onClick={toggleMic} className="w-9 h-9 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70 text-sm">
              🎤
            </button>
          </div>
          <div>
            {status === 'preview' && config && (
              <button onClick={startBroadcast} className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-full hover:bg-red-700">
                GO LIVE
              </button>
            )}
            {status === 'live' && (
              <button onClick={stopBroadcast} className="px-4 py-2 bg-gray-800 text-white text-xs font-bold rounded-full hover:bg-gray-700">
                END
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { type BroadcastClientConfig };
