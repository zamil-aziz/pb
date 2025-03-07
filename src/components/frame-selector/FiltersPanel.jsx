import React from 'react';
import { Camera, Film, Sun } from 'lucide-react';

export const FiltersPanel = ({ filters, selectedFilter, applyFilter }) => {
    // Map filter IDs to appropriate icons with colors
    const getFilterIcon = filterId => {
        switch (filterId) {
            case 'normal':
                return <Camera size={24} className='text-purple-600' />;
            case 'grayscale':
                return <Film size={24} className='text-gray-600' />;
            case 'warm':
                return <Sun size={24} className='text-amber-500' />;
            default:
                return <Camera size={24} className='text-purple-600' />;
        }
    };

    return (
        <>
            <h3 className='text-xl font-semibold mb-4 text-gray-700'>Photo Filters</h3>
            <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-2'>
                {filters.map(filter => (
                    <div
                        key={filter.id}
                        onClick={() => applyFilter(filter.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                            selectedFilter === filter.id
                                ? 'bg-indigo-100 ring-2 ring-indigo-500 shadow-lg'
                                : 'bg-gray-100 hover:bg-gray-200 hover:shadow-md'
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
                        {/* Fixed height preview area to match frame styles */}
                        <div className='h-20 mb-2 overflow-hidden rounded-lg flex items-center justify-center bg-gray-50'>
                            {getFilterIcon(filter.id)}
                        </div>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <div
                                    className={`w-4 h-4 rounded-full ${
                                        filter.id === 'normal'
                                            ? 'bg-purple-200'
                                            : filter.id === 'grayscale'
                                            ? 'bg-gray-400'
                                            : filter.id === 'warm'
                                            ? 'bg-amber-300'
                                            : 'bg-purple-200'
                                    } border border-gray-300 flex-shrink-0`}
                                ></div>
                                <p className='font-semibold text-sm text-gray-800 truncate'>{filter.name}</p>
                            </div>
                            {selectedFilter === filter.id && (
                                <div className='flex-shrink-0'>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        className='h-4 w-4 text-indigo-600'
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
                    </div>
                ))}
            </div>
        </>
    );
};
