'use client';

import { useEffect, useContext } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';
import { printPhotos } from '../lib/printerUtils';

export default function PrintManager() {
    const { state, dispatch } = useContext(PhotoboothContext);

    useEffect(() => {
        const print = async () => {
            try {
                await printPhotos(state.photos, state.selectedBackground?.name);

                // After printing is complete, show thank you screen
                setTimeout(() => {
                    dispatch({ type: 'SET_VIEW', payload: 'thankyou' });
                }, 1000);
            } catch (error) {
                console.error('Printing error:', error);
                // Handle error - perhaps retry or show error message
            }
        };

        print();
    }, [state.photos, state.selectedBackground, dispatch]);

    return (
        <div className='p-8 max-w-4xl mx-auto bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white border-opacity-40 relative overflow-hidden'>
            {/* Decorative elements - matching CameraView */}
            <div className='absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-10'></div>
            <div className='absolute bottom-0 left-0 w-40 h-40 -mb-16 -ml-16 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full opacity-10'></div>
            <div className='absolute top-10 left-10 w-24 h-24 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 opacity-30 blur-xl'></div>
            <div className='absolute bottom-20 right-10 w-32 h-32 rounded-full bg-gradient-to-r from-blue-300 to-indigo-300 opacity-30 blur-xl'></div>

            <h2 className='text-4xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600'>
                Printing Your Photos
            </h2>

            <div className='relative mx-auto overflow-hidden rounded-xl shadow-lg mb-8 p-6 bg-white bg-opacity-70'>
                <div className='mb-6'>
                    <div className='relative pt-1'>
                        <div className='overflow-hidden h-8 mb-4 text-xs flex rounded-xl bg-indigo-100'>
                            <div className='w-full h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse flex items-center justify-center text-white font-bold text-lg'>
                                Processing...
                            </div>
                        </div>
                    </div>
                </div>

                <p className='text-xl text-gray-700 text-center'>Please wait while your photos are printing...</p>
            </div>

            <div className='flex justify-center mb-8'>
                <div className='w-48 h-48 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center p-4'>
                    <svg
                        className='animate-spin h-32 w-32 text-indigo-600'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                    >
                        <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                        ></circle>
                        <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                    </svg>
                </div>
            </div>

            <div className='text-center'>
                <p className='text-lg text-gray-500'>Your photos will be ready in a moment</p>
            </div>
        </div>
    );
}
