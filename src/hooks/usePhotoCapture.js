'use client';
import { useRef } from 'react';
import { applyFilterToImageData } from '../lib/filterUtils';

export const usePhotoCapture = (videoRef, selectedFilter, availableFilters) => {
    const canvasRef = useRef(null);

    // Function to capture a photo with segmentation if model is provided
    const capturePhoto = async (segmentationModel = null, background = null) => {
        if (!videoRef.current) {
            console.error('Video element not available for capture');
            return null;
        }

        // Create a canvas if not already provided
        if (!canvasRef.current) {
            canvasRef.current = document.createElement('canvas');
        }

        try {
            // Get video dimensions
            const width = videoRef.current.videoWidth;
            const height = videoRef.current.videoHeight;

            // Prepare canvas for photo capture
            canvasRef.current.width = width;
            canvasRef.current.height = height;
            const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });

            if (!ctx) return null;

            // If we have model and background, use segmentation
            if (segmentationModel && background) {
                // Get segmentation
                const segmentation = await segmentationModel.segmentPerson(videoRef.current, {
                    flipHorizontal: false,
                    internalResolution: 'medium',
                    segmentationThreshold: 0.7,
                });

                // Draw background
                if (background.url) {
                    const bgImage = new Image();
                    bgImage.src = background.url;

                    // Need to ensure image is loaded
                    await new Promise((resolve, reject) => {
                        bgImage.onload = resolve;
                        bgImage.onerror = () => {
                            console.warn(`Failed to load background image: ${background.url}`);
                            resolve(); // Resolve anyway to continue with fallback
                        };

                        // Handle already loaded images
                        if (bgImage.complete) resolve();
                    });

                    try {
                        ctx.drawImage(bgImage, 0, 0, width, height);
                    } catch (err) {
                        ctx.fillStyle = background.fallbackColor || 'black';
                        ctx.fillRect(0, 0, width, height);
                    }
                } else {
                    ctx.fillStyle = background.fallbackColor || 'black';
                    ctx.fillRect(0, 0, width, height);
                }

                // Apply person segmentation
                const imageData = ctx.getImageData(0, 0, width, height);
                const pixels = imageData.data;

                // Get video frame
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = width;
                tempCanvas.height = height;
                const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });

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
                // Simple case - just draw the video frame
                ctx.drawImage(videoRef.current, 0, 0);
            }

            // Apply filter if selected
            if (selectedFilter && selectedFilter !== 'normal') {
                applyFilterToImageData(ctx, width, height, selectedFilter, availableFilters);
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

    return {
        canvasRef,
        capturePhoto,
    };
};
