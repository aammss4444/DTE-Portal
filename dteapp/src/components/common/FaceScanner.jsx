import React, { useRef, useEffect, useState } from 'react';
import { Camera as CameraIcon, RefreshCw, CheckCircle, Smile, Eye } from 'lucide-react';

const FaceScanner = ({ onLivenessVerified, onCancel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [status, setStatus] = useState('Loading face tracking libraries...');
  const [livenessState, setLivenessState] = useState('POSITION'); // POSITION -> BLINK -> SMILE -> VERIFIED
  const [isCapturing, setIsCapturing] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  // Thresholds
  const EAR_THRESHOLD = 0.22;
  const SMILE_THRESHOLD = 0.45; // Smile ratio > 0.45 indicates smile usually

  const distance = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

  const calculateEAR = (landmarks, isLeft) => {
    // MediaPipe face mesh indices
    const indices = isLeft ? [33, 160, 158, 133, 153, 144] : [362, 385, 387, 263, 373, 380];
    const p1 = landmarks[indices[0]];
    const p2 = landmarks[indices[1]];
    const p3 = landmarks[indices[2]];
    const p4 = landmarks[indices[3]];
    const p5 = landmarks[indices[4]];
    const p6 = landmarks[indices[5]];
    
    return (distance(p2, p6) + distance(p3, p5)) / (2.0 * distance(p1, p4));
  };

  const calculateSmileRatio = (landmarks) => {
    const mouthLeft = landmarks[61];
    const mouthRight = landmarks[291];
    const eyeLeft = landmarks[33];
    const eyeRight = landmarks[263];
    
    return distance(mouthLeft, mouthRight) / distance(eyeLeft, eyeRight);
  };

  // State refs to access inside mediapipe callback without stale closures
  const stateRef = useRef('POSITION');
  useEffect(() => {
    stateRef.current = livenessState;
  }, [livenessState]);

  // Load scripts dynamically
  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.crossOrigin = 'anonymous';
        script.onload = () => resolve();
        script.onerror = (e) => reject(e);
        document.body.appendChild(script);
      });
    };

    Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'),
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js')
    ]).then(() => {
      setScriptsLoaded(true);
      setStatus('Starting camera...');
    }).catch(err => {
      setStatus('Failed to load face tracking libraries');
      console.error(err);
    });
  }, []);

  useEffect(() => {
    if (!videoRef.current || !scriptsLoaded) return;

    let camera = null;
    let faceMesh = null;

    const onResults = (results) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        const currentState = stateRef.current;
        
        if (currentState === 'POSITION') {
          setLivenessState('BLINK');
          setStatus('Please BLINK your eyes');
        } else if (currentState === 'BLINK') {
          const leftEAR = calculateEAR(landmarks, true);
          const rightEAR = calculateEAR(landmarks, false);
          const ear = (leftEAR + rightEAR) / 2.0;
          
          if (ear < EAR_THRESHOLD) {
            setLivenessState('SMILE');
            setStatus('Great! Now please SMILE');
          }
        } else if (currentState === 'SMILE') {
          const smileRatio = calculateSmileRatio(landmarks);
          
          if (smileRatio > SMILE_THRESHOLD) {
            setLivenessState('VERIFIED');
            setStatus('Liveness verified! You can now capture.');
          }
        }
      } else {
        if (stateRef.current === 'POSITION') {
          setStatus('Please position your face in the frame');
        }
      }
    };

    faceMesh = new window.FaceMesh({locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }});
    
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    
    faceMesh.onResults(onResults);

    camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await faceMesh.send({image: videoRef.current});
        }
      },
      width: 640,
      height: 480
    });
    
    camera.start().catch(err => {
      setStatus(`Camera Error: ${err.message}`);
    });

    return () => {
      if (camera) camera.stop();
      if (faceMesh) faceMesh.close();
    };
  }, [scriptsLoaded]);

  const captureSelfie = () => {
    if (!videoRef.current) return;
    
    setIsCapturing(true);
    setStatus('Capturing...');
    
    const video = videoRef.current;
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    const ctx = captureCanvas.getContext('2d');
    
    // Draw mirrored video to canvas
    ctx.translate(captureCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
    
    const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.9);
    
    setTimeout(() => {
      if (onLivenessVerified) onLivenessVerified(dataUrl);
    }, 500);
  };

  return (
    <div className="flex flex-col items-center bg-slate-900 rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-2">
        <span className={livenessState === 'VERIFIED' ? 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse' : 'w-2 h-2 rounded-full bg-amber-500 animate-pulse'}></span>
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
          <div className={`w-48 h-64 border-4 border-dashed rounded-[100px] shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] flex items-center justify-center transition-colors duration-500 ${livenessState === 'VERIFIED' ? 'border-emerald-400' : 'border-white/60'}`}>
            {isCapturing && (
              <div className="absolute inset-0 bg-white/40 animate-pulse rounded-[100px]" />
            )}
            {livenessState === 'BLINK' && (
              <div className="absolute bottom-4 bg-amber-500/80 px-3 py-1 rounded-full text-white font-bold flex items-center gap-2 shadow-lg animate-bounce">
                <Eye size={16} /> BLINK
              </div>
            )}
            {livenessState === 'SMILE' && (
              <div className="absolute bottom-4 bg-amber-500/80 px-3 py-1 rounded-full text-white font-bold flex items-center gap-2 shadow-lg animate-bounce">
                <Smile size={16} /> SMILE
              </div>
            )}
            {livenessState === 'VERIFIED' && (
              <div className="absolute inset-0 border-4 border-emerald-400 rounded-[100px] shadow-[0_0_15px_rgba(52,211,153,0.5)]"></div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 w-full flex flex-col gap-3">
        <button 
          onClick={captureSelfie}
          disabled={livenessState !== 'VERIFIED' || isCapturing}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-2"
        >
          {isCapturing ? <RefreshCw className="animate-spin" size={24} /> : (livenessState === 'VERIFIED' ? <CheckCircle size={24} /> : <CameraIcon size={24} />)}
          {isCapturing ? 'Processing...' : (livenessState === 'VERIFIED' ? 'Capture Selfie' : 'Complete Liveness Check First')}
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
