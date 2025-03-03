'use client';
import { useRef, useEffect, useContext, useState } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';
import * as bodyPix from '@tensorflow-models/body-pix';
import * as tf from '@tensorflow/tfjs';

export default function CameraView() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
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
                    console.error('Error accessing camera:', err);
                    // Fallback to any available camera
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
            // Clean up camera stream
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            // Cancel animation frame
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [state.selectedBackground]);

    // Setup segmentation preview when model is loaded
    useEffect(() => {
        if (!model || !videoRef.current || !canvasRef.current || !state.selectedBackground) return;

        const segmentAndRender = async () => {
            if (!videoRef.current || !canvasRef.current || !model) return;

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
                if (canvasRef.current.width !== width || canvasRef.current.height !== height) {
                    canvasRef.current.width = width;
                    canvasRef.current.height = height;
                }

                // Get segmentation data
                const segmentation = await model.segmentPerson(videoRef.current, {
                    flipHorizontal: false,
                    internalResolution: 'medium',
                    segmentationThreshold: 0.7,
                });

                const ctx = canvasRef.current.getContext('2d');

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

            // Continue loop
            animationRef.current = requestAnimationFrame(segmentAndRender);
        };

        // Start the segmentation loop
        segmentAndRender();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [model, state.selectedBackground]);

    return (
        <div className='w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden'>
            <h2 className='text-2xl font-bold p-4 text-gray-400 text-center'>Ready to Take Your Photos</h2>

            <div className='relative mx-auto overflow-hidden rounded-lg'>
                {/* Hide the video element but keep it for processing */}
                <video ref={videoRef} autoPlay playsInline className='hidden' />

                {/* Show the canvas with segmentation instead */}
                <canvas ref={canvasRef} className='w-full h-auto' />

                {!modelLoaded && state.selectedBackground && (
                    <div className='absolute top-0 left-0 right-0 bg-yellow-500 text-black p-2 text-center'>
                        <p>Loading segmentation model for better backgrounds...</p>
                    </div>
                )}
            </div>

            <div className='grid grid-cols-2 gap-4 p-6'>
                <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'countdown' })}
                    className='text-2xl bg-green-500 hover:bg-green-600 text-white font-bold py-6 px-8 rounded-xl shadow-lg'
                >
                    Take Photos
                </button>

                <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'welcome' })}
                    className='text-2xl bg-gray-500 hover:bg-gray-600 text-white font-bold py-6 px-8 rounded-xl shadow-lg'
                >
                    Go Back
                </button>
            </div>

            <div className='text-center p-4 text-gray-400'>
                <p className='text-lg'>{state.photosPerSession} photos will be taken. Get ready to pose!</p>
            </div>
        </div>
    );
}
