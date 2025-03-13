import React from 'react';
import { X } from 'lucide-react';

export default function StickerEditor({ selectedStickerIndex, resizeSticker, removeSticker }) {
    return (
        <div className='mt-4 flex flex-wrap gap-4 justify-center p-4 bg-gray-100 rounded-xl'>
            <button
                onClick={() => resizeSticker(selectedStickerIndex, -5)}
                className='p-4 bg-white rounded-full shadow hover:bg-gray-50 active:bg-gray-100 touch-manipulation'
                title='Make smaller'
            >
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
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
                className='p-4 bg-white rounded-full shadow hover:bg-gray-50 active:bg-gray-100 touch-manipulation'
                title='Make larger'
            >
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
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
                className='p-4 bg-white rounded-full shadow hover:bg-red-50 active:bg-red-100 text-red-500 touch-manipulation'
                title='Remove sticker'
            >
                <X size={24} />
            </button>
        </div>
    );
}
