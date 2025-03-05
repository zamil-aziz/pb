'use client';
import { useState, useEffect, useRef } from 'react';
import * as bodyPix from '@tensorflow-models/body-pix';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

export const useSegmentation = (videoRef, background) => {
    const [modelLoaded, setModelLoaded] = useState(false);
    const [model, setModel] = useState(null);
    const [error, setError] = useState(null);
    const animationRef = useRef(null);
    const backgroundImageRef = useRef(null);
    const isMountedRef = useRef(true);

    // Load model effect
    useEffect(() => {
        isMountedRef.current = true;

        // Skip if no background selected
        if (!background) {
            setModel(null);
            setModelLoaded(false);
            return;
        }

        // Load background image if URL provided
        if (background.url) {
            backgroundImageRef.current = new Image();
            backgroundImageRef.current.src = background.url;

            // Handle loading errors
            backgroundImageRef.current.onerror = () => {
                if (isMountedRef.current) {
                    console.warn(`Failed to load background image: ${background.url}`);
                    backgroundImageRef.current = null;
                }
            };
        } else {
            backgroundImageRef.current = null;
        }

        // Load the model
        const loadModel = async () => {
            try {
                console.log('Loading BodyPix model...');
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
        };

        loadModel();

        return () => {
            isMountedRef.current = false;
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, [background]);

    // Apply segmentation to a canvas
    const applySegmentation = async targetCanvas => {
        if (!model || !videoRef.current || !targetCanvas || !background) {
            return false;
        }

        try {
            const width = videoRef.current.videoWidth;
            const height = videoRef.current.videoHeight;

            // Ensure canvas has correct dimensions
            if (targetCanvas.width !== width || targetCanvas.height !== height) {
                targetCanvas.width = width;
                targetCanvas.height = height;
            }

            const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return false;

            // Get segmentation data
            const segmentation = await model.segmentPerson(videoRef.current, {
                flipHorizontal: false,
                internalResolution: 'medium',
                segmentationThreshold: 0.7,
            });

            // Draw background image or color
            if (backgroundImageRef.current) {
                try {
                    ctx.drawImage(backgroundImageRef.current, 0, 0, width, height);
                } catch (err) {
                    // Fallback to color
                    ctx.fillStyle = background?.fallbackColor || 'black';
                    ctx.fillRect(0, 0, width, height);
                }
            } else {
                // If no background image, fill with the fallback color
                ctx.fillStyle = background?.fallbackColor || 'black';
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
            if (!tempCtx) return false;

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
            return true;
        } catch (error) {
            console.error('Segmentation error:', error);
            return false;
        }
    };

    const startSegmentation = targetCanvas => {
        if (!targetCanvas || !model || !background) return () => {};

        let isMounted = true;

        const segmentLoop = async () => {
            if (!isMounted || !videoRef.current || !targetCanvas || !model) {
                return;
            }

            // Check if video is ready
            if (videoRef.current.readyState < 2) {
                animationRef.current = requestAnimationFrame(segmentLoop);
                return;
            }

            await applySegmentation(targetCanvas);

            // Continue loop if still mounted
            if (isMounted) {
                animationRef.current = requestAnimationFrame(segmentLoop);
            }
        };

        segmentLoop();

        return () => {
            isMounted = false;
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    };

    return {
        model,
        modelLoaded,
        error,
        applySegmentation,
        startSegmentation,
        backgroundImageRef,
    };
};
