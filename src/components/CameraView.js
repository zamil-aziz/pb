'use client';
import { useRef, useEffect, useContext, useState } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';
import * as bodyPix from '@tensorflow-models/body-pix';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl'; // Import a backend
import '@tensorflow/tfjs-backend-cpu'; // Fallback backend
import BackgroundSelector from '../components/BackgroundSelector';

export default function CameraView() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [modelLoaded, setModelLoaded] = useState(false);
    const [model, setModel] = useState(null);
    const { state, dispatch } = useContext(PhotoboothContext);
    const animationRef = useRef(null);
    const backgroundImageRef = useRef(null);
    const [error, setError] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState(null);
    // Add this state to track the active tab
    const [selectedTab, setSelectedTab] = useState('backgrounds');

    // Define available filters
    const filters = [
        { id: 'normal', name: 'Normal', style: {} },
        { id: 'grayscale', name: 'Grayscale', style: { filter: 'grayscale(100%)' } },
        { id: 'sepia', name: 'Sepia', style: { filter: 'sepia(80%)' } },
        { id: 'vintage', name: 'Vintage', style: { filter: 'sepia(50%) contrast(120%) brightness(90%)' } },
        { id: 'cool', name: 'Cool', style: { filter: 'saturate(120%) hue-rotate(180deg)' } },
        { id: 'warm', name: 'Warm', style: { filter: 'saturate(130%) hue-rotate(30deg) brightness(105%)' } },
        { id: 'high-contrast', name: 'High Contrast', style: { filter: 'contrast(150%) brightness(110%)' } },
    ];

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
                    // Explicitly set preferred backend before loading the model
                    await tf.setBackend('webgl');
                    console.log('Using backend:', tf.getBackend());

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
                    // Try with CPU backend as fallback
                    try {
                        console.log('Trying CPU backend as fallback...');
                        await tf.setBackend('cpu');
                        console.log('Using backend:', tf.getBackend());

                        const loadedModel = await bodyPix.load({
                            architecture: 'MobileNetV1',
                            outputStride: 16,
                            multiplier: 0.5, // Lower multiplier for CPU
                            quantBytes: 2,
                        });
                        console.log('BodyPix model loaded successfully with CPU backend');
                        setModel(loadedModel);
                        setModelLoaded(true);
                    } catch (fallbackError) {
                        console.error('Failed to load BodyPix model with fallback:', fallbackError);
                        setModelLoaded(false);
                        setError('Failed to load the background segmentation model. Please try again later.');
                    }
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

            // Always continue the loop while component is mounted
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

    // Apply the selected filter
    useEffect(() => {
        if (videoRef.current && selectedFilter) {
            const filter = filters.find(f => f.id === selectedFilter);
            if (filter) {
                Object.assign(videoRef.current.style, filter.style);
            }
        }
    }, [selectedFilter]);

    // Apply a filter
    const applyFilter = filterId => {
        setSelectedFilter(filterId);
    };

    return (
        <div className='p-8 max-w-4xl mx-auto bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white border-opacity-40 relative overflow-hidden h-full flex flex-col'>
            {/* Decorative elements */}
            <div className='absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-10'></div>
            <div className='absolute bottom-0 left-0 w-40 h-40 -mb-16 -ml-16 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full opacity-10'></div>
            <div className='absolute top-10 left-10 w-24 h-24 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 opacity-30 blur-xl'></div>
            <div className='absolute bottom-20 right-10 w-32 h-32 rounded-full bg-gradient-to-r from-blue-300 to-indigo-300 opacity-30 blur-xl'></div>

            <h2 className='text-3xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600'>
                Ready to Take Your Photos
            </h2>

            <div
                className='relative mx-auto overflow-hidden rounded-xl shadow-lg mb-4 flex-shrink-0'
                style={{ height: '40vh' }}
            >
                {/* Show video directly when no background is selected */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={
                        !state.selectedBackground || !modelLoaded ? 'w-full h-full object-cover rounded-xl' : 'hidden'
                    }
                    style={selectedFilter ? filters.find(f => f.id === selectedFilter)?.style : {}}
                />

                {/* Canvas for segmentation when background is selected */}
                <canvas
                    ref={canvasRef}
                    className={
                        state.selectedBackground && modelLoaded ? 'w-full h-full object-cover rounded-xl' : 'hidden'
                    }
                    style={selectedFilter ? filters.find(f => f.id === selectedFilter)?.style : {}}
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

            {/* Options panel - with updated UI */}
            <div
                className='mb-4 bg-white bg-opacity-80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 flex-shrink-0 overflow-hidden'
                style={{ maxHeight: '35vh' }}
            >
                <div className='flex text-center border-b border-purple-100'>
                    <button
                        className={`flex-1 py-3 px-4 font-medium text-lg ${
                            selectedTab === 'backgrounds'
                                ? 'text-purple-700 border-b-2 border-purple-600'
                                : 'text-gray-600 hover:text-purple-600'
                        }`}
                        onClick={() => setSelectedTab('backgrounds')}
                    >
                        Backgrounds
                    </button>
                    <button
                        className={`flex-1 py-3 px-4 font-medium text-lg ${
                            selectedTab === 'filters'
                                ? 'text-purple-700 border-b-2 border-purple-600'
                                : 'text-gray-600 hover:text-purple-600'
                        }`}
                        onClick={() => setSelectedTab('filters')}
                    >
                        Filters
                    </button>
                </div>

                <div className='p-4 overflow-y-auto' style={{ maxHeight: '28vh' }}>
                    {selectedTab === 'backgrounds' && (
                        <div className='space-y-4'>
                            <div className='flex justify-between items-center'>
                                <h3 className='text-lg font-semibold text-purple-700'>Choose Background</h3>
                                {state.selectedBackground && (
                                    <button
                                        onClick={() => dispatch({ type: 'SET_BACKGROUND', payload: null })}
                                        className='text-sm text-purple-600 hover:text-purple-800 flex items-center'
                                    >
                                        <span className='mr-1'>Reset</span>
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            className='h-4 w-4'
                                            fill='none'
                                            viewBox='0 0 24 24'
                                            stroke='currentColor'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M6 18L18 6M6 6l12 12'
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <BackgroundSelector />
                        </div>
                    )}

                    {selectedTab === 'filters' && (
                        <div className='space-y-4'>
                            <div className='flex justify-between items-center'>
                                <h3 className='text-lg font-semibold text-purple-700'>Choose Filter</h3>
                                {selectedFilter && selectedFilter !== 'normal' && (
                                    <button
                                        onClick={() => applyFilter('normal')}
                                        className='text-sm text-purple-600 hover:text-purple-800 flex items-center'
                                    >
                                        <span className='mr-1'>Reset</span>
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            className='h-4 w-4'
                                            fill='none'
                                            viewBox='0 0 24 24'
                                            stroke='currentColor'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M6 18L18 6M6 6l12 12'
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <div className='grid grid-cols-3 sm:grid-cols-4 gap-3'>
                                {filters.map(filter => (
                                    <div
                                        key={filter.id}
                                        onClick={() => applyFilter(filter.id)}
                                        className={`relative rounded-lg overflow-hidden cursor-pointer transition-all transform hover:scale-105 ${
                                            selectedFilter === filter.id ? 'ring-2 ring-purple-600 scale-105' : ''
                                        }`}
                                    >
                                        <div
                                            className='h-16 w-full bg-gradient-to-r from-indigo-200 to-purple-200'
                                            style={filter.style}
                                        ></div>
                                        <div
                                            className={`text-center py-1 text-sm ${
                                                selectedFilter === filter.id
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {filter.name}
                                        </div>
                                        {selectedFilter === filter.id && (
                                            <div className='absolute top-1 right-1'>
                                                <svg
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    className='h-5 w-5 text-white bg-purple-600 rounded-full p-1'
                                                    fill='none'
                                                    viewBox='0 0 24 24'
                                                    stroke='currentColor'
                                                >
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M5 13l4 4L19 7'
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className='grid grid-cols-2 gap-4 mb-3 mt-auto'>
                <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'countdown' })}
                    className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl text-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl'
                >
                    Take Photos
                </button>

                <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'welcome' })}
                    className='bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-6 rounded-xl text-xl shadow-lg transform transition-all duration-300 hover:scale-105'
                >
                    Go Back
                </button>
            </div>

            <div className='text-center'>
                <p className='text-md text-gray-700 mb-1'>{state.photosPerSession} photos will be taken</p>
                <p className='text-sm text-gray-500'>Get ready to strike your best pose!</p>

                {!state.selectedBackground && (
                    <p className='mt-2 text-amber-400 text-sm font-medium'>
                        No background selected. Photos will be taken with your natural background.
                    </p>
                )}
            </div>
        </div>
    );
}
