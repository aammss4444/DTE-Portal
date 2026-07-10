import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, RefreshCw } from 'lucide-react';

const FaceScanner = ({ onLivenessVerified, onCancel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [status, setStatus] = useState('Starting camera...');
  const [isCapturing, setIsCapturing] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setStatus('Camera active - Please position your face');
      }
    } catch (err) {
      setStatus(`Camera Error: ${err.message}`);
    }
  }, []);

  useEffect(() => {
    startCamera();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const captureSelfie = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    setStatus('Capturing...');
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    // Slight delay for UX
    setTimeout(() => {
      if (onLivenessVerified) onLivenessVerified(dataUrl);
    }, 500);
  };

  return (
    <div className="flex flex-col items-center bg-slate-900 rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-2">
        <span className={status.includes('active') ? 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse' : 'w-2 h-2 rounded-full bg-rose-500'}></span>
        <span>{status}</span>
      </div>
      
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border-2 border-slate-700 shadow-inner">
        <video 
          ref={videoRef} 
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" 
          playsInline 
          autoPlay
          muted
        ></video>
        <canvas ref={canvasRef} className="hidden"></canvas>
        
        {/* Overlay scanning guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-64 border-2 border-dashed border-white/60 rounded-[100px] shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] flex items-center justify-center">
            {isCapturing && (
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-[100px]" />
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 w-full flex flex-col gap-3">
        <button 
          onClick={captureSelfie}
          disabled={!status.includes('active') || isCapturing}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-2"
        >
          {isCapturing ? <RefreshCw className="animate-spin" size={24} /> : <Camera size={24} />}
          {isCapturing ? 'Processing...' : 'Capture Selfie'}
        </button>
        
        {onCancel && (
          <button 
            onClick={onCancel}
            disabled={isCapturing}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default FaceScanner;
