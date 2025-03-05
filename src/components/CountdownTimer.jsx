'use client';
import { useState, useEffect, useRef, useContext } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';
import { useCamera } from '../hooks/useCamera';
import { useSegmentation } from '../hooks/useSegmentation';
import { usePhotoCapture } from '../hooks/usePhotoCapture';
import { applyCanvasFilter, applyVideoFilter } from '../lib/filterUtils';

export default function CountdownTimer() {
    const displayCanvasRef = useRef(null);
    const [countdown, setCountdown] = useState(3);
    const [photosTaken, setPhotosTaken] = useState(0);
    const [message, setMessage] = useState('Get Ready!');
    const [showCountdown, setShowCountdown] = useState(true);
    const { state, dispatch } = useContext(PhotoboothContext);

    // Use our custom hooks
    const { videoRef, error: cameraError, initializeCamera } = useCamera();
    const {
        model,
        modelLoaded,
        error: segmentationError,
        startSegmentation,
    } = useSegmentation(videoRef, state.selectedBackground);
    const { capturePhoto } = usePhotoCapture(videoRef, state.selectedFilter, state.availableFilters);

    // Use refs to track actions that should happen after render
    const photoTakenRef = useRef(false);
    const photoDataRef = useRef(null);

    // Initialize camera on component mount
    useEffect(() => {
        initializeCamera();
    }, []);

    // Apply filter to video
    useEffect(() => {
        if (videoRef.current && state.selectedFilter) {
            applyVideoFilter(videoRef.current, state.selectedFilter, state.availableFilters);
        }

        if (displayCanvasRef.current && state.selectedFilter) {
            applyCanvasFilter(displayCanvasRef.current, state.selectedFilter, state.availableFilters);
        }
    }, [state.selectedFilter, state.availableFilters]);

    // Start segmentation when canvas and video are ready
    useEffect(() => {
        if (videoRef.current && displayCanvasRef.current && state.selectedBackground) {
            const stopSegmentation = startSegmentation(displayCanvasRef.current);
            return stopSegmentation;
        }
    }, [videoRef.current, displayCanvasRef.current, state.selectedBackground, startSegmentation]);

    // Simple renderVideoToCanvas function for when segmentation is not used
    useEffect(() => {
        // Only run this effect if we're not doing segmentation
        if (!state.selectedBackground && videoRef.current && displayCanvasRef.current) {
            const renderVideoToCanvas = () => {
                if (!videoRef.current || !displayCanvasRef.current) return;

                if (videoRef.current.readyState < 2) return;

                const width = videoRef.current.videoWidth;
                const height = videoRef.current.videoHeight;

                if (width === 0 || height === 0) return;

                // Set canvas dimensions if needed
                if (displayCanvasRef.current.width !== width || displayCanvasRef.current.height !== height) {
                    displayCanvasRef.current.width = width;
                    displayCanvasRef.current.height = height;
                }

                const ctx = displayCanvasRef.current.getContext('2d');
                if (ctx) {
                    ctx.drawImage(videoRef.current, 0, 0, width, height);
                    applyCanvasFilter(displayCanvasRef.current, state.selectedFilter, state.availableFilters);
                }
            };

            const interval = setInterval(renderVideoToCanvas, 33); // ~30fps
            return () => clearInterval(interval);
        }
    }, [
        state.selectedBackground,
        videoRef.current,
        displayCanvasRef.current,
        state.selectedFilter,
        state.availableFilters,
    ]);

    // Handle when a photo is taken
    useEffect(() => {
        if (photoTakenRef.current && photoDataRef.current) {
            // Process the photo data - safely done in a useEffect
            dispatch({ type: 'ADD_PHOTO', payload: photoDataRef.current });

            // Reset the refs
            photoTakenRef.current = false;
            photoDataRef.current = null;
        }
    }, [photoTakenRef.current, photoDataRef.current, dispatch]);

    // Handle countdown and photo capture
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            // Show "Smile!" message
            setMessage('Smile!');

            // Keep preview running for 1 second while showing "Smile!"
            setTimeout(async () => {
                // Take photo after the delay
                const photo = await capturePhoto(model, state.selectedBackground);

                if (photo) {
                    // Store the photo in ref to process in a separate effect
                    photoDataRef.current = photo;
                    photoTakenRef.current = true;
                }

                // First hide the countdown
                setShowCountdown(false);

                // Then wait before starting the next photo sequence
                setTimeout(() => {
                    setPhotosTaken(prev => {
                        const newCount = prev + 1;

                        if (newCount >= state.photosPerSession) {
                            // Schedule view change after render is complete
                            setTimeout(() => {
                                dispatch({ type: 'SET_VIEW', payload: 'preview' });
                            }, 0);
                            return 0;
                        } else {
                            setMessage(`Great! ${state.photosPerSession - newCount} more to go`);
                            setCountdown(3);
                            setMessage('Get Ready!');
                            setShowCountdown(true);
                            return newCount;
                        }
                    });
                }, 1000); // Show blank/no countdown for 1 second
            }, 1500); // 1.5 seconds total wait after "Smile!"
        }
    }, [countdown, photosTaken, state.photosPerSession, model, state.selectedBackground]);

    // Function to determine countdown color
    const getCountdownColor = () => {
        switch (countdown) {
            case 3:
                return 'text-yellow-400';
            case 2:
                return 'text-orange-400';
            case 1:
                return 'text-red-500';
            default:
                return 'text-white';
        }
    };

    // Function to get message background color
    const getMessageStyles = () => {
        if (message === 'Smile!') {
            return 'bg-gradient-to-r from-green-600 to-emerald-500 bg-opacity-90 text-white shadow-lg shadow-green-500/30';
        } else if (message === 'Get Ready!') {
            return 'bg-gradient-to-r from-purple-600 to-indigo-600 bg-opacity-90 text-yellow-100 shadow-lg shadow-indigo-500/30';
        } else {
            return 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-opacity-90 text-blue-100 shadow-lg shadow-blue-500/30';
        }
    };

    return (
        <div className='w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-8 bg-opacity-90 backdrop-blur-sm border border-white border-opacity-40 relative'>
            {/* Decorative elements */}
            <div className='absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-10'></div>
            <div className='absolute bottom-0 left-0 w-40 h-40 -mb-16 -ml-16 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full opacity-10'></div>
            <div className='absolute top-10 left-10 w-24 h-24 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 opacity-30 blur-xl'></div>
            <div className='absolute bottom-20 right-10 w-32 h-32 rounded-full bg-gradient-to-r from-blue-300 to-indigo-300 opacity-30 blur-xl'></div>

            {/* Video element - hidden but used for capture */}
            <video ref={videoRef} autoPlay playsInline className='hidden' />

            <div className='relative'>
                {/* Display canvas (for both direct video and segmentation) */}
                <canvas ref={displayCanvasRef} className='w-full h-auto rounded-xl'></canvas>

                {!modelLoaded && state.selectedBackground && (
                    <div className='absolute top-0 left-0 right-0 bg-yellow-500 text-black p-2 text-center'>
                        <p>Loading segmentation model for better backgrounds...</p>
                    </div>
                )}

                {(cameraError || segmentationError) && (
                    <div className='absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center'>
                        <p>{cameraError || segmentationError}</p>
                    </div>
                )}

                {showCountdown && (
                    <div className='absolute z-20 inset-0 flex flex-col items-center justify-center'>
                        <div
                            className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-full w-48 h-48 flex items-center justify-center shadow-2xl border-4 border-${getCountdownColor().replace(
                                'text-',
                                ''
                            )} transform ${
                                countdown > 0 ? 'scale-100 animate-pulse' : 'scale-110'
                            } transition-all duration-300`}
                        >
                            {countdown > 0 ? (
                                <span className={`text-9xl font-bold ${getCountdownColor()} drop-shadow-lg`}>
                                    {countdown}
                                </span>
                            ) : (
                                <div className='relative w-full h-full'>
                                    {/* Main flash effect */}
                                    <div className='absolute inset-0 bg-white opacity-70 animate-pulse'></div>

                                    {/* Center light source */}
                                    <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
                                        <div className='h-12 w-12 bg-white rounded-full opacity-90 shadow-lg'></div>
                                        <div className='absolute inset-0 rounded-full bg-white animate-ping'></div>
                                        <div className='absolute inset-0 rounded-full bg-white shadow-[0_0_15px_12px_rgba(255,255,255,0.7)]'></div>
                                    </div>

                                    {/* Light rays */}
                                    <div className='absolute left-0 top-1/2 h-1 w-full bg-gradient-to-r from-white via-yellow-50 to-transparent -translate-y-1/2'></div>
                                    <div className='absolute left-1/2 top-0 w-1 h-full bg-gradient-to-b from-white via-yellow-50 to-transparent -translate-x-1/2'></div>
                                    <div className='absolute left-0 top-0 w-full h-full'>
                                        <div className='absolute top-0 left-0 right-0 bottom-0 bg-gradient-radial from-white via-transparent to-transparent opacity-60'></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div
                            className={`mt-8 ${getMessageStyles()} px-10 py-5 rounded-xl shadow-xl transform transition-all duration-300 ${
                                message === 'Smile!' ? 'scale-110' : 'scale-100'
                            }`}
                        >
                            <p className='text-3xl font-bold text-white drop-shadow-md'>{message}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className='p-4 text-center bg-gradient-to-r from-purple-100 to-blue-100 mt-6 rounded-xl'>
                <p className='text-2xl font-semibold text-gray-700'>
                    Photo <span className='text-purple-600'>{photosTaken + 1}</span> of{' '}
                    <span className='text-blue-600'>{state.photosPerSession}</span>
                </p>

                {!state.selectedBackground && (
                    <p className='mt-2 text-amber-600 font-medium'>
                        Using natural background (no virtual background selected)
                    </p>
                )}

                {state.selectedFilter && state.selectedFilter !== 'normal' && (
                    <p className='mt-2 text-indigo-600 font-medium'>
                        Filter applied: {state.availableFilters.find(f => f.id === state.selectedFilter)?.name}
                    </p>
                )}
            </div>
        </div>
    );
}
