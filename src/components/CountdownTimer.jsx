'use client';
import { useState, useEffect, useRef, useContext } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';
import * as bodyPix from '@tensorflow-models/body-pix';

export default function CountdownTimer() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const displayCanvasRef = useRef(null);
    const [countdown, setCountdown] = useState(3);
    const [photosTaken, setPhotosTaken] = useState(0);
    const [message, setMessage] = useState('Get Ready!');
    const [showCountdown, setShowCountdown] = useState(true);
    const [modelLoaded, setModelLoaded] = useState(false);
    const [model, setModel] = useState(null);
    const [error, setError] = useState(null);
    const { state, dispatch } = useContext(PhotoboothContext);
    const animationRef = useRef(null);
    const backgroundImageRef = useRef(null);

    // Use refs to track actions that should happen after render
    const photoTakenRef = useRef(false);
    const photoDataRef = useRef(null);

    // Initialize camera with simpler approach
    const initializeCamera = async () => {
        if (!videoRef.current) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;

                // Apply the selected filter from context if any
                if (state.selectedFilter) {
                    const filterObj = state.availableFilters.find(f => f.id === state.selectedFilter);
                    if (filterObj && filterObj.style.filter) {
                        videoRef.current.style.filter = filterObj.style.filter;
                    }
                }
            }
        } catch (err) {
            console.error('Camera access failed:', err);
            setError('Could not access camera. Please check your browser permissions.');
        }
    };

    // Initialize camera and load TensorFlow model
    useEffect(() => {
        initializeCamera();

        // Load background image if selected
        if (state.selectedBackground && state.selectedBackground.url) {
            backgroundImageRef.current = new Image();
            backgroundImageRef.current.src = state.selectedBackground.url;

            // Handle loading errors
            backgroundImageRef.current.onerror = () => {
                console.warn(`Failed to load background image: ${state.selectedBackground.url}`);
                backgroundImageRef.current = null;
            };
        } else {
            backgroundImageRef.current = null;
        }

        // Preload the segmentation model only if background is selected
        const loadModel = async () => {
            if (state.selectedBackground) {
                try {
                    console.log('Loading BodyPix model...');
                    const loadedModel = await bodyPix.load({
                        architecture: 'MobileNetV1',
                        outputStride: 16,
                        multiplier: 0.75,
                        quantBytes: 2,
                    });
                    console.log('BodyPix model loaded successfully');
                    setModel(loadedModel);
                    setModelLoaded(true);
                } catch (error) {
                    console.error('Failed to load BodyPix model:', error);
                    setModelLoaded(false);
                    setError('Failed to load the background segmentation model.');
                }
            }
        };

        loadModel();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, []);

    // Handle when a photo is taken
    useEffect(() => {
        if (photoTakenRef.current && photoDataRef.current) {
            // Process the photo data - this is now safely done in a useEffect
            dispatch({ type: 'ADD_PHOTO', payload: photoDataRef.current });

            // Reset the refs
            photoTakenRef.current = false;
            photoDataRef.current = null;
        }
    }, [photoTakenRef.current, photoDataRef.current, dispatch]);

    // Setup segmentation preview when model is loaded and background is selected
    useEffect(() => {
        // Skip segmentation if no background is selected
        if (!state.selectedBackground) {
            return;
        }

        // Skip if missing required elements
        if (!model || !videoRef.current || !displayCanvasRef.current) {
            return;
        }

        let isMounted = true;

        const segmentAndRender = async () => {
            if (!isMounted || !videoRef.current || !displayCanvasRef.current || !model) {
                return;
            }

            // Check if video is ready
            if (videoRef.current.readyState < 2) {
                animationRef.current = requestAnimationFrame(segmentAndRender);
                return;
            }

            try {
                // Get video dimensions
                const width = videoRef.current.videoWidth;
                const height = videoRef.current.videoHeight;

                if (!displayCanvasRef.current) return;

                // Ensure canvas has correct dimensions
                if (displayCanvasRef.current.width !== width || displayCanvasRef.current.height !== height) {
                    displayCanvasRef.current.width = width;
                    displayCanvasRef.current.height = height;
                }

                const ctx = displayCanvasRef.current.getContext('2d', { willReadFrequently: true });
                if (!ctx) return;

                // Get segmentation data
                const segmentation = await model.segmentPerson(videoRef.current, {
                    flipHorizontal: false,
                    internalResolution: 'medium',
                    segmentationThreshold: 0.7,
                });

                if (!displayCanvasRef.current || !ctx) return;

                // Draw background image or color
                if (backgroundImageRef.current) {
                    try {
                        ctx.drawImage(backgroundImageRef.current, 0, 0, width, height);
                    } catch (err) {
                        // Fallback to color
                        ctx.fillStyle = state.selectedBackground?.fallbackColor || 'black';
                        ctx.fillRect(0, 0, width, height);
                    }
                } else {
                    // If no background image, fill with the fallback color
                    ctx.fillStyle = state.selectedBackground?.fallbackColor || 'black';
                    ctx.fillRect(0, 0, width, height);
                }

                // Draw the person from the video
                const imageData = ctx.getImageData(0, 0, width, height);
                const pixel = imageData.data;

                // Create a temporary canvas to get video frame
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = width;
                tempCanvas.height = height;
                const tempCtx = tempCanvas.getContext('2d');
                if (!tempCtx) return;

                tempCtx.drawImage(videoRef.current, 0, 0);
                const videoData = tempCtx.getImageData(0, 0, width, height);

                // Apply segmentation mask
                for (let i = 0; i < segmentation.data.length; i++) {
                    const n = i * 4;
                    if (segmentation.data[i]) {
                        pixel[n] = videoData.data[n]; // Red
                        pixel[n + 1] = videoData.data[n + 1]; // Green
                        pixel[n + 2] = videoData.data[n + 2]; // Blue
                        pixel[n + 3] = 255; // Alpha
                    }
                }

                if (!displayCanvasRef.current || !ctx) return;

                // Put the modified image data back
                ctx.putImageData(imageData, 0, 0);

                // Apply filter if selected from context
                if (state.selectedFilter) {
                    const filterObj = state.availableFilters.find(f => f.id === state.selectedFilter);
                    if (filterObj && filterObj.style.filter) {
                        displayCanvasRef.current.style.filter = filterObj.style.filter;
                    }
                }
            } catch (error) {
                console.error('Segmentation error:', error);
            }

            // Always continue the loop while component is mounted
            if (isMounted) {
                animationRef.current = requestAnimationFrame(segmentAndRender);
            }
        };

        // Start the segmentation loop
        segmentAndRender();

        return () => {
            isMounted = false;
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, [model, state.selectedBackground, state.selectedFilter, state.availableFilters]);

    // Function to render a fallback view directly from video
    const renderVideoToCanvas = () => {
        if (videoRef.current && displayCanvasRef.current) {
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

                // Apply filter if selected from context
                if (state.selectedFilter) {
                    const filterObj = state.availableFilters.find(f => f.id === state.selectedFilter);
                    if (filterObj && filterObj.style.filter) {
                        displayCanvasRef.current.style.filter = filterObj.style.filter;
                    }
                }
            }
        }
    };

    // Simple fallback for showing video when no background or segmentation is not working
    useEffect(() => {
        // Only run this effect if we're not doing segmentation
        if ((!state.selectedBackground || !model) && videoRef.current && displayCanvasRef.current) {
            const interval = setInterval(() => {
                if (videoRef.current?.readyState >= 2) {
                    renderVideoToCanvas();
                }
            }, 33); // ~30fps

            return () => clearInterval(interval);
        }
    }, [state.selectedBackground, model, state.selectedFilter, state.availableFilters]);

    // Function to capture photo
    const capturePhoto = async () => {
        if (!videoRef.current || !canvasRef.current) {
            console.error('Missing required elements for photo capture');
            return null;
        }

        try {
            // Get video dimensions
            const width = videoRef.current.videoWidth;
            const height = videoRef.current.videoHeight;

            // Prepare canvas for photo capture
            canvasRef.current.width = width;
            canvasRef.current.height = height;
            const ctx = canvasRef.current.getContext('2d');

            if (!ctx) return null;

            // If we have model and background, use segmentation
            if (model && state.selectedBackground) {
                // Get segmentation
                const segmentation = await model.segmentPerson(videoRef.current, {
                    flipHorizontal: false,
                    internalResolution: 'medium',
                    segmentationThreshold: 0.7,
                });

                // Draw background first
                if (backgroundImageRef.current) {
                    try {
                        ctx.drawImage(backgroundImageRef.current, 0, 0, width, height);
                    } catch (err) {
                        ctx.fillStyle = state.selectedBackground?.fallbackColor || 'black';
                        ctx.fillRect(0, 0, width, height);
                    }
                } else {
                    ctx.fillStyle = state.selectedBackground?.fallbackColor || 'black';
                    ctx.fillRect(0, 0, width, height);
                }

                // Apply person segmentation
                const imageData = ctx.getImageData(0, 0, width, height);
                const pixels = imageData.data;

                // Get video frame
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = width;
                tempCanvas.height = height;
                const tempCtx = tempCanvas.getContext('2d');

                if (!tempCtx) return null;

                tempCtx.drawImage(videoRef.current, 0, 0);
                const videoData = tempCtx.getImageData(0, 0, width, height);

                // Apply mask
                for (let i = 0; i < segmentation.data.length; i++) {
                    const n = i * 4;
                    if (segmentation.data[i]) {
                        pixels[n] = videoData.data[n]; // Red
                        pixels[n + 1] = videoData.data[n + 1]; // Green
                        pixels[n + 2] = videoData.data[n + 2]; // Blue
                        pixels[n + 3] = 255; // Alpha
                    }
                }

                ctx.putImageData(imageData, 0, 0);
            } else {
                // Simple fallback - just draw the video frame
                ctx.drawImage(videoRef.current, 0, 0);
            }

            // Apply filter if selected from context - need to use CSS filter simulation on canvas
            if (state.selectedFilter) {
                const filterObj = state.availableFilters.find(f => f.id === state.selectedFilter);
                const filterStyle = filterObj?.style?.filter || '';

                // Create a temporary canvas to apply the filter
                const tempFilterCanvas = document.createElement('canvas');
                tempFilterCanvas.width = width;
                tempFilterCanvas.height = height;
                const tempFilterCtx = tempFilterCanvas.getContext('2d');

                if (tempFilterCtx) {
                    // Draw the current canvas to the temp canvas
                    tempFilterCtx.drawImage(canvasRef.current, 0, 0);

                    // Apply CSS filter effects manually
                    const imageData = tempFilterCtx.getImageData(0, 0, width, height);
                    const data = imageData.data;

                    // Apply filter effects based on the selected filter
                    if (filterStyle.includes('grayscale')) {
                        for (let i = 0; i < data.length; i += 4) {
                            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                            data[i] = avg; // R
                            data[i + 1] = avg; // G
                            data[i + 2] = avg; // B
                        }
                    } else if (filterStyle.includes('sepia')) {
                        for (let i = 0; i < data.length; i += 4) {
                            const r = data[i];
                            const g = data[i + 1];
                            const b = data[i + 2];

                            data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189); // R
                            data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168); // G
                            data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131); // B
                        }
                    } else if (filterStyle.includes('saturate')) {
                        // Simplified saturation adjustment
                        const saturationFactor = 1.3; // Corresponds to saturate(130%)
                        for (let i = 0; i < data.length; i += 4) {
                            // Convert RGB to HSL, adjust saturation, convert back to RGB
                            // This is simplified - a real implementation would use proper color space conversion
                            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                            data[i] = Math.min(255, avg + (data[i] - avg) * saturationFactor); // R
                            data[i + 1] = Math.min(255, avg + (data[i + 1] - avg) * saturationFactor); // G
                            data[i + 2] = Math.min(255, avg + (data[i + 2] - avg) * saturationFactor); // B
                        }
                    } else if (filterStyle.includes('contrast')) {
                        // Simplified contrast adjustment
                        const contrastFactor = 1.5; // Corresponds to contrast(150%)
                        for (let i = 0; i < data.length; i += 4) {
                            data[i] = Math.min(255, 128 + (data[i] - 128) * contrastFactor); // R
                            data[i + 1] = Math.min(255, 128 + (data[i + 1] - 128) * contrastFactor); // G
                            data[i + 2] = Math.min(255, 128 + (data[i + 2] - 128) * contrastFactor); // B
                        }
                    } else if (filterStyle.includes('hue-rotate')) {
                        // For hue-rotate and complex filters, we can use a CSS-based approach
                        // This is a simplified approach that doesn't fully simulate the filter
                        // For a more accurate implementation, use a full CSS filter polyfill
                        if (filterStyle.includes('saturate') || filterStyle.includes('brightness')) {
                            // For warm filter (hue-rotate + saturate + brightness)
                            // Slightly increase red, decrease blue for warm effect
                            for (let i = 0; i < data.length; i += 4) {
                                data[i] = Math.min(255, data[i] * 1.1); // Boost red
                                data[i + 2] = Math.min(255, data[i + 2] * 0.9); // Reduce blue
                            }
                        }
                    }

                    tempFilterCtx.putImageData(imageData, 0, 0);

                    // Draw the filtered image back to the main canvas
                    ctx.drawImage(tempFilterCanvas, 0, 0);
                }
            }

            // Get the image as data URL
            const photo = canvasRef.current.toDataURL('image/jpeg', 0.9);
            return photo;
        } catch (error) {
            console.error('Photo capture error:', error);

            try {
                // Fallback: just capture the video frame
                const fallbackCanvas = document.createElement('canvas');
                fallbackCanvas.width = videoRef.current.videoWidth;
                fallbackCanvas.height = videoRef.current.videoHeight;
                const fallbackCtx = fallbackCanvas.getContext('2d');

                if (fallbackCtx && videoRef.current) {
                    fallbackCtx.drawImage(videoRef.current, 0, 0);
                    return fallbackCanvas.toDataURL('image/jpeg', 0.9);
                }
            } catch (fallbackError) {
                console.error('Fallback capture also failed:', fallbackError);
            }
            return null;
        }
    };

    // Handle countdown and photo capture
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            // Show "Smile!" message
            setMessage('Smile!');

            // Keep preview running for 1 second while showing "Smile!"
            // Only take the photo after the delay
            setTimeout(async () => {
                // Take photo after the delay
                const photo = await capturePhoto();

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
            }, 1500); // Changed from 500ms to 1500ms (1.5 seconds total wait after "Smile!")
        }
    }, [countdown, photosTaken, state.photosPerSession]);

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

            {/* Hidden elements for processing */}
            <canvas ref={canvasRef} className='hidden'></canvas>

            {/* Video element - keep it for capture but hidden */}
            <video ref={videoRef} autoPlay playsInline className='hidden' />

            <div className='relative'>
                {/* Display canvas (for both direct video and segmentation) */}
                <canvas ref={displayCanvasRef} className='w-full h-auto rounded-xl'></canvas>

                {!modelLoaded && state.selectedBackground && (
                    <div className='absolute top-0 left-0 right-0 bg-yellow-500 text-black p-2 text-center'>
                        <p>Loading segmentation model for better backgrounds...</p>
                    </div>
                )}

                {error && (
                    <div className='absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center'>
                        <p>{error}</p>
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
                                    {/* Main flash effect - simple animation without keyframes */}
                                    <div className='absolute inset-0 bg-white opacity-70 animate-pulse'></div>

                                    {/* Center light source */}
                                    <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
                                        <div className='h-12 w-12 bg-white rounded-full opacity-90 shadow-lg'></div>
                                        <div className='absolute inset-0 rounded-full bg-white animate-ping'></div>
                                        <div className='absolute inset-0 rounded-full bg-white shadow-[0_0_15px_12px_rgba(255,255,255,0.7)]'></div>
                                    </div>

                                    {/* Light rays using standard utilities */}
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
