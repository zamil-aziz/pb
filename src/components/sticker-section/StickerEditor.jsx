import React from 'react';
import { X, RotateCcw, RotateCw, Plus, Minus } from 'lucide-react';

export default function StickerEditor({ selectedStickerIndex, resizeSticker, rotateSticker, removeSticker }) {
    return (
        <div className='mt-4 flex flex-wrap gap-4 justify-center p-4 bg-gray-100 rounded-xl'>
            <button
                onClick={() => resizeSticker(selectedStickerIndex, -5)}
                className='p-4 bg-white rounded-full shadow hover:bg-gray-50 active:bg-gray-100 touch-manipulation'
                title='Make smaller'
                aria-label='Make sticker smaller'
            >
                <Minus size={24} />
            </button>

            <button
                onClick={() => resizeSticker(selectedStickerIndex, 5)}
                className='p-4 bg-white rounded-full shadow hover:bg-gray-50 active:bg-gray-100 touch-manipulation'
                title='Make larger'
                aria-label='Make sticker larger'
            >
                <Plus size={24} />
            </button>

            <button
                onClick={() => rotateSticker(selectedStickerIndex, -15)}
                className='p-4 bg-white rounded-full shadow hover:bg-gray-50 active:bg-gray-100 touch-manipulation'
                title='Rotate counterclockwise'
                aria-label='Rotate sticker counterclockwise'
            >
                <RotateCcw size={24} />
            </button>

            <button
                onClick={() => rotateSticker(selectedStickerIndex, 15)}
                className='p-4 bg-white rounded-full shadow hover:bg-gray-50 active:bg-gray-100 touch-manipulation'
                title='Rotate clockwise'
                aria-label='Rotate sticker clockwise'
            >
                <RotateCw size={24} />
            </button>

            <button
                onClick={() => removeSticker(selectedStickerIndex)}
                className='p-4 bg-white rounded-full shadow hover:bg-red-50 active:bg-red-100 text-red-500 touch-manipulation'
                title='Remove sticker'
                aria-label='Remove sticker'
            >
                <X size={24} />
            </button>
        </div>
    );
}
