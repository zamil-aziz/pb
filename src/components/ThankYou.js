'use client';
import { useContext } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';

export default function ThankYou() {
    const { dispatch } = useContext(PhotoboothContext);

    return (
        <div className='p-8 max-w-4xl mx-auto bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white border-opacity-40 relative overflow-hidden'>
            {/* Decorative elements - matching CameraView */}
            <div className='absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-10'></div>
            <div className='absolute bottom-0 left-0 w-40 h-40 -mb-16 -ml-16 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full opacity-10'></div>
            <div className='absolute top-10 left-10 w-24 h-24 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 opacity-30 blur-xl'></div>
            <div className='absolute bottom-20 right-10 w-32 h-32 rounded-full bg-gradient-to-r from-blue-300 to-indigo-300 opacity-30 blur-xl'></div>

            <h2 className='text-4xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600'>
                Thank You!
            </h2>

            <div className='relative mx-auto overflow-hidden rounded-xl shadow-lg mb-8 p-6 bg-white bg-opacity-70'>
                <p className='text-2xl text-gray-700 text-center mb-8'>Your photos are printing...</p>

                <div className='relative mx-auto w-64 h-64 mb-6'>
                    <div className='absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-20 blur-lg transform scale-110'></div>
                    <img
                        src='/images/printing.gif'
                        alt='Printing animation'
                        className='mx-auto w-48 h-48 object-contain relative z-10'
                    />
                </div>

                <p className='text-xl text-gray-600 text-center'>Enjoy your photos!</p>
            </div>

            <div className='grid grid-cols-1 gap-6 mb-6'>
                <button
                    onClick={() => dispatch({ type: 'RESET_APP' })}
                    className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-6 px-8 rounded-xl text-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl'
                >
                    Start New Session
                </button>
            </div>

            <div className='text-center'>
                <p className='text-lg text-gray-500'>Thanks for using our photobooth!</p>
            </div>
        </div>
    );
}
