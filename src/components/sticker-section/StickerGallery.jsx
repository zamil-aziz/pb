import React, { useState } from 'react';
import { Sticker, Move, Plus, Minus, RotateCcw, RotateCw, X, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function StickerGallery({ addSticker }) {
    // State to toggle instructions visibility
    const [showInstructions, setShowInstructions] = useState(false);

    // Available stickers data
    const availableStickers = [
        { id: 'heart', name: 'Heart', url: '/stickers/heart.png' },
        // Uncomment when more stickers are available
        { id: 'cat-ears', name: 'Cat Ears', url: '/stickers/cat-ears.png' },
        { id: 'glasses', name: 'Glasses', url: '/stickers/glasses.png' },
        { id: 'cowboy-hat', name: 'Cat Ears', url: '/stickers/cowboy-hat.png' },

        // { id: 'star', name: 'Star', url: '/stickers/star.png' },
        // { id: 'balloon', name: 'Balloon', url: '/stickers/balloon.png' },
    ];

    return (
        <div className='bg-white p-4 rounded-2xl shadow-lg border border-gray-100'>
            <div className='flex items-center mb-4'>
                <Sticker size={20} className='mr-2 text-indigo-600' />
                <h3 className='text-xl font-semibold text-indigo-700'>Available Stickers</h3>
            </div>

            <p className='text-gray-600 mb-4'>
                Tap a sticker to add it to your photo. Then drag to position it exactly where you want.
            </p>

            <div className='grid grid-cols-4 gap-4'>
                {availableStickers.map(sticker => (
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

            {/* Improved collapsible instruction section */}
            <div className='mt-4'>
                <button
                    onClick={() => setShowInstructions(!showInstructions)}
                    className='w-full flex items-center justify-between p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors'
                >
                    <div className='flex items-center'>
                        <HelpCircle size={18} className='text-indigo-600 mr-2' />
                        <span className='font-medium text-indigo-700'>How to use stickers</span>
                    </div>
                    {showInstructions ? (
                        <ChevronUp size={18} className='text-indigo-600' />
                    ) : (
                        <ChevronDown size={18} className='text-indigo-600' />
                    )}
                </button>

                {showInstructions && (
                    <div className='mt-2 p-3 bg-indigo-50 rounded-lg'>
                        <div className='grid grid-cols-2 gap-x-4 gap-y-2'>
                            <div className='flex items-center'>
                                <div className='w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2'>
                                    <Sticker size={14} className='text-indigo-600' />
                                </div>
                                <span className='text-sm text-indigo-700'>Tap to add sticker</span>
                            </div>
                            <div className='flex items-center'>
                                <div className='w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2'>
                                    <Move size={14} className='text-indigo-600' />
                                </div>
                                <span className='text-sm text-indigo-700'>Drag to position</span>
                            </div>
                            <div className='flex items-center'>
                                <div className='w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2'>
                                    <Plus size={14} className='text-indigo-600' />
                                </div>
                                <span className='text-sm text-indigo-700'>Tap + to resize larger</span>
                            </div>
                            <div className='flex items-center'>
                                <div className='w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2'>
                                    <Minus size={14} className='text-indigo-600' />
                                </div>
                                <span className='text-sm text-indigo-700'>Tap - to resize smaller</span>
                            </div>
                            <div className='flex items-center'>
                                <div className='w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2'>
                                    <RotateCcw size={14} className='text-indigo-600' />
                                </div>
                                <span className='text-sm text-indigo-700'>Tap ↺ to rotate left</span>
                            </div>
                            <div className='flex items-center'>
                                <div className='w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2'>
                                    <RotateCw size={14} className='text-indigo-600' />
                                </div>
                                <span className='text-sm text-indigo-700'>Tap ↻ to rotate right</span>
                            </div>
                            <div className='flex items-center'>
                                <div className='w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2'>
                                    <X size={14} className='text-indigo-600' />
                                </div>
                                <span className='text-sm text-indigo-700'>Tap X to remove sticker</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
