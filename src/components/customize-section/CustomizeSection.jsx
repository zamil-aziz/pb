'use client';
import { useContext, useState, useEffect, useRef } from 'react';
import { PhotoboothContext, ActionTypes } from '../../contexts/PhotoboothContext';
import { frames } from './frames';
import { FiltersPanel } from './FiltersPanel';
import { FramesPanel } from './FramesPanel';
import NavigationButtons from '../../components/NavigationButtons';
import { Layout, Image, Palette } from 'lucide-react';

export default function CustomizeSection() {
    const { state, dispatch } = useContext(PhotoboothContext);
    const [selectedFrame, setSelectedFrame] = useState('classic'); // Always initialize with 'classic' ID
    const [activeTab, setActiveTab] = useState('frames'); // 'frames' or 'filters'
    const previewContainerRef = useRef(null); // Add ref for sticker positioning
    const [containerReady, setContainerReady] = useState(false); // Track if container is ready for measuring

    // Check if we're in single mode
    const isSingleMode = state.photoMode === 'single';

    // Effect to set the correct frame ID if there's a selected frame in state
    useEffect(() => {
        if (state.selectedFrame) {
            // Try to find a frame that matches the class in state
            const frameWithMatchingClass = frames.find(
                frame => state.selectedFrame.includes(frame.class) || frame.class.includes(state.selectedFrame)
            );

            if (frameWithMatchingClass) {
                setSelectedFrame(frameWithMatchingClass.id);
            }
        }
    }, [state.selectedFrame]);

    // Effect to check if the container is ready and set dimensions
    useEffect(() => {
        // Use a small timeout to ensure the DOM has fully rendered
        const timer = setTimeout(() => {
            if (previewContainerRef.current) {
                setContainerReady(true);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const handleFrameSelect = frameId => {
        setSelectedFrame(frameId);
    };

    // Function to handle filter application
    const applyFilter = filterId => {
        dispatch({ type: ActionTypes.SET_FILTER, payload: filterId });
    };

    const continueToStickers = () => {
        // Get the frame class from the selected frame ID
        const selectedFrameObj = frames.find(f => f.id === selectedFrame);
        const frameClass = selectedFrameObj?.class || 'classic';

        // Also store the frame type and image source if it's a PNG frame
        const framePayload =
            selectedFrameObj.type === 'png'
                ? { class: frameClass, type: 'png', imgSrc: selectedFrameObj.imgSrc }
                : frameClass;

        // Store the frame information
        dispatch({ type: ActionTypes.SET_FRAME, payload: framePayload });
        dispatch({ type: ActionTypes.SET_VIEW, payload: 'stickers' });
    };

    // Get the current selected frame object
    const currentFrame = frames.find(f => f.id === selectedFrame) || frames[0];

    // Define fixed dimensions for the frame container with padding adjustments
    const frameContainerClasses = `relative ${isSingleMode ? 'w-[340px] h-[460px]' : 'w-[160px]'} mx-auto ${
        currentFrame.class
    } transform transition-all duration-500 hover:scale-105`;

    return (
        <div className='w-full max-w-5xl mx-auto bg-white bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white border-opacity-40 relative overflow-hidden p-0 transition-all duration-300 animate-fadeIn'>
            {/* Enhanced decorative elements */}
            <div className='absolute top-0 right-0 w-40 h-40 -mt-16 -mr-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-10 animate-pulse-slow'></div>
            <div className='absolute bottom-0 left-0 w-48 h-48 -mb-20 -ml-20 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-full opacity-10 animate-pulse-slow delay-1000'></div>
            <div className='absolute top-1/3 left-2/3 w-24 h-24 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full opacity-5 animate-float-medium'></div>

            {/* Light rays */}
            <div className='absolute inset-0 pointer-events-none overflow-hidden'>
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(236,72,153,0.1),transparent_30%)]'></div>
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(79,70,229,0.1),transparent_30%)]'></div>
            </div>

            {/* Shimmer effect */}
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 -translate-x-full animate-shimmer'></div>

            {/* Enhanced header section */}
            <div className='relative z-10 pt-6 pb-2 px-5'>
                <div className='flex items-center justify-center mb-2'>
                    <div className='p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg mr-3'>
                        <Palette size={24} className='text-white' />
                    </div>
                    <h2 className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 animate-gradient'>
                        Customize Your Photos
                    </h2>
                </div>
                <p className='text-center text-gray-600 max-w-lg mx-auto'>
                    Add frames and filters to make your photos pop!
                </p>
            </div>

            <div className='p-6 sm:p-8 relative z-10'>
                <div className='flex flex-col lg:flex-row gap-8 mb-6'>
                    {/* Preview section - Enhanced with card effect */}
                    <div className='lg:w-2/5 flex flex-col justify-start items-center'>
                        <div>
                            <div className='flex justify-center mb-4'>
                                <div ref={previewContainerRef} className={frameContainerClasses}>
                                    {/* Render PNG frame if the current frame is a PNG type */}
                                    {currentFrame.type === 'png' && (
                                        <img
                                            src={currentFrame.imgSrc}
                                            alt='Frame border'
                                            className='absolute inset-0 w-full h-full object-cover pointer-events-none z-10'
                                            style={{ objectFit: 'fill', objectPosition: 'center' }}
                                            draggable='false'
                                        />
                                    )}

                                    <div
                                        className={`flex flex-col gap-2 p-3 w-full h-full ${
                                            isSingleMode ? 'pb-16' : ''
                                        }`}
                                    >
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

                                    {/* Stickers overlay - Add this section to render stickers */}
                                    {containerReady &&
                                        state.appliedStickers &&
                                        state.appliedStickers.map((sticker, index) => {
                                            return (
                                                <div
                                                    key={sticker.id}
                                                    className='absolute pointer-events-none'
                                                    style={{
                                                        width: `${sticker.width}px`,
                                                        height: `${sticker.height}px`,
                                                        left: `${sticker.x}px`,
                                                        top: `${sticker.y}px`,
                                                        zIndex: 100 + (sticker.zIndex || index),
                                                        transform: `rotate(${sticker.rotation || 0}deg)`,
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                >
                                                    <img
                                                        src={sticker.url}
                                                        alt={`Sticker ${index + 1}`}
                                                        className='w-full h-full object-contain'
                                                        draggable='false'
                                                    />
                                                </div>
                                            );
                                        })}
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
                        <div className='bg-white bg-opacity-70 backdrop-blur-sm rounded-2xl shadow-lg border border-white border-opacity-60 p-6 transition-all duration-300 hover:shadow-xl'>
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

                {/* Navigation buttons - UPDATED TO USE REUSABLE COMPONENT */}
                <NavigationButtons
                    onBackClick={() => dispatch({ type: ActionTypes.SET_VIEW, payload: 'preview' })}
                    onContinueClick={continueToStickers}
                    backText='Back to Photo Selection'
                    continueText='Continue to Stickers'
                />
            </div>
        </div>
    );
}
