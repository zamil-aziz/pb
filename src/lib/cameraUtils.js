import * as tf from '@tensorflow/tfjs';
import * as bodyPix from '@tensorflow-models/body-pix';

// Load BodyPix model (only once)
let bodyPixModel = null;
async function loadModel() {
    if (!bodyPixModel) {
        bodyPixModel = await bodyPix.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            multiplier: 0.75,
            quantBytes: 2,
        });
    }
    return bodyPixModel;
}

// Capture photo with proper background segmentation
export async function capturePhoto(videoElement, canvasElement, background) {
    if (!videoElement || !canvasElement) return null;

    // Get video dimensions
    const width = videoElement.videoWidth;
    const height = videoElement.videoHeight;

    // Set canvas to match video dimensions
    canvasElement.width = width;
    canvasElement.height = height;

    const ctx = canvasElement.getContext('2d');

    // Clear canvas first
    ctx.clearRect(0, 0, width, height);

    // If using a background, apply segmentation
    if (background) {
        try {
            // Load model if needed
            const model = await loadModel();

            // Get segmentation data
            const segmentation = await model.segmentPerson(videoElement, {
                flipHorizontal: false,
                internalResolution: 'medium',
                segmentationThreshold: 0.7,
            });

            // Draw background image first
            const bgImg = new Image();
            bgImg.src = background.url;
            ctx.drawImage(bgImg, 0, 0, width, height);

            // Get frame from video
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(videoElement, 0, 0, width, height);
            const imageData = tempCtx.getImageData(0, 0, width, height);

            // Apply mask to keep only the person
            const mask = segmentation.data;
            const imgData = ctx.getImageData(0, 0, width, height);
            const pixels = imgData.data;
            const sourcePixels = imageData.data;

            for (let i = 0; i < mask.length; i++) {
                const n = i * 4;
                if (mask[i]) {
                    // If this pixel is part of a person, use the video frame pixel
                    pixels[n] = sourcePixels[n]; // R
                    pixels[n + 1] = sourcePixels[n + 1]; // G
                    pixels[n + 2] = sourcePixels[n + 2]; // B
                    pixels[n + 3] = 255; // Alpha
                }
            }

            // Put the modified pixel data back on the canvas
            ctx.putImageData(imgData, 0, 0);
        } catch (error) {
            console.error('Segmentation failed:', error);
            // Fallback to basic blending if segmentation fails
            ctx.drawImage(videoElement, 0, 0, width, height);
        }
    } else {
        // No background - just draw video frame
        ctx.drawImage(videoElement, 0, 0, width, height);
    }

    // Get the image data URL
    return canvasElement.toDataURL('image/jpeg', 0.9);
}

// Function to preload the model - call this during app initialization
export async function preloadSegmentationModel() {
    try {
        await loadModel();
        console.log('BodyPix model loaded successfully');
        return true;
    } catch (error) {
        console.error('Failed to load BodyPix model:', error);
        return false;
    }
}
