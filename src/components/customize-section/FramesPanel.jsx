import React from 'react';

export const FramesPanel = ({ frames, selectedFrame, onFrameSelect, isSingleMode }) => {
    return (
        <div>
            <h3 className='text-xl font-semibold mb-4 text-gray-700'>Choose Your Frame</h3>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                {frames.map(frame => (
                    <div
                        key={frame.id}
                        className={`group p-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                            selectedFrame === frame.id
                                ? 'bg-indigo-100 ring-2 ring-indigo-500 shadow-md'
                                : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md'
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
                        <div className='h-24 mb-3 overflow-hidden rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300'>
                            <div className={`h-full w-full ${frame.class} bg-gray-50`}>
                                <div className='h-full flex flex-col p-1 relative'>
                                    {/* Mini representation of photos based on mode */}
                                    {isSingleMode ? (
                                        <div className='h-full w-full bg-gray-300 mx-auto rounded-sm'></div>
                                    ) : (
                                        <>
                                            <div className='h-6 w-11/12 bg-gray-300 mt-1 mx-auto rounded-sm'></div>
                                            <div className='h-6 w-11/12 bg-gray-300 mt-1 mx-auto rounded-sm'></div>
                                            <div className='h-6 w-11/12 bg-gray-300 mt-1 mx-auto rounded-sm'></div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <div
                                    className={`w-5 h-5 rounded-full ${frame.previewClass} border border-gray-300 flex-shrink-0 shadow-sm`}
                                ></div>
                                <p className='font-semibold text-gray-800 truncate'>{frame.name}</p>
                            </div>
                            {selectedFrame === frame.id && (
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
        </div>
    );
};
