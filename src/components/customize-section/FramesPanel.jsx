import React from 'react';

export const FramesPanel = ({ frames, selectedFrame, onFrameSelect, isSingleMode }) => {
    return (
        <div className='mb-6'>
            <h3 className='text-xl font-semibold mb-4 text-gray-700 text-left'>Frame Styles</h3>
            <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-2'>
                {frames.map(frame => (
                    <div
                        key={frame.id}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                            selectedFrame === frame.id
                                ? 'bg-indigo-100 ring-2 ring-indigo-500 shadow-lg'
                                : 'bg-gray-100 hover:bg-gray-200 hover:shadow-md'
                        }`}
                        onClick={() => onFrameSelect(frame.id)}
                        role='button'
                        aria-label={`Select ${frame.name} frame`}
                        tabIndex={0}
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                onFrameSelect(frame.id);
                            }
                        }}
                    >
                        {/* Fixed height preview for mini frame examples */}
                        <div className='h-20 mb-2 overflow-hidden rounded-lg'>
                            <div className={`h-full w-full ${frame.class}`}>
                                <div className='h-full flex flex-col p-1 relative'>
                                    {/* Mini representation of photos based on mode */}
                                    {isSingleMode ? (
                                        <div className='h-full w-full bg-gray-300 mx-auto rounded-sm'></div>
                                    ) : (
                                        <>
                                            <div className='h-5 w-11/12 bg-gray-300 mt-1 mx-auto rounded-sm'></div>
                                            <div className='h-5 w-11/12 bg-gray-300 mt-1 mx-auto rounded-sm'></div>
                                            <div className='h-5 w-11/12 bg-gray-300 mt-1 mx-auto rounded-sm'></div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <div
                                    className={`w-4 h-4 rounded-full ${frame.previewClass} border border-gray-300 flex-shrink-0`}
                                ></div>
                                <p className='font-semibold text-sm text-gray-800 truncate'>{frame.name}</p>
                            </div>
                            {selectedFrame === frame.id && (
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
        </div>
    );
};
