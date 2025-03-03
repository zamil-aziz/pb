'use client';
import { useRef, useEffect, useContext, useState } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';
import * as bodyPix from '@tensorflow-models/body-pix';

export default function CameraView() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [modelLoaded, setModelLoaded] = useState(false);
    const [model, setModel] = useState(null);
    const { state, dispatch } = useContext(PhotoboothContext);
    const animationRef = useRef(null);
    const backgroundImageRef = useRef(null);
    const [error, setError] = useState(null);

    // Initialize camera with simpler approach
    const initializeCamera = async () => {
        if (!videoRef.current) return;

        try {
            // Try main camera first
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
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

        // Preload the segmentation model (only if a background is selected)
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
                    setError('Failed to load the background segmentation model. Please try again later.');
                }
            }
        };

        loadModel();

        return () => {
            // Clean up camera stream
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            // Cancel animation frame
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, [state.selectedBackground]);

    // Setup segmentation preview when model is loaded
    useEffect(() => {
        // If no background is selected, don't try to do segmentation
        if (!state.selectedBackground) {
            return;
        }

        // Important check: If we don't have all required elements, don't proceed
        if (!model || !videoRef.current || !canvasRef.current) {
            console.log('Missing required elements for segmentation:', {
                model: !!model,
                video: !!videoRef.current,
                canvas: !!canvasRef.current,
            });
            return;
        }

        let isMounted = true;

        const segmentAndRender = async () => {
            // Safety check if component unmounted or refs changed
            if (!isMounted || !videoRef.current || !canvasRef.current || !model) {
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
                if (!canvasRef.current) {
                    console.error('Canvas reference lost during segmentation');
                    return;
                }

                // Ensure canvas has correct dimensions
                if (canvasRef.current.width !== width || canvasRef.current.height !== height) {
                    canvasRef.current.width = width;
                    canvasRef.current.height = height;
                }

                // Get canvas context safely
                const ctx = canvasRef.current.getContext('2d');
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
                if (!canvasRef.current || !ctx) {
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
                if (!canvasRef.current || !ctx) {
                    console.error('Canvas reference lost before putting image data');
                    return;
                }

                // Put the modified image data back
                ctx.putImageData(imageData, 0, 0);
            } catch (error) {
                console.error('Segmentation error:', error);
                // Don't set state error here to avoid too many re-renders
            }

            // Continue loop only if still mounted
            if (isMounted) {
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
    }, [model, state.selectedBackground]);

    return (
        <div className='p-8 max-w-4xl mx-auto bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white border-opacity-40 relative overflow-hidden'>
            {/* Decorative elements */}
            <div className='absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-10'></div>
            <div className='absolute bottom-0 left-0 w-40 h-40 -mb-16 -ml-16 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full opacity-10'></div>
            <div className='absolute top-10 left-10 w-24 h-24 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 opacity-30 blur-xl'></div>
            <div className='absolute bottom-20 right-10 w-32 h-32 rounded-full bg-gradient-to-r from-blue-300 to-indigo-300 opacity-30 blur-xl'></div>

            <h2 className='text-4xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600'>
                Ready to Take Your Photos
            </h2>

            <div className='relative mx-auto overflow-hidden rounded-xl shadow-lg mb-8'>
                {/* Show video directly when no background is selected */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={!state.selectedBackground || !modelLoaded ? 'w-full h-auto rounded-xl' : 'hidden'}
                />

                {/* Canvas for segmentation when background is selected */}
                <canvas
                    ref={canvasRef}
                    className={state.selectedBackground && modelLoaded ? 'w-full h-auto rounded-xl' : 'hidden'}
                />

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
            </div>

            <div className='grid grid-cols-2 gap-6 mb-6'>
                <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'countdown' })}
                    className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-6 px-8 rounded-xl text-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl'
                >
                    Take Photos
                </button>

                <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'welcome' })}
                    className='bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-6 px-8 rounded-xl text-2xl shadow-lg transform transition-all duration-300 hover:scale-105'
                >
                    Go Back
                </button>
            </div>

            <div className='text-center'>
                <p className='text-xl text-gray-700 mb-2'>{state.photosPerSession} photos will be taken</p>
                <p className='text-lg text-gray-500'>Get ready to strike your best pose!</p>

                {!state.selectedBackground && (
                    <p className='mt-4 text-amber-400 font-medium'>
                        No background selected. Photos will be taken with your natural background.
                    </p>
                )}
            </div>
        </div>
    );
}
