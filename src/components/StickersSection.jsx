'use client';
import React, { useContext, useState, useRef, useEffect } from 'react';
import { PhotoboothContext, ActionTypes } from '../contexts/PhotoboothContext';
import { ChevronLeft, ChevronRight, Sticker, X, Move } from 'lucide-react';

// Simpler implementation without dnd-kit
export default function StickersSection() {
    const { state, dispatch } = useContext(PhotoboothContext);
    const [appliedStickers, setAppliedStickers] = useState([]);
    const [selectedStickerIndex, setSelectedStickerIndex] = useState(null);
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const previewContainerRef = useRef(null);

    // Check if we're in single mode
    const isSingleMode = state.photoMode === 'single';

    // Load stickers from context on mount
    useEffect(() => {
        if (state.appliedStickers && state.appliedStickers.length > 0) {
            setAppliedStickers(state.appliedStickers);
        }
    }, [state.appliedStickers]);

    // Add a sticker to the preview
    const addSticker = sticker => {
        const previewRect = previewContainerRef.current?.getBoundingClientRect();

        // Default to center position
        let posX = previewRect ? previewRect.width / 2 - 25 : 0;
        let posY = previewRect ? previewRect.height / 2 - 25 : 0;

        const newSticker = {
            id: `${sticker.id}-${Date.now()}`,
            url: sticker.url,
            x: posX,
            y: posY,
            width: 50,
            height: 50,
            zIndex: appliedStickers.length + 1,
        };

        const updatedStickers = [...appliedStickers, newSticker];

        // Update local state
        setAppliedStickers(updatedStickers);
        setSelectedStickerIndex(updatedStickers.length - 1);

        // Update context
        dispatch({
            type: ActionTypes.SET_APPLIED_STICKERS,
            payload: updatedStickers,
        });
    };

    // Handle sticker drag start
    const handleDragStart = (e, index) => {
        e.preventDefault();

        // Get sticker position
        const sticker = appliedStickers[index];

        // Calculate drag offset (cursor position relative to sticker top-left)
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        const containerRect = previewContainerRef.current.getBoundingClientRect();
        const offsetX = clientX - (containerRect.left + sticker.x);
        const offsetY = clientY - (containerRect.top + sticker.y);

        // Set dragging state
        setDraggingIndex(index);
        setDragOffset({ x: offsetX, y: offsetY });
        setSelectedStickerIndex(index);
    };

    // Handle drag movement
    const handleDragMove = e => {
        if (draggingIndex === null) return;

        e.preventDefault();

        // Get cursor position
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        // Get container bounds
        const containerRect = previewContainerRef.current.getBoundingClientRect();

        // Calculate new position
        const newX = clientX - containerRect.left - dragOffset.x;
        const newY = clientY - containerRect.top - dragOffset.y;

        // Update sticker position
        const updatedStickers = [...appliedStickers];
        const sticker = updatedStickers[draggingIndex];

        // Add boundary checks
        const maxX = containerRect.width - sticker.width;
        const maxY = containerRect.height - sticker.height;

        updatedStickers[draggingIndex] = {
            ...sticker,
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY)),
        };

        // Update local state only during drag
        setAppliedStickers(updatedStickers);
    };

    // Handle drag end
    const handleDragEnd = () => {
        if (draggingIndex !== null) {
            // Save final position to context
            dispatch({
                type: ActionTypes.SET_APPLIED_STICKERS,
                payload: appliedStickers,
            });

            // Reset drag state
            setDraggingIndex(null);
        }
    };

    // Remove a sticker
    const removeSticker = index => {
        if (index < 0 || index >= appliedStickers.length) return;

        const updatedStickers = appliedStickers.filter((_, i) => i !== index);

        // Update local state
        setAppliedStickers(updatedStickers);
        setSelectedStickerIndex(null);

        // Update context
        dispatch({
            type: ActionTypes.SET_APPLIED_STICKERS,
            payload: updatedStickers,
        });
    };

    // Handle sticker selection
    const selectSticker = (index, e) => {
        e.stopPropagation(); // Prevent click from bubbling to container
        setSelectedStickerIndex(index === selectedStickerIndex ? null : index);
    };

    // Resize sticker
    const resizeSticker = (index, sizeDelta) => {
        const updatedStickers = [...appliedStickers];
        const sticker = updatedStickers[index];

        const newWidth = Math.max(20, Math.min(150, sticker.width + sizeDelta));
        const newHeight = Math.max(20, Math.min(150, sticker.height + sizeDelta));

        updatedStickers[index] = {
            ...sticker,
            width: newWidth,
            height: newHeight,
        };

        // Update local state
        setAppliedStickers(updatedStickers);

        // Update context
        dispatch({
            type: ActionTypes.SET_APPLIED_STICKERS,
            payload: updatedStickers,
        });
    };

    // Continue to payment
    const continueToPayment = () => {
        dispatch({ type: ActionTypes.SET_VIEW, payload: 'payment' });
    };

    // Set up event listeners for drag operations
    useEffect(() => {
        const handleMouseMove = e => handleDragMove(e);
        const handleTouchMove = e => handleDragMove(e);
        const handleMouseUp = () => handleDragEnd();
        const handleTouchEnd = () => handleDragEnd();

        if (draggingIndex !== null) {
            // Add global event listeners
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            // Clean up listeners
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [draggingIndex, dragOffset, appliedStickers]);

    return (
        <div className='w-full max-w-5xl mx-auto bg-white bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white border-opacity-40 relative overflow-hidden p-0'>
            {/* Decorative elements */}
            <div className='absolute top-0 right-0 w-40 h-40 -mt-16 -mr-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-10'></div>
            <div className='absolute bottom-0 left-0 w-48 h-48 -mb-20 -ml-20 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full opacity-10'></div>

            {/* Header section */}
            <div className='p-5'>
                <h2 className='text-3xl font-bold mt-0 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600'>
                    Add Fun Stickers
                </h2>
            </div>

            <div className='p-6 sm:p-8'>
                <div className='flex flex-col lg:flex-row gap-8 mb-6'>
                    {/* Preview section */}
                    <div className='lg:w-2/5 flex flex-col justify-start items-center'>
                        <div className='w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-lg border border-gray-100 mb-6'>
                            <h3 className='text-xl font-semibold mb-6 text-gray-700 text-center'>Preview</h3>
                            <div className='flex justify-center mb-4'>
                                <div onClick={() => setSelectedStickerIndex(null)} className='relative'>
                                    <div
                                        ref={previewContainerRef}
                                        className={`relative ${
                                            isSingleMode ? 'max-w-[340px]' : 'max-w-[260px]'
                                        } mx-auto ${
                                            state.selectedFrame ? state.selectedFrame : 'classic'
                                        } transform transition-all duration-500 hover:scale-105`}
                                    >
                                        <div className={`flex flex-col gap-2 p-3 ${isSingleMode ? 'pb-16' : ''}`}>
                                            {state.selectedPhotos &&
                                                state.selectedPhotos.map((photo, photoIndex) => (
                                                    <div
                                                        key={photoIndex}
                                                        className={`relative ${
                                                            isSingleMode ? 'h-80' : 'h-auto'
                                                        } overflow-hidden rounded-sm`}
                                                    >
                                                        <img
                                                            src={photo}
                                                            alt={`Selected photo ${photoIndex + 1}`}
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

                                        {/* Stickers overlay */}
                                        {appliedStickers.map((sticker, index) => (
                                            <div
                                                key={sticker.id}
                                                className={`absolute cursor-move ${
                                                    selectedStickerIndex === index
                                                        ? 'ring-2 ring-indigo-500 ring-offset-2'
                                                        : ''
                                                }`}
                                                style={{
                                                    width: `${sticker.width}px`,
                                                    height: `${sticker.height}px`,
                                                    left: `${sticker.x}px`,
                                                    top: `${sticker.y}px`,
                                                    zIndex: 100 + index,
                                                }}
                                                onMouseDown={e => handleDragStart(e, index)}
                                                onTouchStart={e => handleDragStart(e, index)}
                                                onClick={e => selectSticker(index, e)}
                                            >
                                                <img
                                                    src={sticker.url}
                                                    alt={`Sticker ${index + 1}`}
                                                    className='w-full h-full object-contain pointer-events-none'
                                                    draggable='false'
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Sticker editing controls */}
                            {selectedStickerIndex !== null && (
                                <div className='mt-4 flex flex-wrap gap-2 justify-center p-3 bg-gray-100 rounded-xl'>
                                    <button
                                        onClick={() => resizeSticker(selectedStickerIndex, -5)}
                                        className='p-2 bg-white rounded-full shadow-sm hover:bg-gray-50'
                                        title='Make smaller'
                                    >
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            width='20'
                                            height='20'
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        >
                                            <line x1='5' y1='12' x2='19' y2='12'></line>
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => resizeSticker(selectedStickerIndex, 5)}
                                        className='p-2 bg-white rounded-full shadow-sm hover:bg-gray-50'
                                        title='Make larger'
                                    >
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            width='20'
                                            height='20'
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        >
                                            <line x1='12' y1='5' x2='12' y2='19'></line>
                                            <line x1='5' y1='12' x2='19' y2='12'></line>
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => removeSticker(selectedStickerIndex)}
                                        className='p-2 bg-white rounded-full shadow-sm hover:bg-red-50 text-red-500'
                                        title='Remove sticker'
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stickers panel */}
                    <div className='lg:w-3/5'>
                        <div className='bg-white p-6 rounded-2xl shadow-lg border border-gray-100'>
                            <div className='flex items-center mb-4'>
                                <Sticker size={20} className='mr-2 text-indigo-600' />
                                <h3 className='text-xl font-semibold text-gray-800'>Available Stickers</h3>
                            </div>

                            <p className='text-gray-600 mb-4'>
                                Tap a sticker to add it to your photo. Then drag to position it exactly where you want.
                            </p>

                            <div className='grid grid-cols-4 gap-4'>
                                {[
                                    { id: 'heart', name: 'Heart', url: '/stickers/heart.png' },
                                    // Uncomment when more stickers are available
                                    // { id: 'star', name: 'Star', url: '/stickers/star.png' },
                                    // { id: 'balloon', name: 'Balloon', url: '/stickers/balloon.png' },
                                ].map(sticker => (
                                    <div
                                        key={sticker.id}
                                        className='p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer flex flex-col items-center'
                                        onClick={() => addSticker(sticker)}
                                    >
                                        <div className='h-16 w-16 p-2 flex items-center justify-center'>
                                            <img
                                                src={sticker.url}
                                                alt={sticker.name}
                                                className='max-h-full max-w-full object-contain'
                                                draggable='false'
                                            />
                                        </div>
                                        <span className='text-sm font-medium text-gray-700 mt-1'>{sticker.name}</span>
                                    </div>
                                ))}
                            </div>

                            <div className='mt-6 bg-blue-50 p-4 rounded-lg flex items-start'>
                                <Move size={24} className='text-blue-600 mr-3 mt-1 flex-shrink-0' />
                                <div>
                                    <h4 className='text-blue-800 font-medium'>How to use stickers</h4>
                                    <ul className='text-blue-700 text-sm mt-1 space-y-1'>
                                        <li>• Tap on any sticker above to add it to your photo</li>
                                        <li>• Drag and drop to position it where you want</li>
                                        <li>• Tap on a placed sticker to select it for editing</li>
                                        <li>• Use the + and - buttons to resize</li>
                                        <li>• Use the X button to remove a sticker</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation buttons */}
                <div className='grid grid-cols-2 gap-4 mt-6'>
                    <button
                        onClick={() => dispatch({ type: ActionTypes.SET_VIEW, payload: 'customize' })}
                        className='group bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-bold py-4 px-6 rounded-xl text-base md:text-lg shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 relative overflow-hidden'
                    >
                        <span className='relative z-10 flex items-center justify-center gap-2'>
                            <ChevronLeft
                                size={20}
                                className='group-hover:-translate-x-1 transition-transform duration-300'
                            />
                            <span>Back to Customize</span>
                        </span>
                        <span className='absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 opacity-0 group-hover:opacity-30 transition-opacity duration-300'></span>
                    </button>
                    <button
                        onClick={continueToPayment}
                        className='group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl text-base md:text-lg shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 relative overflow-hidden'
                    >
                        <span className='relative z-10 flex items-center justify-center gap-2'>
                            <span>Continue to Payment</span>
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
