'use client';
import { useState, useEffect, useRef, useContext } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';
import * as bodyPix from '@tensorflow-models/body-pix';
import * as tf from '@tensorflow/tfjs';

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
            // Try main camera first
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true, // Simplified request without specifics
                audio: false,
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Camera access failed:', err);
            setError(
                'Could not access camera. Please check your browser permissions and ensure your camera is working.'
            );
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

        // Preload the segmentation model
        const loadModel = async () => {
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
                setError('Failed to load the background segmentation model. Please try again later.');
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

    // Setup segmentation preview when model is loaded
    useEffect(() => {
        // Important check: If we don't have all required elements, don't proceed
        if (!model || !videoRef.current || !displayCanvasRef.current) {
            console.log('Missing required elements for segmentation:', {
                model: !!model,
                video: !!videoRef.current,
                canvas: !!displayCanvasRef.current,
            });
            return;
        }

        // If no background is selected, don't try to do segmentation
        if (!state.selectedBackground) {
            console.log('No background selected, skipping segmentation');
            return;
        }

        let isMounted = true;

        const segmentAndRender = async () => {
            // Safety check if component unmounted or refs changed
            if (!isMounted || !videoRef.current || !displayCanvasRef.current || !model) {
                console.log('Segmentation stopped - component state changed');
                return;
            }

            // Check if video is ready
            if (videoRef.current.readyState < 2) {
                console.log('Video not ready yet, waiting...');
                animationRef.current = requestAnimationFrame(segmentAndRender);
                return;
            }

            try {
                // Get video dimensions
                const width = videoRef.current.videoWidth;
                const height = videoRef.current.videoHeight;

                // Double-check canvas ref before modifying
                if (!displayCanvasRef.current) {
                    console.error('Canvas reference lost during segmentation');
                    return;
                }

                // Ensure canvas has correct dimensions
                if (displayCanvasRef.current.width !== width || displayCanvasRef.current.height !== height) {
                    displayCanvasRef.current.width = width;
                    displayCanvasRef.current.height = height;
                }

                // Get canvas context safely
                const ctx = displayCanvasRef.current.getContext('2d');
                if (!ctx) {
                    console.error('Failed to get canvas context');
                    return;
                }

                // Get segmentation data
                const segmentation = await model.segmentPerson(videoRef.current, {
                    flipHorizontal: false,
                    internalResolution: 'medium',
                    segmentationThreshold: 0.7,
                });

                // Safety check again after async operation
                if (!displayCanvasRef.current || !ctx) {
                    console.error('Canvas reference lost during segmentation processing');
                    return;
                }

                // Draw background image or color
                if (backgroundImageRef.current) {
                    try {
                        ctx.drawImage(backgroundImageRef.current, 0, 0, width, height);
                    } catch (err) {
                        console.error('Error drawing background image:', err);
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
                if (!tempCtx) {
                    console.error('Failed to get temporary canvas context');
                    return;
                }

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

                // Final safety check
                if (!displayCanvasRef.current || !ctx) {
                    console.error('Canvas reference lost before putting image data');
                    return;
                }

                // Put the modified image data back
                ctx.putImageData(imageData, 0, 0);
            } catch (error) {
                console.error('Segmentation error:', error);
                // Don't set state error here to avoid too many re-renders
            }

            // Continue loop only if we're not taking a photo and component is still mounted
            if (isMounted && (countdown > 0 || (countdown === 0 && message !== 'Smile!'))) {
                animationRef.current = requestAnimationFrame(segmentAndRender);
            }
        };

        // Start the segmentation loop
        console.log('Starting segmentation loop');
        segmentAndRender();

        return () => {
            console.log('Cleaning up segmentation loop');
            isMounted = false;
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, [model, state.selectedBackground, countdown, message]);

    // Function to render a fallback view when no segmentation is possible
    const renderFallbackView = () => {
        if (videoRef.current && displayCanvasRef.current) {
            const ctx = displayCanvasRef.current.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0, displayCanvasRef.current.width, displayCanvasRef.current.height);
            }
        }
    };

    // Simple fallback for showing video when segmentation is not working
    useEffect(() => {
        if (!model && videoRef.current && displayCanvasRef.current) {
            const interval = setInterval(() => {
                if (videoRef.current.readyState >= 2) {
                    renderFallbackView();
                }
            }, 100);

            return () => clearInterval(interval);
        }
    }, [model]);

    // Function to capture photo
    const capturePhoto = async () => {
        if (!videoRef.current || !canvasRef.current) {
            console.error('Missing required elements for photo capture');
            setError('Failed to capture photo. Missing camera.');
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

            if (!ctx) {
                console.error('Failed to get canvas context for photo capture');
                setError('Error capturing photo. Please try again.');
                return null;
            }

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
                        console.error('Error drawing background image during capture:', err);
                        // Fallback to color
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

                if (!tempCtx) {
                    console.error('Failed to get temporary canvas context for photo capture');
                    setError('Error processing photo. Please try again.');
                    return null;
                }

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

            // Get the image as data URL
            const photo = canvasRef.current.toDataURL('image/jpeg', 0.9);
            setError(null);
            return photo;
        } catch (error) {
            console.error('Photo capture error:', error);
            setError('Failed to process photo. Trying fallback method...');

            try {
                // Ultimate fallback: just capture the video frame
                const fallbackCanvas = document.createElement('canvas');
                fallbackCanvas.width = videoRef.current.videoWidth;
                fallbackCanvas.height = videoRef.current.videoHeight;
                const fallbackCtx = fallbackCanvas.getContext('2d');

                if (fallbackCtx && videoRef.current) {
                    fallbackCtx.drawImage(videoRef.current, 0, 0);
                    const photo = fallbackCanvas.toDataURL('image/jpeg', 0.9);
                    setError(null);
                    return photo;
                } else {
                    setError('All photo capture methods failed. Please try again.');
                    return null;
                }
            } catch (ultimateFallbackError) {
                console.error('Ultimate fallback also failed:', ultimateFallbackError);
                setError('Photo capture failed completely. Please restart the app.');
                return null;
            }
        }
    };

    // Handle countdown and photo capture
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            // Take photo
            setMessage('Smile!');

            setTimeout(async () => {
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
            }, 500);
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
    const getMessageBgColor = () => {
        if (message === 'Smile!') {
            return 'bg-green-600 bg-opacity-80';
        }
        return 'bg-black bg-opacity-60';
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
            <video ref={videoRef} autoPlay playsInline className={model ? 'hidden' : 'w-full h-auto rounded-xl'} />

            <div className='relative'>
                {/* Display segmented view */}
                <canvas ref={displayCanvasRef} className={model ? 'w-full h-auto rounded-xl' : 'hidden'}></canvas>

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
                            className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-full w-48 h-48 flex items-center justify-center shadow-2xl border-4 ${
                                countdown > 0 ? `border-${getCountdownColor().replace('text-', '')}` : 'border-white'
                            } transform ${
                                countdown > 0 ? 'scale-100 animate-pulse' : 'scale-110'
                            } transition-all duration-300`}
                        >
                            <span className={`text-9xl font-bold ${getCountdownColor()} drop-shadow-lg`}>
                                {countdown > 0 ? countdown : '📸'}
                            </span>
                        </div>

                        <div
                            className={`mt-8 ${getMessageBgColor()} px-10 py-5 rounded-xl shadow-xl transform transition-all duration-300 ${
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
            </div>
        </div>
    );
}
