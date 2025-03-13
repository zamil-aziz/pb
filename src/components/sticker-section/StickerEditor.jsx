import React from 'react';
import { X, RotateCcw, RotateCw, Plus, Minus } from 'lucide-react';

export default function StickerEditor({ selectedStickerIndex, resizeSticker, rotateSticker, removeSticker }) {
    return (
        <div className='p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl shadow-inner border border-indigo-100 animate-fadeIn'>
            <h4 className='text-indigo-700 font-medium text-sm mb-3 text-center'>Edit Sticker</h4>

            <div className='flex flex-wrap justify-center gap-3'>
                <div className='flex gap-2'>
                    {/* Size controls group */}
                    <div className='flex items-center bg-white rounded-lg shadow-sm overflow-hidden'>
                        <button
                            onClick={() => resizeSticker(selectedStickerIndex, -5)}
                            className='p-3 hover:bg-indigo-50 active:bg-indigo-100 transition-colors duration-150 touch-manipulation focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-inset'
                            title='Make smaller'
                            aria-label='Make sticker smaller'
                        >
                            <Minus size={25} className='text-indigo-700' />
                        </button>

                        <div className='h-10 w-px bg-gray-200'></div>

                        <button
                            onClick={() => resizeSticker(selectedStickerIndex, 5)}
                            className='p-3 hover:bg-indigo-50 active:bg-indigo-100 transition-colors duration-150 touch-manipulation focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-inset'
                            title='Make larger'
                            aria-label='Make sticker larger'
                        >
                            <Plus size={25} className='text-indigo-700' />
                        </button>
                    </div>

                    {/* Rotation controls group */}
                    <div className='flex items-center bg-white rounded-lg shadow-sm overflow-hidden'>
                        <button
                            onClick={() => rotateSticker(selectedStickerIndex, -15)}
                            className='p-3 hover:bg-indigo-50 active:bg-indigo-100 transition-colors duration-150 touch-manipulation focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-inset'
                            title='Rotate counterclockwise'
                            aria-label='Rotate sticker counterclockwise'
                        >
                            <RotateCcw size={25} className='text-indigo-700' />
                        </button>

                        <div className='h-10 w-px bg-gray-200'></div>

                        <button
                            onClick={() => rotateSticker(selectedStickerIndex, 15)}
                            className='p-3 hover:bg-indigo-50 active:bg-indigo-100 transition-colors duration-150 touch-manipulation focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-inset'
                            title='Rotate clockwise'
                            aria-label='Rotate sticker clockwise'
                        >
                            <RotateCw size={25} className='text-indigo-700' />
                        </button>
                    </div>
                </div>

                {/* Remove button */}
                <button
                    onClick={() => removeSticker(selectedStickerIndex)}
                    className='p-3 bg-white rounded-lg shadow-sm hover:bg-red-50 active:bg-red-100 text-red-500 transition-colors duration-150 touch-manipulation focus:outline-none focus:ring-2 focus:ring-red-300'
                    title='Remove sticker'
                    aria-label='Remove sticker'
                >
                    <X size={25} />
                </button>
            </div>
        </div>
    );
}
