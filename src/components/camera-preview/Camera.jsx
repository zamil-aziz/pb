import React from 'react';
import { FaceTrackingAccessory } from './FaceTrackingAccessory';

export const Camera = ({ videoRef, canvasRef, isLoading, state, modelLoaded, faceLoaded, error, faceLandmarks }) => {
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

            <div className='relative w-full h-full'>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className='w-full h-full object-cover rounded-xl'
                    style={
                        state.selectedFilter
                            ? state.availableFilters.find(f => f.id === state.selectedFilter)?.style
                            : {}
                    }
                />

                {/* Face-tracking accessory */}
                {state.selectedAccessory && faceLandmarks && (
                    <FaceTrackingAccessory
                        accessory={state.selectedAccessory}
                        facePoints={faceLandmarks}
                        videoRef={videoRef}
                    />
                )}

                <canvas
                    ref={canvasRef}
                    className={state.selectedBackground ? 'w-full h-full object-cover absolute top-0 left-0' : 'hidden'}
                    style={
                        state.selectedFilter
                            ? state.availableFilters.find(f => f.id === state.selectedFilter)?.style
                            : {}
                    }
                />
            </div>

            {/* Status indicators */}
            {!modelLoaded && state.selectedBackground && (
                <div className='absolute top-0 left-0 right-0 bg-yellow-600 text-white p-1 sm:p-2 text-center text-xs sm:text-sm font-medium'>
                    <p>Loading segmentation model for better backgrounds...</p>
                </div>
            )}

            {!faceLoaded && state.selectedAccessory && (
                <div className='absolute top-0 left-0 right-0 bg-yellow-600 text-white p-1 sm:p-2 text-center text-xs sm:text-sm font-medium'>
                    <p>Loading face detection model for accessories...</p>
                </div>
            )}

            {error && (
                <div className='absolute top-0 left-0 right-0 bg-red-600 text-white p-1 sm:p-2 text-center text-xs sm:text-sm font-medium'>
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};
