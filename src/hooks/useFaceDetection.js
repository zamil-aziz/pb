import { useState, useEffect, useCallback } from 'react';
import * as facemesh from '@tensorflow-models/facemesh';

export function useFaceDetection(videoRef) {
    const [model, setModel] = useState(null);
    const [faceLoaded, setFaceLoaded] = useState(false);
    const [faceLandmarks, setFaceLandmarks] = useState(null);
    const [error, setError] = useState(null);

    // Load facemesh model
    useEffect(() => {
        async function loadFaceMeshModel() {
            try {
                const loadedModel = await facemesh.load({
                    maxFaces: 1, // For better performance, we'll track only one face
                    detectionConfidence: 0.9,
                });
                setModel(loadedModel);
                setFaceLoaded(true);
                console.log('Facemesh model loaded successfully');
            } catch (err) {
                console.error('Failed to load facemesh model:', err);
                setError('Failed to load face detection model');
            }
        }

        loadFaceMeshModel();

        // Cleanup
        return () => {
            setModel(null);
            setFaceLoaded(false);
        };
    }, []);

    // Function to detect facial landmarks
    const detectFaceLandmarks = useCallback(async () => {
        if (!model || !videoRef.current || videoRef.current.readyState < 2) {
            return null;
        }

        try {
            const predictions = await model.estimateFaces(videoRef.current);
            if (predictions.length > 0) {
                setFaceLandmarks(predictions[0]);
                return predictions[0];
            } else {
                setFaceLandmarks(null);
                return null;
            }
        } catch (err) {
            console.error('Face detection error:', err);
            setError('Error detecting face landmarks');
            return null;
        }
    }, [model, videoRef]);

    // Function to start face detection loop
    const startFaceDetection = useCallback(
        onFaceDetected => {
            if (!model) return () => {};

            let animationFrameId;
            let lastDetectionTime = 0;
            const detectionInterval = 100; // Detect every 100ms for performance

            const detectLoop = async timestamp => {
                if (timestamp - lastDetectionTime > detectionInterval) {
                    const landmarks = await detectFaceLandmarks();
                    if (landmarks && onFaceDetected) {
                        onFaceDetected(landmarks);
                    }
                    lastDetectionTime = timestamp;
                }

                animationFrameId = requestAnimationFrame(detectLoop);
            };

            animationFrameId = requestAnimationFrame(detectLoop);

            return () => {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                }
            };
        },
        [model, detectFaceLandmarks]
    );

    return {
        faceLoaded,
        faceLandmarks,
        error,
        startFaceDetection,
    };
}
