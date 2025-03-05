'use client';
import { useContext, useState } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';
import { Grid2X2, Maximize2 } from 'lucide-react';

export default function PhotoModeSelector() {
    const { state, dispatch } = useContext(PhotoboothContext);
    const [mode, setMode] = useState('strips'); // 'strips' or 'single'

    // Handle selection of photo mode
    const handleModeSelect = selectedMode => {
        setMode(selectedMode);
    };

    // Continue to camera view with selected mode
    const continueToCamera = () => {
        dispatch({ type: 'SET_PHOTO_MODE', payload: mode });
        dispatch({ type: 'SET_VIEW', payload: 'camera' });
    };

    // Go back to welcome screen
    const goBack = () => {
        dispatch({ type: 'SET_VIEW', payload: 'welcome' });
    };

    return (
        <div className='p-8 max-w-4xl mx-auto bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white border-opacity-40 relative overflow-hidden'>
            {/* Decorative elements */}
            <div className='absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-10'></div>
            <div className='absolute bottom-0 left-0 w-40 h-40 -mb-16 -ml-16 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full opacity-10'></div>
            <div className='absolute top-10 left-10 w-24 h-24 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 opacity-30 blur-xl'></div>
            <div className='absolute bottom-20 right-10 w-32 h-32 rounded-full bg-gradient-to-r from-blue-300 to-indigo-300 opacity-30 blur-xl'></div>

            <h2 className='text-4xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600'>
                Choose Your Photo Style
            </h2>

            <p className='text-center text-gray-700 text-lg mb-8'>
                Select how you want your photos to be captured and arranged
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-12'>
                {/* Photo Strips Option */}
                <div
                    className={`bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 cursor-pointer transform transition-all duration-300 hover:shadow-xl ${
                        mode === 'strips' ? 'ring-4 ring-indigo-500 shadow-lg scale-105' : 'hover:scale-102'
                    }`}
                    onClick={() => handleModeSelect('strips')}
                >
                    <div className='flex justify-center mb-6'>
                        <div className='bg-indigo-100 p-4 rounded-full'>
                            <Grid2X2 size={48} className='text-indigo-600' />
                        </div>
                    </div>
                    <h3 className='text-2xl font-bold text-center text-indigo-700 mb-4'>Photo Strips</h3>
                    <div className='bg-white rounded-xl p-3 shadow-md mx-auto w-48 mb-4'>
                        <div className='flex flex-col space-y-2'>
                            {[1, 2, 3, 4].map(item => (
                                <div key={item} className='bg-gray-200 h-12 rounded-md'></div>
                            ))}
                        </div>
                    </div>
                    <p className='text-gray-700 text-center'>
                        Classic photo booth style with 4 separate photos arranged in a strip
                    </p>
                    <ul className='mt-4 space-y-2'>
                        <li className='flex items-center text-sm text-gray-600'>
                            <span className='h-5 w-5 mr-2 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600'>
                                ✓
                            </span>
                            Take 4 photos in sequence
                        </li>
                        <li className='flex items-center text-sm text-gray-600'>
                            <span className='h-5 w-5 mr-2 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600'>
                                ✓
                            </span>
                            Perfect for showing different poses
                        </li>
                        <li className='flex items-center text-sm text-gray-600'>
                            <span className='h-5 w-5 mr-2 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600'>
                                ✓
                            </span>
                            Traditional photo booth experience
                        </li>
                    </ul>
                </div>

                {/* Single Photo Option */}
                <div
                    className={`bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 cursor-pointer transform transition-all duration-300 hover:shadow-xl ${
                        mode === 'single' ? 'ring-4 ring-pink-500 shadow-lg scale-105' : 'hover:scale-102'
                    }`}
                    onClick={() => handleModeSelect('single')}
                >
                    <div className='flex justify-center mb-6'>
                        <div className='bg-pink-100 p-4 rounded-full'>
                            <Maximize2 size={48} className='text-pink-600' />
                        </div>
                    </div>
                    <h3 className='text-2xl font-bold text-center text-pink-700 mb-4'>Single Photo</h3>
                    <div className='bg-white rounded-xl p-3 shadow-md mx-auto w-48 h-52 mb-4'>
                        <div className='bg-gray-200 h-full w-full rounded-md'></div>
                    </div>
                    <p className='text-gray-700 text-center'>
                        One large, high-quality photo for the perfect memorable moment
                    </p>
                    <ul className='mt-4 space-y-2'>
                        <li className='flex items-center text-sm text-gray-600'>
                            <span className='h-5 w-5 mr-2 rounded-full bg-pink-100 flex items-center justify-center text-pink-600'>
                                ✓
                            </span>
                            Capture one perfect moment
                        </li>
                        <li className='flex items-center text-sm text-gray-600'>
                            <span className='h-5 w-5 mr-2 rounded-full bg-pink-100 flex items-center justify-center text-pink-600'>
                                ✓
                            </span>
                            Larger print size
                        </li>
                        <li className='flex items-center text-sm text-gray-600'>
                            <span className='h-5 w-5 mr-2 rounded-full bg-pink-100 flex items-center justify-center text-pink-600'>
                                ✓
                            </span>
                            Great for group photos
                        </li>
                    </ul>
                </div>
            </div>

            <div className='grid grid-cols-2 gap-6'>
                <button
                    onClick={goBack}
                    className='bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-6 rounded-xl text-xl shadow-lg transform transition-all duration-300 hover:scale-105'
                >
                    Back
                </button>
                <button
                    onClick={continueToCamera}
                    className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl text-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl'
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
