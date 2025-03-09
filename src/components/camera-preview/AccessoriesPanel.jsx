import React from 'react';

const AccessoryItem = ({ accessory, isSelected, onSelect }) => {
    return (
        <div
            className={`
                relative group p-1 rounded-lg cursor-pointer transition-all duration-200
                ${isSelected ? 'ring-2 ring-purple-500 bg-purple-100' : 'hover:bg-purple-50'}
            `}
            onClick={() => onSelect(accessory)}
        >
            <div className='aspect-square rounded-md overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200'>
                <div className='w-full h-full flex items-center justify-center p-2'>
                    <img src={accessory.url} alt={accessory.name} className='max-w-full max-h-full object-contain' />
                </div>
            </div>
            <p className='mt-1 text-xs text-center text-gray-700 font-medium truncate'>{accessory.name}</p>
            {isSelected && (
                <div className='absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center'>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-3 w-3 text-white'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                    >
                        <path
                            fillRule='evenodd'
                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                            clipRule='evenodd'
                        />
                    </svg>
                </div>
            )}
        </div>
    );
};

export const AccessoriesPanel = ({ state, dispatch }) => {
    return (
        <div className='space-y-2 sm:space-y-4'>
            <div className='flex justify-between items-center'>
                <h3 className='text-base sm:text-lg font-semibold text-purple-700'>Choose Accessories</h3>
                {state.selectedAccessory && (
                    <button
                        onClick={() => dispatch({ type: 'SET_ACCESSORY', payload: null })}
                        className='text-xs sm:text-sm text-purple-600 hover:text-purple-800 flex items-center'
                        aria-label='Reset accessory selection'
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

            <div className='grid grid-cols-4 sm:grid-cols-5 gap-2'>
                {state.availableAccessories.map(accessory => (
                    <AccessoryItem
                        key={accessory.id}
                        accessory={accessory}
                        isSelected={state.selectedAccessory?.id === accessory.id}
                        onSelect={accessory => dispatch({ type: 'SET_ACCESSORY', payload: accessory })}
                    />
                ))}
            </div>
        </div>
    );
};
