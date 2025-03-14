'use client';
import React, { useContext, useState, useRef, useEffect } from 'react';
import { PhotoboothContext, ActionTypes } from '../../contexts/PhotoboothContext';
import StickerPhotoPreview from './StickerPhotoPreview';
import StickerEditor from './StickerEditor';
import StickerGallery from './StickerGallery';
import NavigationButtons from '../../components/NavigationButtons';
import { Sticker } from 'lucide-react';

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
            rotation: 0,
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

    // Begin sticker drag
    const handleMouseDown = (e, index) => {
        // Prevent default behavior for mouse events
        e.preventDefault();
        startDrag(e, index, false);
    };

    // For touch events, we'll use a separate handler
    const handleTouchStart = (e, index) => {
        // Note: we are NOT calling preventDefault() here
        // as it would cause the "Unable to preventDefault inside passive event listener" error
        startDrag(e, index, true);
    };

    // Shared logic for starting a drag operation
    const startDrag = (e, index, isTouch) => {
        // Get sticker position
        const sticker = appliedStickers[index];

        // Calculate drag offset (cursor position relative to sticker top-left)
        const clientX = isTouch ? e.touches[0].clientX : e.clientX;
        const clientY = isTouch ? e.touches[0].clientY : e.clientY;

        const containerRect = previewContainerRef.current.getBoundingClientRect();
        const offsetX = clientX - (containerRect.left + sticker.x);
        const offsetY = clientY - (containerRect.top + sticker.y);

        // Set dragging state
        setDraggingIndex(index);
        setDragOffset({ x: offsetX, y: offsetY });
        setSelectedStickerIndex(index);
    };

    // Handle drag move
    const handleMouseMove = e => {
        if (draggingIndex === null) return;
        e.preventDefault();
        moveDrag(e, false);
    };

    // Handle touch move
    const handleTouchMove = e => {
        if (draggingIndex === null) return;
        // Don't call preventDefault() for touch events in passive listeners
        moveDrag(e, true);
    };

    // Shared logic for dragging
    const moveDrag = (e, isTouch) => {
        // Get cursor position
        const clientX = isTouch ? e.touches[0].clientX : e.clientX;
        const clientY = isTouch ? e.touches[0].clientY : e.clientY;

        // Get container bounds
        const containerRect = previewContainerRef.current.getBoundingClientRect();

        // Calculate new position
        const newX = clientX - containerRect.left - dragOffset.x;
        const newY = clientY - containerRect.top - dragOffset.y;

        // Update sticker position
        const updatedStickers = [...appliedStickers];
        const sticker = updatedStickers[draggingIndex];

        // Set boundaries (50% outside on any edge)
        const minX = -(sticker.width / 2);
        const minY = -(sticker.height / 2);
        const maxX = containerRect.width - sticker.width / 2;
        const maxY = containerRect.height - sticker.height / 2;

        updatedStickers[draggingIndex] = {
            ...sticker,
            x: Math.max(minX, Math.min(newX, maxX)),
            y: Math.max(minY, Math.min(newY, maxY)),
        };

        // Update local state
        setAppliedStickers(updatedStickers);
    };

    // Handle end of drag
    const handleDragEnd = () => {
        if (draggingIndex !== null) {
            // Save final position to context
            dispatch({
                type: ActionTypes.SET_APPLIED_STICKERS,
                payload: appliedStickers,
            });

            // Explicitly set the selected index to the dragging index before clearing dragging state
            // This ensures the selection persists after drag ends
            const currentDraggingIndex = draggingIndex;
            setSelectedStickerIndex(currentDraggingIndex);

            // Then reset drag state
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
        // Stop propagation to prevent bubbling up to container which would deselect
        if (e) {
            e.stopPropagation();
        }

        // Toggle selection if clicking the same sticker, otherwise select the new one
        if (index === selectedStickerIndex) {
            setSelectedStickerIndex(null);
        } else {
            setSelectedStickerIndex(index);
        }
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

    // Rotate sticker
    const rotateSticker = (index, angleDelta) => {
        const updatedStickers = [...appliedStickers];
        const sticker = updatedStickers[index];

        // Calculate new rotation angle and normalize to 0-360
        const newRotation = (sticker.rotation + angleDelta) % 360;

        updatedStickers[index] = {
            ...sticker,
            rotation: newRotation,
        };

        // Update local state
        setAppliedStickers(updatedStickers);

        // Update context
        dispatch({
            type: ActionTypes.SET_APPLIED_STICKERS,
            payload: updatedStickers,
        });
    };

    // Set up global event listeners for drag operations
    useEffect(() => {
        const handleDocumentMouseMove = e => handleMouseMove(e);
        const handleDocumentTouchMove = e => handleTouchMove(e);
        const handleDocumentMouseUp = () => handleDragEnd();
        const handleDocumentTouchEnd = () => handleDragEnd();

        if (draggingIndex !== null) {
            // Add mouse event listeners
            document.addEventListener('mousemove', handleDocumentMouseMove);
            document.addEventListener('mouseup', handleDocumentMouseUp);

            // For touch events, we need a different approach
            // We'll add these listeners to specific elements in StickerPhotoPreview
            document.addEventListener('touchmove', handleDocumentTouchMove, { passive: true });
            document.addEventListener('touchend', handleDocumentTouchEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleDocumentMouseMove);
            document.removeEventListener('mouseup', handleDocumentMouseUp);
            document.removeEventListener('touchmove', handleDocumentTouchMove);
            document.removeEventListener('touchend', handleDocumentTouchEnd);
        };
    }, [draggingIndex, appliedStickers, dragOffset]);

    // Continue to final product function
    const continueToFinalProduct = () => {
        dispatch({ type: ActionTypes.SET_VIEW, payload: 'finalProduct' });
    };

    // Go back to customize function
    const goBackToCustomize = () => {
        dispatch({ type: ActionTypes.SET_VIEW, payload: 'customize' });
    };

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
                        <Sticker size={24} className='text-white' />
                    </div>
                    <h2 className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 animate-gradient'>
                        Add Fun Stickers
                    </h2>
                </div>
                <p className='text-center text-gray-600 max-w-lg mx-auto'>
                    Perfect your photos with customizable stickers!
                </p>
            </div>

            <div className='p-6 sm:p-8 relative z-10'>
                <div className='flex flex-col lg:flex-row gap-8 mb-6'>
                    {/* Preview section with enhanced card styling */}
                    <div className='lg:w-2/5 flex flex-col justify-start items-center'>
                        <div>
                            <StickerPhotoPreview
                                previewContainerRef={previewContainerRef}
                                state={state}
                                appliedStickers={appliedStickers}
                                selectedStickerIndex={selectedStickerIndex}
                                draggingIndex={draggingIndex}
                                handleMouseDown={handleMouseDown}
                                handleTouchStart={handleTouchStart}
                                selectSticker={selectSticker}
                                setSelectedStickerIndex={setSelectedStickerIndex}
                            />

                            {/* Improved sticker editing controls with transition */}
                            <div
                                className={`mt-4 overflow-hidden transition-all duration-300 ${
                                    selectedStickerIndex !== null || draggingIndex !== null
                                        ? 'max-h-40 opacity-100'
                                        : 'max-h-0 opacity-0'
                                }`}
                            >
                                {(selectedStickerIndex !== null || draggingIndex !== null) && (
                                    <StickerEditor
                                        selectedStickerIndex={
                                            draggingIndex !== null ? draggingIndex : selectedStickerIndex
                                        }
                                        resizeSticker={resizeSticker}
                                        rotateSticker={rotateSticker}
                                        removeSticker={removeSticker}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stickers panel with enhanced styling */}
                    <div className='lg:w-3/5'>
                        <StickerGallery addSticker={addSticker} />
                    </div>
                </div>

                {/* Enhanced navigation buttons - UPDATED DESTINATION */}
                <NavigationButtons
                    onBackClick={goBackToCustomize}
                    onContinueClick={continueToFinalProduct}
                    backText='Back to Customize'
                    continueText='Finalize Your Creation'
                />
            </div>
        </div>
    );
}
