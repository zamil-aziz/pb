import * as bodyPix from '@tensorflow-models/body-pix';
import * as facemesh from '@tensorflow-models/facemesh';

// Load models (only once)
let bodyPixModel = null;
let facemeshModel = null;

async function loadBodyPixModel() {
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

async function loadFacemeshModel() {
    if (!facemeshModel) {
        facemeshModel = await facemesh.load({
            maxFaces: 1,
            detectionConfidence: 0.9,
        });
    }
    return facemeshModel;
}

// Helper function to draw accessories based on face landmarks
function drawAccessoryOnCanvas(ctx, accessory, landmarks, width, height) {
    if (!landmarks || !accessory) return;

    // Create image element for accessory
    const accessoryImg = new Image();
    accessoryImg.src = accessory.url;

    // Make sure image is loaded
    if (!accessoryImg.complete) {
        return new Promise(resolve => {
            accessoryImg.onload = () => {
                drawAccessoryByType(ctx, accessory, accessoryImg, landmarks);
                resolve();
            };
        });
    } else {
        drawAccessoryByType(ctx, accessory, accessoryImg, landmarks);
        return Promise.resolve();
    }
}

function drawAccessoryByType(ctx, accessory, accessoryImg, landmarks) {
    const keypoints = landmarks.scaledMesh;

    // Only proceed if we have landmarks
    if (!keypoints || keypoints.length === 0) return;

    // Position accessories based on their type
    switch (accessory.id) {
        case 'cat-ears':
            // Use top of head landmarks
            const topHead = keypoints[10]; // Top of head
            const leftEye = keypoints[33]; // Left eye region
            const rightEye = keypoints[263]; // Right eye region

            if (topHead && leftEye && rightEye) {
                // Calculate face width as reference for accessory size
                const faceWidth =
                    Math.sqrt(Math.pow(leftEye[0] - rightEye[0], 2) + Math.pow(leftEye[1] - rightEye[1], 2)) * 2.5;

                // Draw ears above head
                ctx.drawImage(
                    accessoryImg,
                    topHead[0] - faceWidth / 2, // center horizontally
                    topHead[1] - faceWidth / 1.2, // position above head
                    faceWidth, // width based on face width
                    faceWidth // keep aspect ratio
                );
            }
            break;

        case 'glasses':
            // Use eye landmarks to position glasses
            const leftEyePoint = keypoints[33]; // Left eye region
            const rightEyePoint = keypoints[263]; // Right eye region

            if (leftEyePoint && rightEyePoint) {
                const eyeDistance = Math.sqrt(
                    Math.pow(leftEyePoint[0] - rightEyePoint[0], 2) + Math.pow(leftEyePoint[1] - rightEyePoint[1], 2)
                );

                const glassesWidth = eyeDistance * 1.8;
                const glassesHeight = glassesWidth * 0.4;
                const eyeMidpoint = [
                    (leftEyePoint[0] + rightEyePoint[0]) / 2,
                    (leftEyePoint[1] + rightEyePoint[1]) / 2,
                ];

                ctx.drawImage(
                    accessoryImg,
                    eyeMidpoint[0] - glassesWidth / 2,
                    eyeMidpoint[1] - glassesHeight / 3,
                    glassesWidth,
                    glassesHeight
                );
            }
            break;

        case 'hat':
            // Position hat on top of head
            const forehead = keypoints[10]; // Forehead reference point

            if (forehead) {
                const leftSide = keypoints[234]; // Left side of face
                const rightSide = keypoints[454]; // Right side of face

                const faceWidth =
                    Math.sqrt(Math.pow(leftSide[0] - rightSide[0], 2) + Math.pow(leftSide[1] - rightSide[1], 2)) * 1.2;

                ctx.drawImage(accessoryImg, forehead[0] - faceWidth / 2, forehead[1] - faceWidth, faceWidth, faceWidth);
            }
            break;

        case 'mustache':
            // Position mustache between nose and mouth
            const nose = keypoints[2]; // Nose tip
            const mouth = keypoints[13]; // Upper lip

            if (nose && mouth) {
                const leftMouth = keypoints[61]; // Left corner of mouth
                const rightMouth = keypoints[291]; // Right corner of mouth

                const mouthWidth =
                    Math.sqrt(Math.pow(leftMouth[0] - rightMouth[0], 2) + Math.pow(leftMouth[1] - rightMouth[1], 2)) *
                    1.5;

                const midpoint = [
                    (nose[0] + mouth[0]) / 2,
                    (nose[1] + mouth[1]) / 2 + 10, // Slightly below midpoint
                ];

                ctx.drawImage(
                    accessoryImg,
                    midpoint[0] - mouthWidth / 2,
                    midpoint[1] - mouthWidth / 4,
                    mouthWidth,
                    mouthWidth / 2
                );
            }
            break;
    }
}

// Capture photo with proper background segmentation and face accessories
export async function capturePhoto(videoElement, canvasElement, background, accessory) {
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

    try {
        // Handle background segmentation if needed
        if (background) {
            // Load BodyPix model if needed
            const bodyPixModel = await loadBodyPixModel();

            // Get segmentation data
            const segmentation = await bodyPixModel.segmentPerson(videoElement, {
                flipHorizontal: false,
                internalResolution: 'medium',
                segmentationThreshold: 0.7,
            });

            // Draw background image first
            const bgImg = new Image();
            bgImg.src = background.url;

            // Make sure image is loaded
            if (!bgImg.complete) {
                await new Promise(resolve => {
                    bgImg.onload = resolve;
                });
            }

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
        } else {
            // No background - just draw video frame
            ctx.drawImage(videoElement, 0, 0, width, height);
        }

        // Handle face accessories if needed
        if (accessory) {
            // Load Facemesh model if needed
            const faceMeshModel = await loadFacemeshModel();

            // Detect face landmarks
            const faces = await faceMeshModel.estimateFaces(videoElement);

            if (faces.length > 0) {
                // Draw accessory using the face landmarks
                await drawAccessoryOnCanvas(ctx, accessory, faces[0], width, height);
            }
        }
    } catch (error) {
        console.error('Photo capture failed:', error);
        // Fallback to basic capture if advanced features fail
        ctx.drawImage(videoElement, 0, 0, width, height);
    }

    // Return the final image data URL
    return canvasElement.toDataURL('image/jpeg', 0.9);
}

// Function to preload the models - call this during app initialization
export async function preloadModels() {
    try {
        await Promise.all([loadBodyPixModel(), loadFacemeshModel()]);
        console.log('BodyPix and Facemesh models loaded successfully');
        return true;
    } catch (error) {
        console.error('Failed to load models:', error);
        return false;
    }
}
