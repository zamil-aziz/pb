'use client';
import { useContext, useState } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';

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
        <div className='p-10 pt-5 max-w-4xl mx-auto bg-white bg-opacity-95 backdrop-blur-md rounded-3xl shadow-2xl border border-white border-opacity-40 relative overflow-hidden'>
            {/* Enhanced decorative elements */}
            <div className='absolute top-0 right-0 w-40 h-40 -mt-12 -mr-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-20 animate-pulse'></div>
            <div className='absolute bottom-0 left-0 w-48 h-48 -mb-16 -ml-16 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-full opacity-20 animate-pulse'></div>
            <div className='absolute top-10 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-pink-300 to-purple-400 opacity-30 blur-xl'></div>
            <div className='absolute bottom-20 right-10 w-40 h-40 rounded-full bg-gradient-to-r from-blue-300 to-indigo-400 opacity-30 blur-xl'></div>

            <h2 className='text-4xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 tracking-tight leading-tight'>
                Choose Your Photo Style
            </h2>

            <p className='text-center text-gray-700 text-lg mb-10 max-w-2xl mx-auto leading-relaxed'>
                Select how you want your photos to be captured and arranged
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-14'>
                {/* Photo Strips Option - Enhanced */}
                <div
                    className={`bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 cursor-pointer transform transition-all duration-300 hover:shadow-xl ${
                        mode === 'strips' ? 'ring-4 ring-indigo-500 shadow-lg scale-105' : 'hover:scale-105'
                    }`}
                    onClick={() => handleModeSelect('strips')}
                >
                    <h3 className='text-2xl font-bold text-center text-indigo-700 mb-5'>Photo Strips</h3>
                    <div className='bg-white p-2.5 shadow-md mx-auto w-30 mb-5'>
                        <div className='flex flex-col space-y-2'>
                            {[1, 2, 3, 4].map(item => (
                                <div key={item} className='bg-gray-800 h-16'></div>
                            ))}
                        </div>
                    </div>
                    <p className='text-center text-gray-700 font-semibold mb-4 leading-relaxed'>
                        Classic photo booth style with 4 separate photos arranged in a strip
                    </p>
                    <ul className='mt-5 space-y-3 max-w-xs mx-auto'>
                        <li className='flex items-center text-sm text-gray-600'>
                            <span className='h-6 w-6 mr-3 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0'>
                                ✓
                            </span>
                            <span>Take 4 photos in sequence</span>
                        </li>
                        <li className='flex items-center text-sm text-gray-600'>
                            <span className='h-6 w-6 mr-3 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0'>
                                ✓
                            </span>
                            <span>Perfect for showing different poses</span>
                        </li>
                        <li className='flex items-center text-sm text-gray-600'>
                            <span className='h-6 w-6 mr-3 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0'>
                                ✓
                            </span>
                            <span>Traditional photo booth experience</span>
                        </li>
                    </ul>
                </div>

                {/* Single Photo Option - Enhanced */}
                <div
                    className={`bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8 cursor-pointer transform transition-all duration-300 hover:shadow-xl ${
                        mode === 'single' ? 'ring-4 ring-pink-500 shadow-lg scale-105' : 'hover:scale-105'
                    }`}
                    onClick={() => handleModeSelect('single')}
                >
                    <h3 className='text-2xl font-bold text-center text-pink-700 mb-5'>Single Photo</h3>
                    <div className='bg-white p-3 shadow-md mx-auto w-48 h-52 mb-5'>
                        <div className='bg-gray-800 h-full w-full'></div>
                    </div>
                    <p className='text-center text-gray-700 font-semibold mb-4 leading-relaxed'>
                        One large, high-quality photo for the perfect memorable moment
                    </p>
                    <ul className='mt-5 space-y-3 max-w-xs mx-auto'>
                        <li className='flex items-center text-sm text-gray-600'>
                            <span className='h-6 w-6 mr-3 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 flex-shrink-0'>
                                ✓
                            </span>
                            <span>Capture one perfect moment</span>
                        </li>
                        <li className='flex items-center text-sm text-gray-600'>
                            <span className='h-6 w-6 mr-3 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 flex-shrink-0'>
                                ✓
                            </span>
                            <span>Larger print size</span>
                        </li>
                        <li className='flex items-center text-sm text-gray-600'>
                            <span className='h-6 w-6 mr-3 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 flex-shrink-0'>
                                ✓
                            </span>
                            <span>Great for group photos</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className='grid grid-cols-2 gap-6 max-w-2xl mx-auto'>
                <button
                    onClick={goBack}
                    className='bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2'
                >
                    Back
                </button>
                <button
                    onClick={continueToCamera}
                    className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2'
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
