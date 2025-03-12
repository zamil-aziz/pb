import React from 'react';
import { Camera, Film, Sun, Droplets } from 'lucide-react';

export const FiltersPanel = ({ filters, selectedFilter, applyFilter }) => {
    // Map filter IDs to appropriate icons with colors
    const getFilterIcon = filterId => {
        switch (filterId) {
            case 'normal':
                return <Camera size={28} className='text-purple-600' />;
            case 'grayscale':
                return <Film size={28} className='text-gray-600' />;
            case 'warm':
                return <Sun size={28} className='text-amber-500' />;
            // Add more cases for additional filters
            default:
                return <Droplets size={28} className='text-blue-500' />;
        }
    };

    return (
        <>
            <h3 className='text-xl font-semibold mb-4 text-gray-700'>Choose a Filter Effect</h3>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                {filters.map(filter => (
                    <div
                        key={filter.id}
                        onClick={() => applyFilter(filter.id)}
                        className={`group p-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                            selectedFilter === filter.id
                                ? 'bg-indigo-100 ring-2 ring-indigo-500 shadow-md'
                                : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md'
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
                        <div className='h-24 mb-3 overflow-hidden rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300 flex items-center justify-center bg-white'>
                            <div className='p-3 rounded-full bg-gray-50 group-hover:bg-gray-100 transition-colors duration-300'>
                                {getFilterIcon(filter.id)}
                            </div>
                        </div>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <div
                                    className={`w-5 h-5 rounded-full ${
                                        filter.id === 'normal'
                                            ? 'bg-purple-200'
                                            : filter.id === 'grayscale'
                                            ? 'bg-gray-400'
                                            : filter.id === 'warm'
                                            ? 'bg-amber-300'
                                            : 'bg-blue-200'
                                    } border border-gray-300 flex-shrink-0 shadow-sm`}
                                ></div>
                                <p className='font-semibold text-gray-800 truncate'>{filter.name}</p>
                            </div>
                            {selectedFilter === filter.id && (
                                <div className='flex-shrink-0 bg-indigo-500 rounded-full p-1 text-white'>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        className='h-4 w-4'
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
