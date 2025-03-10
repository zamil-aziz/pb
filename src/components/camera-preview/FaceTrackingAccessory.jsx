import React, { useEffect, useState } from 'react';

export const FaceTrackingAccessory = ({ accessory, facePoints, videoRef }) => {
    const [position, setPosition] = useState({ top: '10%', left: '50%', width: '40%' });

    // Update accessory position based on face detection
    useEffect(() => {
        if (!facePoints || !videoRef.current) return;

        // Get video dimensions
        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;

        // Get container dimensions
        const containerWidth = videoRef.current.offsetWidth;
        const containerHeight = videoRef.current.offsetHeight;

        // Scale factors between video and display container
        const scaleX = containerWidth / videoWidth;
        const scaleY = containerHeight / videoHeight;

        // Get face landmarks
        const keypoints = facePoints.scaledMesh;

        if (!keypoints || keypoints.length === 0) return;

        // Calculate positions based on accessory type
        let newPosition = { ...position };

        switch (accessory.id) {
            case 'cat-ears':
                // Top of head (keypoint 10) for cat ears
                const topHead = keypoints[10];
                // Use eyes to determine width (keypoints 33 and 263)
                const leftEye = keypoints[33];
                const rightEye = keypoints[263];

                if (topHead && leftEye && rightEye) {
                    // Calculate face width for proper scaling
                    const faceWidth = Math.sqrt(
                        Math.pow(leftEye[0] - rightEye[0], 2) + Math.pow(leftEye[1] - rightEye[1], 2)
                    );

                    // Position above head
                    newPosition = {
                        top: `${topHead[1] * scaleY - faceWidth * scaleY * 1.3}px`,
                        left: `${topHead[0] * scaleX}px`,
                        width: `${faceWidth * 1.8 * scaleX}px`,
                        transform: 'translate(-50%, 0)', // Center horizontally
                    };
                }
                break;

            case 'glasses':
                // Use eye landmarks to position glasses
                const leftEyePoint = keypoints[33];
                const rightEyePoint = keypoints[263];

                if (leftEyePoint && rightEyePoint) {
                    const eyeDistance = Math.sqrt(
                        Math.pow(leftEyePoint[0] - rightEyePoint[0], 2) +
                            Math.pow(leftEyePoint[1] - rightEyePoint[1], 2)
                    );

                    const eyeMidpoint = [
                        (leftEyePoint[0] + rightEyePoint[0]) / 2,
                        (leftEyePoint[1] + rightEyePoint[1]) / 2,
                    ];

                    newPosition = {
                        top: `${eyeMidpoint[1] * scaleY - eyeDistance * scaleY * 0.4}px`,
                        left: `${eyeMidpoint[0] * scaleX}px`,
                        width: `${eyeDistance * 1.7 * scaleX}px`,
                        transform: 'translate(-50%, 0)',
                    };
                }
                break;

            case 'hat':
                // Position hat on top of head
                const forehead = keypoints[10];
                const leftSide = keypoints[234];
                const rightSide = keypoints[454];

                if (forehead && leftSide && rightSide) {
                    const faceWidth = Math.sqrt(
                        Math.pow(leftSide[0] - rightSide[0], 2) + Math.pow(leftSide[1] - rightSide[1], 2)
                    );

                    newPosition = {
                        top: `${forehead[1] * scaleY - faceWidth * scaleY * 1.7}px`,
                        left: `${forehead[0] * scaleX}px`,
                        width: `${faceWidth * 2.5 * scaleX}px`,
                        transform: 'translate(-50%, 0)',
                    };
                }
                break;

            default:
                // Default positioning
                break;
        }

        setPosition(newPosition);
    }, [facePoints, accessory, videoRef]);

    if (!accessory) return null;

    return (
        <img
            src={accessory.url}
            alt={accessory.name}
            style={{
                position: 'absolute',
                ...position,
                height: 'auto',
                zIndex: 30,
                pointerEvents: 'none',
            }}
        />
    );
};
