'use client';
import React, { useContext, useRef, useState, useEffect, useCallback } from 'react';
import { PhotoboothContext, ActionTypes } from '../contexts/PhotoboothContext';
import NavigationButtons from './NavigationButtons';
import { Check, CreditCard, ImageIcon, Paintbrush, Layout, Sticker, ImageDown } from 'lucide-react';
import { frames } from './customize-section/frames';

// Extracted utility function for better maintainability
const getFilterName = (selectedFilter, availableFilters) => {
    if (!selectedFilter) return 'None';
    const filter = availableFilters.find(f => f.id === selectedFilter);
    return filter ? filter.name : 'Custom';
};

// New utility function to get frame name from class
const getFrameName = frameClass => {
    if (!frameClass) return 'Classic';

    // Try to find the frame that has this class string
    const frame = frames.find(f => frameClass.includes(f.class) || f.class.includes(frameClass));

    return frame ? frame.name : frameClass.replace(/-/g, ' ');
};

// Separate component for photo preview
const PhotoPreview = ({
    photos,
    photoMode,
    selectedFilter,
    availableFilters,
    appliedStickers,
    selectedFrame,
    containerReady,
}) => {
    const isSingleMode = photoMode === 'single';

    return (
        <div
            className={`relative mx-auto ${
                isSingleMode ? 'max-w-[340px]' : 'max-w-[160px]'
            } ${selectedFrame} transform transition-all duration-500 hover:scale-105`}
        >
            <div className={`flex flex-col gap-2 p-3 ${isSingleMode ? 'pb-16' : ''}`}>
                {photos?.map((photo, index) => (
                    <div
                        key={index}
                        className={`relative ${isSingleMode ? 'h-80' : 'h-auto'} overflow-hidden rounded-sm`}
                    >
                        <img
                            src={photo}
                            alt={`Selected photo ${index + 1}`}
                            className={`w-full ${
                                isSingleMode ? 'h-full object-cover' : 'h-auto'
                            } transition-transform duration-300`}
                            style={selectedFilter ? availableFilters.find(f => f.id === selectedFilter)?.style : {}}
                            loading='lazy'
                        />
                    </div>
                ))}
            </div>

            {/* Stickers overlay */}
            {containerReady &&
                appliedStickers?.map((sticker, index) => (
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
                ))}
        </div>
    );
};

// Enhanced Summary Item component with animated hover effect
const SummaryItem = ({ label, value, IconComponent }) => (
    <div className='flex justify-between py-3 border-b border-gray-100 group hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-colors duration-300 rounded-lg px-3 -mx-3'>
        <div className='flex items-center text-gray-700'>
            <div className='p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full mr-3 group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors duration-300'>
                <IconComponent size={16} className='text-indigo-600' aria-hidden='true' />
            </div>
            <span className='font-medium'>{label}</span>
        </div>
        <span className='font-medium text-gray-800 capitalize bg-gradient-to-r from-indigo-100 to-purple-100 px-3 py-1 rounded-full text-sm'>
            {value}
        </span>
    </div>
);

