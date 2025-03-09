import { useState, useEffect, useCallback } from 'react';
import * as facemesh from '@tensorflow-models/facemesh';

export function useFaceMesh(videoRef) {
    const [model, setModel] = useState(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [facePoints, setFacePoints] = useState(null);
    const [error, setError] = useState(null);

    // Load the facemesh model
    useEffect(() => {
        async function loadModel() {
            try {
                console.log('Loading facemesh model...');

                // Load the model with optimal parameters for a photobooth
                const model = await facemesh.load({
                    maxFaces: 1, // Only detect one face for better performance
                    detectionConfidence: 0.9,
                    scoreThreshold: 0.75,
                });

                setModel(model);
                setIsModelLoaded(true);
                console.log('Facemesh model loaded successfully');
            } catch (err) {
                console.error('Failed to load facemesh model:', err);
                setError('Could not load face detection model');
            }
        }

        loadModel();

        // Cleanup function
        return () => {
            setModel(null);
            setIsModelLoaded(false);
        };
    }, []);

    // Function to detect faces in a frame
    const detectFaces = useCallback(async () => {
        if (!model || !videoRef.current || videoRef.current.readyState < 2) {
            return null;
        }

        try {
            // Predict facial keypoints
            const predictions = await model.estimateFaces(videoRef.current);

            if (predictions.length > 0) {
                // We have detected at least one face
                setFacePoints(predictions[0]);
                return predictions[0];
            } else {
                setFacePoints(null);
                return null;
            }
        } catch (err) {
            console.error('Error detecting face:', err);
            setError('Face detection failed');
            return null;
        }
    }, [model, videoRef]);

    // Function to start continuous face tracking
    const startFaceTracking = useCallback(() => {
        if (!model) return () => {};

        let requestId;
        let lastDetectionTime = 0;
        const detectionInterval = 100; // ms between detections for performance

        const trackFace = async timestamp => {
            // Only run detection at specified intervals
            if (timestamp - lastDetectionTime > detectionInterval) {
                await detectFaces();
                lastDetectionTime = timestamp;
            }

            requestId = requestAnimationFrame(trackFace);
        };

        requestId = requestAnimationFrame(trackFace);

        // Return cleanup function
        return () => {
            if (requestId) {
                cancelAnimationFrame(requestId);
            }
        };
    }, [model, detectFaces]);

    return {
        isModelLoaded,
        facePoints,
        error,
        startFaceTracking,
    };
}
