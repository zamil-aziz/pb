'use client';
import React, { useContext, useState, useRef, useEffect } from 'react';
import { PhotoboothContext, ActionTypes } from '../../contexts/PhotoboothContext';
import StickerPhotoPreview from './StickerPhotoPreview';
import StickerEditor from './StickerEditor';
import StickerGallery from './StickerGallery';
import StickerNavigationButtons from './StickerNavigationButtons';

export default function StickerSection() {
    const { state, dispatch } = useContext(PhotoboothContext);
    const [appliedStickers, setAppliedStickers] = useState([]);
    const [selectedStickerIndex, setSelectedStickerIndex] = useState(null);
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const previewContainerRef = useRef(null);

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

    // Handle sticker drag start - UPDATED
    const handleDragStart = (e, index) => {
        if (e.cancelable) {
            e.preventDefault();
        }

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

        // Set even boundaries on all sides (50% outside on any edge)
        // For left and top edges
        const minX = -(sticker.width / 2);
        const minY = -(sticker.height / 2);

        // For right and bottom edges
        const maxX = containerRect.width - sticker.width / 2;
        const maxY = containerRect.height - sticker.height / 2;

        updatedStickers[draggingIndex] = {
            ...sticker,
            x: Math.max(minX, Math.min(newX, maxX)),
            y: Math.max(minY, Math.min(newY, maxY)),
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

    // Continue to payment function
    const continueToPayment = () => {
        dispatch({ type: ActionTypes.SET_VIEW, payload: 'payment' });
    };

    // Go back to customize function
    const goBackToCustomize = () => {
        dispatch({ type: ActionTypes.SET_VIEW, payload: 'customize' });
    };

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
                    <div className='lg:w-2/5 flex flex-col justify-start items-center pb-2'>
                        <div className='flex flex-col items-center mb-4'>
                            <StickerPhotoPreview
                                previewContainerRef={previewContainerRef}
                                state={state}
                                appliedStickers={appliedStickers}
                                selectedStickerIndex={selectedStickerIndex}
                                handleDragStart={handleDragStart}
                                selectSticker={selectSticker}
                                setSelectedStickerIndex={setSelectedStickerIndex}
                            />

                            {/* Sticker editing controls */}
                            {selectedStickerIndex !== null && (
                                <StickerEditor
                                    selectedStickerIndex={selectedStickerIndex}
                                    resizeSticker={resizeSticker}
                                    removeSticker={removeSticker}
                                />
                            )}
                        </div>
                    </div>

                    {/* Stickers panel */}
                    <div className='lg:w-3/5'>
                        <StickerGallery addSticker={addSticker} />
                    </div>
                </div>

                {/* Navigation buttons */}
                <StickerNavigationButtons goBackToCustomize={goBackToCustomize} continueToPayment={continueToPayment} />
            </div>
        </div>
    );
}
