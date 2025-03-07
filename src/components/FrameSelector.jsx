'use client';
import { useContext, useState } from 'react';
import { PhotoboothContext, ActionTypes } from '../contexts/PhotoboothContext';
import { frames } from './frame-selector/frames';
import { FiltersPanel } from './frame-selector/FiltersPanel';

export default function FrameSelector() {
    const { state, dispatch } = useContext(PhotoboothContext);
    const [selectedFrame, setSelectedFrame] = useState(state.selectedFrame || 'classic');

    // Check if we're in single mode
    const isSingleMode = state.photoMode === 'single';

    const handleFrameSelect = frameId => {
        setSelectedFrame(frameId);
    };

    // Function to handle filter application
    const applyFilter = filterId => {
        dispatch({ type: ActionTypes.SET_FILTER, payload: filterId });
    };

    const continueToPayment = () => {
        dispatch({ type: ActionTypes.SET_FRAME, payload: selectedFrame });
        dispatch({ type: ActionTypes.SET_VIEW, payload: 'payment' });
    };

    return (
        <div className='p-8 max-w-4xl mx-auto bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white border-opacity-40 relative overflow-hidden'>
            {/* Decorative elements */}
            <div className='absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-10'></div>
            <div className='absolute bottom-0 left-0 w-40 h-40 -mb-16 -ml-16 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full opacity-10'></div>

            <h2 className='text-4xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600'>
                Customize Your Photos
            </h2>

            <div className='flex flex-col md:flex-row gap-8 mb-6'>
                {/* Preview of photos in selected frame */}
                <div className='md:w-3/7 flex flex-col justify-center items-center'>
                    <div
                        className={`relative w-full ${isSingleMode ? 'max-w-[320px]' : 'max-w-[220px]'} mx-auto ${
                            frames.find(f => f.id === selectedFrame)?.class
                        }`}
                    >
                        <div className='flex flex-col gap-1 p-2 pb-10'>
                            {state.selectedPhotos &&
                                state.selectedPhotos.map((photo, index) => (
                                    <div key={index} className={`relative ${isSingleMode ? 'h-48' : ''}`}>
                                        <img
                                            src={photo}
                                            alt={`Selected photo ${index + 1}`}
                                            className={`w-full ${isSingleMode ? 'h-full object-cover' : 'h-auto'}`}
                                            style={
                                                state.selectedFilter
                                                    ? state.availableFilters.find(f => f.id === state.selectedFilter)
                                                          ?.style
                                                    : {}
                                            }
                                        />
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                {/* Options Panel with vertical arrangement */}
                <div className='md:w-2/3'>
                    {/* Frame Styles Section */}
                    <div className='mb-6'>
                        <h3 className='text-xl font-semibold mb-4 text-gray-700'>Frame Styles</h3>
                        <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-2'>
                            {frames.map(frame => (
                                <div
                                    key={frame.id}
                                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                                        selectedFrame === frame.id
                                            ? 'bg-indigo-100 ring-2 ring-indigo-500 shadow-lg'
                                            : 'bg-gray-100 hover:bg-gray-200 hover:shadow-md'
                                    }`}
                                    onClick={() => handleFrameSelect(frame.id)}
                                >
                                    {/* Fixed height preview for mini frame examples */}
                                    <div className='h-20 mb-2 overflow-hidden rounded-lg'>
                                        <div className={`h-full w-full ${frame.class}`}>
                                            <div className='h-full flex flex-col p-1 relative'>
                                                {/* Mini representation of photos based on mode */}
                                                {isSingleMode ? (
                                                    <div className='h-full w-full bg-gray-300 mx-auto rounded-sm'></div>
                                                ) : (
                                                    <>
                                                        <div className='h-5 w-11/12 bg-gray-300 mt-1 mx-auto rounded-sm'></div>
                                                        <div className='h-5 w-11/12 bg-gray-300 mt-1 mx-auto rounded-sm'></div>
                                                        <div className='h-5 w-11/12 bg-gray-300 mt-1 mx-auto rounded-sm'></div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <div
                                                className={`w-4 h-4 rounded-full ${frame.previewClass} border border-gray-300 flex-shrink-0`}
                                            ></div>
                                            <p className='font-semibold text-sm text-gray-800 truncate'>{frame.name}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Separator line */}
                    <div className='border-t border-gray-200 my-4'></div>

                    {/* Filters Section */}
                    <div>
                        <FiltersPanel
                            filters={state.availableFilters}
                            selectedFilter={state.selectedFilter}
                            applyFilter={applyFilter}
                        />
                    </div>
                </div>
            </div>

            {/* Updated buttons to match PhotoPreview style */}
            <div className='grid grid-cols-2 gap-2 sm:gap-4 mt-4'>
                <button
                    onClick={() => dispatch({ type: ActionTypes.SET_VIEW, payload: 'preview' })}
                    className='bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-2 sm:py-3 md:py-4 px-4 sm:px-5 md:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-xl shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50'
                    aria-label='Back to Photos'
                >
                    Back to Photos
                </button>
                <button
                    onClick={continueToPayment}
                    className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2 sm:py-3 md:py-4 px-4 sm:px-5 md:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50'
                    aria-label='Continue with selected frame'
                >
                    Continue with Selected Frame
                </button>
            </div>
        </div>
    );
}
