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
    const { state, dispatch } = useContext(PhotoboothContext);
    const animationRef = useRef(null);
    const backgroundImageRef = useRef(null);

    // Initialize camera and load TensorFlow model
    useEffect(() => {
        // Start camera
        if (videoRef.current) {
            navigator.mediaDevices
                .getUserMedia({
                    video: {
                        facingMode: 'environment',
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    },
                })
                .then(stream => {
                    videoRef.current.srcObject = stream;
                })
                .catch(err => {
                    console.error('Camera error:', err);
                    navigator.mediaDevices
                        .getUserMedia({ video: true })
                        .then(stream => {
                            videoRef.current.srcObject = stream;
                        })
                        .catch(fallbackErr => {
                            console.error('Fallback camera also failed:', fallbackErr);
                        });
                });
        }

        // Load background image if selected
        if (state.selectedBackground) {
            backgroundImageRef.current = new Image();
            backgroundImageRef.current.src = state.selectedBackground.url;
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
            }
        };

        loadModel();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    // Setup segmentation preview when model is loaded
    useEffect(() => {
        if (!model || !videoRef.current || !displayCanvasRef.current || !state.selectedBackground) return;

        const segmentAndRender = async () => {
            if (!videoRef.current || !displayCanvasRef.current || !model) return;

            // Check if video is ready
            if (videoRef.current.readyState < 2) {
                animationRef.current = requestAnimationFrame(segmentAndRender);
                return;
            }

            try {
                // Get video dimensions
                const width = videoRef.current.videoWidth;
                const height = videoRef.current.videoHeight;

                // Ensure canvas has correct dimensions
                if (displayCanvasRef.current.width !== width || displayCanvasRef.current.height !== height) {
                    displayCanvasRef.current.width = width;
                    displayCanvasRef.current.height = height;
                }

                // Get segmentation data
                const segmentation = await model.segmentPerson(videoRef.current, {
                    flipHorizontal: false,
                    internalResolution: 'medium',
                    segmentationThreshold: 0.7,
                });

                const ctx = displayCanvasRef.current.getContext('2d');

                // Draw background image
                if (backgroundImageRef.current) {
                    ctx.drawImage(backgroundImageRef.current, 0, 0, width, height);
                } else {
                    // If no background image, fill with a color
                    ctx.fillStyle = 'black';
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

                // Put the modified image data back
                ctx.putImageData(imageData, 0, 0);
            } catch (error) {
                console.error('Segmentation error:', error);
            }

            // Continue loop only if we're not taking a photo
            if (countdown > 0 || (countdown === 0 && message !== 'Smile!')) {
                animationRef.current = requestAnimationFrame(segmentAndRender);
            }
        };

        // Start the segmentation loop
        segmentAndRender();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [model, state.selectedBackground, countdown, message]);

    // Handle countdown and photo capture
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            // Take photo
            setMessage('Smile!');

            setTimeout(async () => {
                if (!videoRef.current || !canvasRef.current || !model) return;

                try {
                    // Get video dimensions
                    const width = videoRef.current.videoWidth;
                    const height = videoRef.current.videoHeight;

                    // Prepare canvas for photo capture
                    canvasRef.current.width = width;
                    canvasRef.current.height = height;
                    const ctx = canvasRef.current.getContext('2d');

                    // Get segmentation
                    const segmentation = await model.segmentPerson(videoRef.current, {
                        flipHorizontal: false,
                        internalResolution: 'medium',
                        segmentationThreshold: 0.7,
                    });

                    // Draw background first
                    if (backgroundImageRef.current) {
                        ctx.drawImage(backgroundImageRef.current, 0, 0, width, height);
                    } else {
                        ctx.fillStyle = 'black';
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

                    // Get the image as data URL
                    const photo = canvasRef.current.toDataURL('image/jpeg', 0.9);
                    dispatch({ type: 'ADD_PHOTO', payload: photo });
                } catch (error) {
                    console.error('Photo capture error:', error);

                    // Fallback: just take a screenshot of the display canvas
                    const displayCanvas = displayCanvasRef.current;
                    if (displayCanvas) {
                        const photo = displayCanvas.toDataURL('image/jpeg', 0.9);
                        dispatch({ type: 'ADD_PHOTO', payload: photo });
                    }
                }

                // First hide the countdown
                setShowCountdown(false);

                // Then wait before starting the next photo sequence
                setTimeout(() => {
                    setPhotosTaken(prev => {
                        const newCount = prev + 1;

                        if (newCount >= state.photosPerSession) {
                            dispatch({ type: 'SET_VIEW', payload: 'preview' });
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
    }, [countdown, photosTaken, state.photosPerSession, dispatch, model]);

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
        <div className='w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden'>
            {/* Hidden elements for processing */}
            <canvas ref={canvasRef} className='hidden'></canvas>
            <video ref={videoRef} autoPlay playsInline className='hidden' />

            <div className='relative'>
                {/* Display segmented view */}
                <canvas ref={displayCanvasRef} className='w-full h-auto'></canvas>

                {!modelLoaded && state.selectedBackground && (
                    <div className='absolute top-0 left-0 right-0 bg-yellow-500 text-black p-2 text-center'>
                        <p>Loading segmentation model for better backgrounds...</p>
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

            <div className='p-4 text-center bg-gradient-to-r from-purple-100 to-blue-100'>
                <p className='text-2xl font-semibold text-gray-700'>
                    Photo <span className='text-purple-600'>{photosTaken + 1}</span> of{' '}
                    <span className='text-blue-600'>{state.photosPerSession}</span>
                </p>
            </div>
        </div>
    );
}
