import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function StickerNavigationButtons({ goBackToCustomize, continueToPayment }) {
    return (
        <div className='grid grid-cols-2 gap-4'>
            <button
                onClick={goBackToCustomize}
                className='group bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-bold py-4 px-6 rounded-xl text-base md:text-lg shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 relative overflow-hidden'
            >
                <span className='relative z-10 flex items-center justify-center gap-2'>
                    <ChevronLeft size={20} className='group-hover:-translate-x-1 transition-transform duration-300' />
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
                    <ChevronRight size={20} className='group-hover:translate-x-1 transition-transform duration-300' />
                </span>
                <span className='absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300'></span>
            </button>
        </div>
    );
}
