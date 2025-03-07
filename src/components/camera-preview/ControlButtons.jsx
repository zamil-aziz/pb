import React from 'react';

export const ControlButtons = ({ dispatch }) => {
    return (
        <div className='grid grid-cols-2 gap-2 sm:gap-4 mb-2 sm:mb-3 mt-auto flex-shrink-0'>
            <button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'photoMode' })}
                className='bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-2 sm:py-3 md:py-4 px-4 sm:px-5 md:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-xl shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50'
                aria-label='Go back to welcome screen'
            >
                Go Back
            </button>
            <button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'countdown' })}
                className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2 sm:py-3 md:py-4 px-4 sm:px-5 md:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50'
                aria-label='Take photos'
            >
                Take Photos
            </button>
        </div>
    );
};
