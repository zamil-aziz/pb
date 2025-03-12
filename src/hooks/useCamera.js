'use client';
import { useState, useEffect, useRef } from 'react';

export const useCamera = () => {
    const videoRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const isMountedRef = useRef(true);

    const attemptCameraAccess = async constraints => {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                if (isMountedRef.current) {
                    setIsLoading(false);
                }
            };
        }
    };

    const initializeCamera = async (facingMode = 'user') => {
        if (!videoRef.current || !isMountedRef.current) return;

        setIsLoading(true);
        setError(null);

        try {
            // Try specified camera mode first
            await attemptCameraAccess({
                video: { facingMode: { ideal: facingMode } },
                audio: false,
            });
        } catch (err) {
            console.error(`${facingMode} camera access failed, trying any camera:`, err);

            // Fallback to any available camera
            try {
                await attemptCameraAccess({
                    video: true,
                    audio: false,
                });
            } catch (fallbackErr) {
                console.error('Camera access failed completely:', fallbackErr);
                if (isMountedRef.current) {
                    setIsLoading(false);
                    setError(
                        'Could not access camera. Please check your browser permissions and ensure your camera is working.'
                    );
                }
            }
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            stopCamera();
        };
    }, []);

    return {
        videoRef,
        isLoading,
        error,
        initializeCamera,
        stopCamera,
        isMountedRef,
    };
};
