'use client';
import { useRef, useEffect, useContext, useState } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';
import * as bodyPix from '@tensorflow-models/body-pix';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import { Camera } from './cameraview/Camera';
import { OptionsPanel } from './cameraview/OptionsPanel';
import { ControlButtons } from './cameraview/ControlButtons';
import { Footer } from './cameraview/Footer';

export default function CameraPreview() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [modelLoaded, setModelLoaded] = useState(false);
    const [model, setModel] = useState(null);
    const { state, dispatch } = useContext(PhotoboothContext);
    const animationRef = useRef(null);
    const backgroundImageRef = useRef(null);
    const [error, setError] = useState(null);
    const [selectedTab, setSelectedTab] = useState('backgrounds');
    const [isLoading, setIsLoading] = useState(true);
    const isMountedRef = useRef(true);

    // Initialize camera with simpler approach
    const initializeCamera = async () => {
        if (!videoRef.current || !isMountedRef.current) return;

        try {
            setIsLoading(true);
            // First try user-facing camera for selfies
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'user' } },
                audio: false,
            });

            if (videoRef.current && isMountedRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    if (isMountedRef.current) {
                        setIsLoading(false);
                    }
                };
            }
        } catch (err) {
            console.error('Front camera access failed, trying any camera:', err);

            // Fallback to any available camera
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                });

                if (videoRef.current && isMountedRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        if (isMountedRef.current) {
                            setIsLoading(false);
                        }
                    };
                }
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

    // Camera and model initialization logic
    useEffect(() => {
        isMountedRef.current = true;
        initializeCamera();

        // Load background image if selected
        if (state.selectedBackground && state.selectedBackground.url) {
            backgroundImageRef.current = new Image();
            backgroundImageRef.current.src = state.selectedBackground.url;

            // Handle loading errors
            backgroundImageRef.current.onerror = () => {
                if (isMountedRef.current) {
                    console.warn(`Failed to load background image: ${state.selectedBackground.url}`);
                    backgroundImageRef.current = null;
                }
            };
        } else {
            backgroundImageRef.current = null;
        }

        // Preload the segmentation model (only if a background is selected)
        const loadModel = async () => {
            if (state.selectedBackground && isMountedRef.current) {
                try {
                    console.log('Loading BodyPix model...');
                    // Explicitly set preferred backend before loading the model
                    await tf.setBackend('webgl');
                    console.log('Using backend:', tf.getBackend());

                    if (!isMountedRef.current) return;

                    const loadedModel = await bodyPix.load({
                        architecture: 'MobileNetV1',
                        outputStride: 16,
                        multiplier: 0.75,
                        quantBytes: 2,
                    });

                    if (!isMountedRef.current) return;

                    console.log('BodyPix model loaded successfully');
                    setModel(loadedModel);
                    setModelLoaded(true);
                } catch (error) {
                    console.error('Failed to load BodyPix model:', error);
                    // Try with CPU backend as fallback
                    if (!isMountedRef.current) return;

                    try {
                        console.log('Trying CPU backend as fallback...');
                        await tf.setBackend('cpu');
                        console.log('Using backend:', tf.getBackend());

                        if (!isMountedRef.current) return;

                        const loadedModel = await bodyPix.load({
                            architecture: 'MobileNetV1',
                            outputStride: 16,
                            multiplier: 0.5, // Lower multiplier for CPU
                            quantBytes: 2,
                        });

                        if (!isMountedRef.current) return;

                        console.log('BodyPix model loaded successfully with CPU backend');
                        setModel(loadedModel);
                        setModelLoaded(true);
                    } catch (fallbackError) {
                        if (!isMountedRef.current) return;
                        console.error('Failed to load BodyPix model with fallback:', fallbackError);
                        setModelLoaded(false);
                        setError('Failed to load the background segmentation model. Please try again later.');
                    }
                }
            }
        };

        loadModel();

        return () => {
            isMountedRef.current = false;

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

    // Segmentation logic
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

                // Get canvas context safely with willReadFrequently flag
                const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
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
                if (!isMounted || !canvasRef.current || !ctx) {
                    console.log('Component unmounted during segmentation, aborting');
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
                const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
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
                if (!isMounted || !canvasRef.current || !ctx) {
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
        if (videoRef.current && state.selectedFilter) {
            const filter = state.availableFilters.find(f => f.id === state.selectedFilter);
            if (filter && filter.style.filter) {
                videoRef.current.style.filter = filter.style.filter;
            } else {
                videoRef.current.style.filter = '';
            }
        }
    }, [state.selectedFilter, state.availableFilters]);

    // Apply a filter
    const applyFilter = filterId => {
        dispatch({ type: 'SET_FILTER', payload: filterId });
    };

    return (
        <div className='p-4 max-w-full w-full sm:max-w-2xl md:max-w-4xl mx-auto bg-white bg-opacity-90 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl sm:shadow-2xl border border-white border-opacity-40 relative h-full flex flex-col overflow-hidden'>
            {/* Decorative elements */}
            <div className='absolute top-0 right-0 w-16 sm:w-24 md:w-32 h-16 sm:h-24 md:h-32 -mt-5 sm:-mt-8 md:-mt-10 -mr-5 sm:-mr-8 md:-mr-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-10 hidden sm:block'></div>
            <div className='absolute bottom-0 left-0 w-20 sm:w-32 md:w-40 h-20 sm:h-32 md:h-40 -mb-8 sm:-mb-12 md:-mb-16 -ml-8 sm:-ml-12 md:-ml-16 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full opacity-10 hidden sm:block'></div>

            <Camera
                videoRef={videoRef}
                canvasRef={canvasRef}
                isLoading={isLoading}
                state={state}
                modelLoaded={modelLoaded}
                error={error}
            />

            <OptionsPanel selectedTab={selectedTab} setSelectedTab={setSelectedTab} state={state} dispatch={dispatch} />

            <ControlButtons dispatch={dispatch} />

            <Footer state={state} />
        </div>
    );
}
