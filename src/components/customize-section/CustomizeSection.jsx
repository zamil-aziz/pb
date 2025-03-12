'use client';
import { useContext, useState } from 'react';
import { PhotoboothContext, ActionTypes } from '../../contexts/PhotoboothContext';
import { frames } from './frames';
import { FiltersPanel } from './FiltersPanel';
import { FramesPanel } from './FramesPanel';
import { Layout, Image, Save, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CustomizeSection() {
    const { state, dispatch } = useContext(PhotoboothContext);
    const [selectedFrame, setSelectedFrame] = useState(state.selectedFrame || 'classic');
    const [activeTab, setActiveTab] = useState('frames'); // 'frames' or 'filters'

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
        dispatch({ type: ActionTypes.SET_VIEW, payload: 'stickers' });
    };

    return (
        <div className='w-full max-w-5xl mx-auto bg-white bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white border-opacity-40 relative overflow-hidden p-0'>
            {/* Decorative elements */}
            <div className='absolute top-0 right-0 w-40 h-40 -mt-16 -mr-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-10'></div>
            <div className='absolute bottom-0 left-0 w-48 h-48 -mb-20 -ml-20 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full opacity-10'></div>

            {/* Header section with glowing effect */}
            <div className='p-5'>
                <h2 className='text-3xl font-bold mt-0 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600'>
                    Customize Your Photos
                </h2>
            </div>

            <div className='p-6 sm:p-8'>
                <div className='flex flex-col lg:flex-row gap-8 mb-6'>
                    {/* Preview section - Enhanced with card effect */}
                    <div className='lg:w-2/5 flex flex-col justify-start items-center'>
                        <div className='w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-lg border border-gray-100 mb-6'>
                            <h3 className='text-xl font-semibold mb-6 text-gray-700 text-center'>Preview</h3>
                            <div className='flex justify-center mb-4'>
                                <div
                                    className={`relative ${isSingleMode ? 'max-w-[340px]' : 'max-w-[260px]'} mx-auto ${
                                        frames.find(f => f.id === selectedFrame)?.class
                                    } transform transition-all duration-500 hover:scale-105`}
                                >
                                    <div className={`flex flex-col gap-2 p-3 ${isSingleMode ? 'pb-16' : ''}`}>
                                        {state.selectedPhotos &&
                                            state.selectedPhotos.map((photo, index) => (
                                                <div
                                                    key={index}
                                                    className={`relative ${
                                                        isSingleMode ? 'h-80' : 'h-auto'
                                                    } overflow-hidden rounded-sm`}
                                                >
                                                    <img
                                                        src={photo}
                                                        alt={`Selected photo ${index + 1}`}
                                                        className={`w-full ${
                                                            isSingleMode ? 'h-full object-cover' : 'h-auto'
                                                        } transition-transform duration-300`}
                                                        style={
                                                            state.selectedFilter
                                                                ? state.availableFilters.find(
                                                                      f => f.id === state.selectedFilter
                                                                  )?.style
                                                                : {}
                                                        }
                                                    />
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Options Panel with tabs */}
                    <div className='lg:w-3/5'>
                        {/* Tab navigation */}
                        <div className='flex mb-6 bg-gray-100 p-1 rounded-xl'>
                            <button
                                onClick={() => setActiveTab('frames')}
                                className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all duration-300 ${
                                    activeTab === 'frames'
                                        ? 'bg-white text-indigo-600 shadow-md'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <span className='flex items-center justify-center gap-2'>
                                    <Layout size={18} />
                                    <span>Frames</span>
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('filters')}
                                className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all duration-300 ${
                                    activeTab === 'filters'
                                        ? 'bg-white text-indigo-600 shadow-md'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <span className='flex items-center justify-center gap-2'>
                                    <Image size={18} />
                                    <span>Filters</span>
                                </span>
                            </button>
                        </div>

                        {/* Content based on active tab */}
                        <div className='bg-white p-6 rounded-2xl shadow-lg border border-gray-100'>
                            {activeTab === 'frames' ? (
                                <FramesPanel
                                    frames={frames}
                                    selectedFrame={selectedFrame}
                                    onFrameSelect={handleFrameSelect}
                                    isSingleMode={isSingleMode}
                                />
                            ) : (
                                <FiltersPanel
                                    filters={state.availableFilters}
                                    selectedFilter={state.selectedFilter}
                                    applyFilter={applyFilter}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation buttons */}
                <div className='grid grid-cols-2 gap-4 mt-6'>
                    <button
                        onClick={() => dispatch({ type: ActionTypes.SET_VIEW, payload: 'preview' })}
                        className='group bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-bold py-4 px-6 rounded-xl text-base md:text-lg shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 relative overflow-hidden'
                    >
                        <span className='relative z-10 flex items-center justify-center gap-2'>
                            <ChevronLeft
                                size={20}
                                className='group-hover:-translate-x-1 transition-transform duration-300'
                            />
                            <span>Back to Photos</span>
                        </span>
                        <span className='absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 opacity-0 group-hover:opacity-30 transition-opacity duration-300'></span>
                    </button>
                    <button
                        onClick={continueToPayment}
                        className='group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl text-base md:text-lg shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 relative overflow-hidden'
                    >
                        <span className='relative z-10 flex items-center justify-center gap-2'>
                            <span>Continue to Stickers</span>
                            <ChevronRight
                                size={20}
                                className='group-hover:translate-x-1 transition-transform duration-300'
                            />
                        </span>
                        <span className='absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300'></span>
                    </button>
                </div>
            </div>
        </div>
    );
}