export default function FinalProduct() {
    const { state, dispatch } = useContext(PhotoboothContext);
    const previewContainerRef = useRef(null);
    const [containerReady, setContainerReady] = useState(false);
    const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);

    // Check if we're in single mode
    const isSingleMode = state.photoMode === 'single';

    // Effect to check if the container is ready and set dimensions
    useEffect(() => {
        const timer = setTimeout(() => {
            if (previewContainerRef.current) {
                setContainerReady(true);
                // Add a small delay to simulate load and show transition
                setTimeout(() => setIsPreviewLoaded(true), 300);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // Memoized callbacks to prevent unnecessary re-renders
    const handleConfirmation = useCallback(() => {
        dispatch({ type: ActionTypes.SET_VIEW, payload: 'payment' });
    }, [dispatch]);

    const goBackToStickers = useCallback(() => {
        dispatch({ type: ActionTypes.SET_VIEW, payload: 'stickers' });
    }, [dispatch]);

    return (
        <div className='w-full max-w-5xl mx-auto bg-white bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white border-opacity-40 relative overflow-hidden p-0 transition-all duration-300 animate-fadeIn'>
            {/* Enhanced decorative elements - more vibrant and dynamic */}
            <div className='absolute top-0 right-0 w-64 h-64 -mt-20 -mr-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-10 animate-pulse-slow'></div>
            <div className='absolute bottom-0 left-0 w-64 h-64 -mb-20 -ml-20 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-full opacity-10 animate-pulse-slow delay-1000'></div>
            <div className='absolute top-1/3 left-2/3 w-32 h-32 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full opacity-5 animate-float-medium'></div>
            <div className='absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-r from-green-300 to-teal-400 rounded-full opacity-5 animate-float-slow'></div>

            {/* Enhanced light rays with more depth */}
            <div className='absolute inset-0 pointer-events-none overflow-hidden'>
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(79,70,229,0.08),transparent_35%)]'></div>
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(219,39,119,0.08),transparent_35%)]'></div>
            </div>

            {/* Enhanced shimmer effect that pans across the card */}
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 -translate-x-full animate-shimmer'></div>

            {/* Floating particles effect */}
            <div className='absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-purple-400 opacity-30 animate-float-slow'></div>
            <div className='absolute top-3/4 right-1/3 w-3 h-3 rounded-full bg-indigo-400 opacity-20 animate-float-medium'></div>
            <div className='absolute top-2/3 left-2/3 w-2 h-2 rounded-full bg-pink-400 opacity-30 animate-float-fast'></div>

            {/* Enhanced header section with glowing title and better spacing */}
            <header className='relative z-10 pt-6 pb-4 px-5'>
                <div className='flex items-center justify-center mb-3'>
                    <div className='p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg mr-3 relative'>
                        <Check size={24} className='text-white' aria-hidden='true' />
                    </div>
                    <h1 className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 animate-gradient'>
                        Final Preview
                    </h1>
                </div>
                <p className='text-center text-gray-600 max-w-lg mx-auto mb-2'>
                    Review your creation before proceeding to payment
                </p>
            </header>

            <main className='p-6 sm:p-8 relative z-10'>
                <div className='flex flex-col lg:flex-row gap-8 mb-8'>
                    {/* Preview section - Left side (2/5 width on large screens) */}
                    <section className='lg:w-2/5 flex flex-col justify-start items-center'>
                        <div
                            ref={previewContainerRef}
                            className={`transition-opacity duration-500 ${
                                isPreviewLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            {!isPreviewLoaded ? (
                                <div className='w-full h-64 flex items-center justify-center'>
                                    <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500'></div>
                                </div>
                            ) : (
                                <PhotoPreview
                                    photos={state.selectedPhotos}
                                    photoMode={state.photoMode}
                                    selectedFilter={state.selectedFilter}
                                    availableFilters={state.availableFilters}
                                    appliedStickers={state.appliedStickers}
                                    selectedFrame={state.selectedFrame}
                                    containerReady={containerReady}
                                />
                            )}
                        </div>
                    </section>

                    {/* Enhanced order summary section with richer styling */}
                    <section className='lg:w-3/5'>
                        <div className='bg-white bg-opacity-70 backdrop-blur-sm rounded-2xl shadow-lg border border-white border-opacity-60 p-6 transition-all duration-300 hover:shadow-xl relative overflow-hidden'>
                            {/* Subtle gradient background */}
                            <div className='absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-30'></div>

                            {/* Subtle dot pattern */}
                            <div className='absolute inset-0 opacity-5 bg-[radial-gradient(#a5b4fc_1px,transparent_1px)] bg-[size:20px_20px]'></div>

                            {/* Content */}
                            <div className='relative z-10'>
                                <h2 className='text-xl font-bold text-gray-800 mb-5 flex items-center border-b border-gray-200 pb-3 bg-white bg-opacity-70 rounded-t-xl px-4 py-3 -mx-3 -mt-3 shadow-sm'>
                                    <div className='p-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mr-3 shadow-sm'>
                                        <CreditCard size={18} className='text-white' aria-hidden='true' />
                                    </div>
                                    <span className='bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600'>
                                        Your Creation Summary
                                    </span>
                                </h2>

                                <div className='space-y-2 '>
                                    <SummaryItem
                                        label='Photo Style'
                                        value={state.photoMode === 'single' ? 'Single Portrait' : 'Photo Strips'}
                                        IconComponent={ImageIcon}
                                    />

                                    <SummaryItem
                                        label='Number of Copies'
                                        value={`${state.printQuantity} ${
                                            state.printQuantity === 1 ? 'copy' : 'copies'
                                        }`}
                                        IconComponent={ImageDown}
                                    />

                                    <SummaryItem
                                        label='Frame Style'
                                        value={getFrameName(state.selectedFrame)}
                                        IconComponent={Layout}
                                    />

                                    <SummaryItem
                                        label='Filter'
                                        value={getFilterName(state.selectedFilter, state.availableFilters)}
                                        IconComponent={Paintbrush}
                                    />

                                    <SummaryItem
                                        label='Stickers'
                                        value={`${state.appliedStickers?.length || 0} added`}
                                        IconComponent={Sticker}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Navigation buttons using the reusable component */}
                <NavigationButtons
                    onBackClick={goBackToStickers}
                    onContinueClick={handleConfirmation}
                    backText='Edit Stickers'
                    continueText='Confirm & Pay'
                />
            </main>
        </div>
    );
}
