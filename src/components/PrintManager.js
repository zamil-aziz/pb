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
                }, 5000);
            } catch (error) {
                console.error('Printing error:', error);
                // Handle error - perhaps retry or show error message
            }
        };

        print();
    }, [state.photos, state.selectedBackground, dispatch]);

    return (
        <div className='w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center'>
            <h2 className='text-3xl font-bold mb-8'>Printing Your Photos</h2>

            <div className='mb-8'>
                <div className='relative pt-1'>
                    <div className='overflow-hidden h-6 mb-4 text-xs flex rounded-full bg-blue-200'>
                        <div className='w-full h-full bg-blue-500 animate-pulse flex items-center justify-center text-white'>
                            Processing...
                        </div>
                    </div>
                </div>
            </div>

            <p className='text-xl mb-8'>Please wait while your photos are printing...</p>

            <div className='mx-auto w-64 h-64 rounded-full bg-gray-200 flex items-center justify-center'>
                <svg
                    className='animate-spin h-32 w-32 text-blue-500'
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
    );
}
