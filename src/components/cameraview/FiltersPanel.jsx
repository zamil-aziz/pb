import React from 'react';

export const FiltersPanel = ({ filters, selectedFilter, applyFilter }) => {
    return (
        <div className='space-y-2 sm:space-y-4'>
            <div className='flex justify-between items-center'>
                <h3 className='text-base sm:text-lg font-semibold text-purple-700'>Choose Filter</h3>
                {selectedFilter && selectedFilter !== 'normal' && (
                    <button
                        onClick={() => applyFilter('normal')}
                        className='text-xs sm:text-sm text-purple-600 hover:text-purple-800 flex items-center'
                        aria-label='Reset filter'
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
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3'>
                {filters.map(filter => (
                    <div
                        key={filter.id}
                        onClick={() => applyFilter(filter.id)}
                        className={`relative rounded-lg overflow-hidden cursor-pointer transition-all transform hover:scale-105 ${
                            selectedFilter === filter.id ? 'ring-2 ring-purple-600 scale-105' : ''
                        }`}
                        role='button'
                        aria-label={`Apply ${filter.name} filter`}
                        tabIndex={0}
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                applyFilter(filter.id);
                            }
                        }}
                    >
                        <div
                            className='w-full bg-gradient-to-r from-indigo-200 to-purple-200'
                            style={{ ...filter.style, aspectRatio: '5/3', maxHeight: '60px' }}
                        ></div>
                        <div
                            className={`text-center py-1 text-xs sm:text-sm ${
                                selectedFilter === filter.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                            {filter.name}
                        </div>
                        {selectedFilter === filter.id && (
                            <div className='absolute top-1 right-1'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='h-4 w-4 sm:h-5 sm:w-5 text-white bg-purple-600 rounded-full p-0.5 sm:p-1'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M5 13l4 4L19 7'
                                    />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
