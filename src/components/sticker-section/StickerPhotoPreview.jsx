import React from 'react';

export default function StickerPhotoPreview({
    previewContainerRef,
    state,
    appliedStickers,
    selectedStickerIndex,
    draggingIndex,
    handleMouseDown,
    handleTouchStart,
    selectSticker,
    setSelectedStickerIndex,
}) {
    // Check if we're in single mode
    const isSingleMode = state.photoMode === 'single';

    return (
        <div
            ref={previewContainerRef}
            onClick={e => {
                // Only clear selection if clicking directly on the container (not on stickers)
                if (e.target === e.currentTarget) {
                    setSelectedStickerIndex(null);
                }
            }}
            className={`relative ${isSingleMode ? 'max-w-[340px]' : 'max-w-[160px]'} mx-auto ${
                state.selectedFrame ? state.selectedFrame : 'classic'
            } transform transition-all duration-500 hover:scale-105 overflow-hidden`}
        >
            <div className={`flex flex-col gap-2 p-3 ${isSingleMode ? 'pb-16' : ''}`}>
                {state.selectedPhotos &&
                    state.selectedPhotos.map((photo, photoIndex) => (
                        <div
                            key={photoIndex}
                            className={`relative ${isSingleMode ? 'h-80' : 'h-auto'} overflow-hidden rounded-sm`}
                        >
                            <img
                                src={photo}
                                alt={`Selected photo ${photoIndex + 1}`}
                                className={`w-full ${
                                    isSingleMode ? 'h-full object-cover' : 'h-auto'
                                } transition-transform duration-300`}
                                style={
                                    state.selectedFilter
                                        ? state.availableFilters.find(f => f.id === state.selectedFilter)?.style
                                        : {}
                                }
                            />
                        </div>
                    ))}
            </div>

            {/* Stickers overlay */}
            {appliedStickers.map((sticker, index) => {
                // Check if sticker is completely outside the container
                const containerWidth = previewContainerRef.current?.offsetWidth || 0;
                const containerHeight = previewContainerRef.current?.offsetHeight || 0;
                const isOutside =
                    sticker.x >= containerWidth ||
                    sticker.y >= containerHeight ||
                    sticker.x + sticker.width <= 0 ||
                    sticker.y + sticker.height <= 0;

                // Only render stickers that are at least partially inside the container
                if (isOutside) return null;

                // Determine if this sticker is being dragged or selected
                const isDragging = draggingIndex === index;
                const isSelected = selectedStickerIndex === index;

                return (
                    <div
                        key={sticker.id}
                        className={`absolute cursor-move ${
                            isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                        } touch-none`} // touch-none is crucial for mobile
                        style={{
                            width: `${sticker.width}px`,
                            height: `${sticker.height}px`,
                            left: `${sticker.x}px`,
                            top: `${sticker.y}px`,
                            zIndex: 100 + (sticker.zIndex || index),
                            transform: `${isDragging ? 'scale(1.05)' : 'scale(1)'} rotate(${sticker.rotation || 0}deg)`,
                            boxShadow: isDragging ? '0 8px 20px rgba(0,0,0,0.2)' : 'none',
                            transition: isDragging ? 'none' : 'all 0.2s ease',
                            touchAction: 'none', // This is crucial for mobile
                        }}
                        onMouseDown={e => {
                            handleMouseDown(e, index);
                            // We'll handle selection in mouseDown to avoid conflicts
                            selectSticker(index, e);
                        }}
                        onTouchStart={e => handleTouchStart(e, index)}
                        // Remove onClick handler as it conflicts with drag operations
                        // onClick is handled in mouseDown instead
                    >
                        <img
                            src={sticker.url}
                            alt={`Sticker ${index + 1}`}
                            className='w-full h-full object-contain pointer-events-none'
                            draggable='false'
                        />
                    </div>
                );
            })}
        </div>
    );
}
