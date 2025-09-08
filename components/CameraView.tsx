/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BackIcon } from './icons';

const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");

    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

interface CameraViewProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const enableStream = async () => {
      try {
        setIsLoading(true);
        setError(null);
        streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
      } catch (err) {
        console.warn("Could not get environment camera, trying user camera", err);
        try {
          streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
          if (videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
          }
        } catch (fallbackErr) {
            console.error("Error accessing camera: ", fallbackErr);
            setError("Could not access the camera. Please ensure you have granted permission in your browser settings.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    enableStream();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current && streamRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Flip the image horizontally if using the front-facing camera for a mirror effect
        const settings = streamRef.current.getVideoTracks()[0].getSettings();
        if (settings.facingMode === 'user') {
            context.translate(video.videoWidth, 0);
            context.scale(-1, 1);
        }

        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/png');
        const file = dataURLtoFile(dataUrl, `capture-${Date.now()}.png`);
        onCapture(file);
      }
    }
  }, [onCapture]);
  
  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="camera-title">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
      <canvas ref={canvasRef} className="hidden" aria-hidden="true"></canvas>
      
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <p id="camera-title" className="text-white text-lg">Starting camera...</p>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-center p-4">
            <h2 id="camera-title" className="text-xl font-bold text-red-400">Camera Error</h2>
            <p className="text-red-300 mt-2 max-w-md">{error}</p>
            <button onClick={onClose} className="mt-6 bg-white/10 border border-white/20 text-gray-200 font-semibold py-2 px-6 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20">
                Go Back
            </button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
            <div className="flex justify-start">
                <button onClick={onClose} className="p-3 bg-black/50 rounded-full hover:bg-black/75 transition-colors" aria-label="Close camera">
                    <BackIcon className="w-6 h-6 text-white" />
                </button>
            </div>
            <div className="flex justify-center pb-4">
                <button onClick={handleCapture} className="w-20 h-20 rounded-full bg-white/20 border-4 border-white flex items-center justify-center group transition-transform active:scale-90" aria-label="Take photo">
                    <div className="w-16 h-16 rounded-full bg-white group-hover:scale-105 transition-transform"></div>
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default CameraView;
