import React from 'react';
import { Sticker, Move } from 'lucide-react';

export default function StickerGallery({ addSticker }) {
    // Available stickers data
    const availableStickers = [
        { id: 'heart', name: 'Heart', url: '/stickers/heart.png' },
        // Uncomment when more stickers are available
        // { id: 'star', name: 'Star', url: '/stickers/star.png' },
        // { id: 'balloon', name: 'Balloon', url: '/stickers/balloon.png' },
    ];

    return (
        <div className='bg-white p-6 rounded-2xl shadow-lg border border-gray-100'>
            <div className='flex items-center mb-4'>
                <Sticker size={20} className='mr-2 text-indigo-600' />
                <h3 className='text-xl font-semibold text-gray-800'>Available Stickers</h3>
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
    );
}
