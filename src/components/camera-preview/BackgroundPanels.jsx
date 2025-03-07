import React from 'react';
import BackgroundSelector from './BackgroundSelector';

export const BackgroundsPanel = ({ state, dispatch }) => {
    return (
        <div className='space-y-2 sm:space-y-4'>
            <div className='flex justify-between items-center'>
                <h3 className='text-base sm:text-lg font-semibold text-purple-700'>Choose Background</h3>
                {state.selectedBackground && (
                    <button
                        onClick={() => dispatch({ type: 'SET_BACKGROUND', payload: null })}
                        className='text-xs sm:text-sm text-purple-600 hover:text-purple-800 flex items-center'
                        aria-label='Reset background selection'
                    >
                        <span className='mr-1'>Reset</span>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-3 w-3 sm:h-4 sm:w-4'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M6 18L18 6M6 6l12 12'
                            />
                        </svg>
                    </button>
                )}
            </div>
            <BackgroundSelector />
        </div>
    );
};
