import React, { useEffect } from 'react';
import { useFaceMesh } from '../../hooks/useFaceMesh';
import { FaceTrackingAccessory } from './FaceTrackingAccessory';

export const Camera = ({ videoRef, canvasRef, isLoading, state, modelLoaded, error }) => {
    // Use our facemesh hook for facial landmark detection
    const { isModelLoaded: faceModelLoaded, facePoints, error: faceError, startFaceTracking } = useFaceMesh(videoRef);

    // Start face tracking when needed for accessories
    useEffect(() => {
        if (videoRef.current && state.selectedAccessory && faceModelLoaded) {
            // Start the face tracking process
            const stopTracking = startFaceTracking();

            // Clean up when unmounting or when accessory changes
            return stopTracking;
        }
    }, [videoRef, state.selectedAccessory, faceModelLoaded, startFaceTracking]);

    // Combine errors for display
    const displayError = error || faceError;

    return (
        <div
            className='relative mx-auto overflow-hidden rounded-lg sm:rounded-xl shadow-md sm:shadow-lg mb-3 sm:mb-4 flex-1 w-full'
            style={{ minHeight: '40vh', maxHeight: '45vh' }}
        >
            {isLoading && (
                <div className='absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70 z-20'>
                    <div className='flex flex-col items-center'>
                        <div className='w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin'></div>
                        <p className='mt-2 text-indigo-800 font-semibold'>Initializing camera...</p>
                    </div>
                </div>
            )}

            {/* Container for camera and overlays */}
            <div className='relative w-full h-full'>
                {/* Video feed */}
                <video ref={videoRef} autoPlay playsInline className='w-full h-full object-cover rounded-xl' />

                {/* Face-tracking accessory */}
                {state.selectedAccessory && facePoints && (
                    <FaceTrackingAccessory
                        accessory={state.selectedAccessory}
                        facePoints={facePoints}
                        videoRef={videoRef}
                    />
                )}

                {/* Canvas for backgrounds or effects processing */}
                <canvas
                    ref={canvasRef}
                    className={state.selectedBackground ? 'w-full h-full object-cover absolute top-0 left-0' : 'hidden'}
                />
            </div>

            {/* Status indicators */}
            {!modelLoaded && state.selectedBackground && (
                <div className='absolute top-0 left-0 right-0 bg-yellow-600 text-white p-1 sm:p-2 text-center text-xs sm:text-sm font-medium'>
                    <p>Loading segmentation model for better backgrounds...</p>
                </div>
            )}

            {!faceModelLoaded && state.selectedAccessory && (
                <div className='absolute top-0 left-0 right-0 bg-yellow-600 text-white p-1 sm:p-2 text-center text-xs sm:text-sm font-medium'>
                    <p>Loading face detection model for accessories...</p>
                </div>
            )}

            {displayError && (
                <div className='absolute top-0 left-0 right-0 bg-red-600 text-white p-1 sm:p-2 text-center text-xs sm:text-sm font-medium'>
                    <p>{displayError}</p>
                </div>
            )}
        </div>
    );
};
