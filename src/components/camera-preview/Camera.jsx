export const Camera = ({ videoRef, canvasRef, isLoading, state, modelLoaded, error }) => {
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

            {/* Show video directly when no background is selected */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className={
                    !state.selectedBackground || !modelLoaded ? 'w-full h-full object-cover rounded-xl' : 'hidden'
                }
                style={
                    state.selectedFilter ? state.availableFilters.find(f => f.id === state.selectedFilter)?.style : {}
                }
            />

            {/* Canvas for segmentation when background is selected */}
            <canvas
                ref={canvasRef}
                className={state.selectedBackground && modelLoaded ? 'w-full h-full object-cover rounded-xl' : 'hidden'}
                style={
                    state.selectedFilter ? state.availableFilters.find(f => f.id === state.selectedFilter)?.style : {}
                }
            />

            {!modelLoaded && state.selectedBackground && (
                <div className='absolute top-0 left-0 right-0 bg-yellow-600 text-white p-1 sm:p-2 text-center text-xs sm:text-sm font-medium'>
                    <p>Loading segmentation model for better backgrounds...</p>
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
