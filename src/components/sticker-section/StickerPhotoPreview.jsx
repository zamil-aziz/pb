import React from 'react';

export default function StickerPhotoPreview({
    previewContainerRef,
    state,
    appliedStickers,
    selectedStickerIndex,
    handleDragStart,
    selectSticker,
    setSelectedStickerIndex,
}) {
    // Check if we're in single mode
    const isSingleMode = state.photoMode === 'single';

    return (
        <div
            ref={previewContainerRef}
            onClick={() => setSelectedStickerIndex(null)}
            className={`relative ${isSingleMode ? 'max-w-[340px]' : 'max-w-[200px]'} mx-auto ${
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

                return (
                    <div
                        key={sticker.id}
                        className={`absolute cursor-move ${
                            selectedStickerIndex === index ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
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
                );
            })}
        </div>
    );
}
