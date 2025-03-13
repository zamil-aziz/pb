'use client';
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable navigation buttons component for the photobooth application
 *
 * @param {Object} props
 * @param {Function} props.onBackClick - Function to call when the back button is clicked
 * @param {Function} props.onContinueClick - Function to call when the continue button is clicked
 * @param {string} props.backText - Text to display on the back button
 * @param {string} props.continueText - Text to display on the continue button
 * @param {boolean} props.backDisabled - Whether the back button should be disabled
 * @param {boolean} props.continueDisabled - Whether the continue button should be disabled
 * @param {string} props.className - Additional class names for the container
 * @param {string} props.gridCols - Grid columns class (default: 'grid-cols-2')
 */
export default function NavigationButtons({
    onBackClick,
    onContinueClick,
    backText = 'Back',
    continueText = 'Continue',
    backDisabled = false,
    continueDisabled = false,
    className = '',
    gridCols = 'grid-cols-2',
}) {
    return (
        <div className={`grid ${gridCols} gap-4 ${className}`}>
            <button
                onClick={onBackClick}
                disabled={backDisabled}
                className={`group bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-bold py-2 sm:py-3 md:py-4 px-4 sm:px-5 md:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 relative overflow-hidden ${
                    backDisabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
                <span className='relative z-10 flex items-center justify-center gap-2'>
                    <ChevronLeft size={20} className='group-hover:-translate-x-1 transition-transform duration-300' />
                    <span>{backText}</span>
                </span>
                <span className='absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 opacity-0 group-hover:opacity-30 transition-opacity duration-300'></span>
            </button>
            <button
                onClick={onContinueClick}
                disabled={continueDisabled}
                className={`group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2 sm:py-3 md:py-4 px-4 sm:px-5 md:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 relative overflow-hidden ${
                    continueDisabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
                <span className='relative z-10 flex items-center justify-center gap-2'>
                    <span>{continueText}</span>
                    <ChevronRight size={20} className='group-hover:translate-x-1 transition-transform duration-300' />
                </span>
                <span className='absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300'></span>
            </button>
        </div>
    );
}
