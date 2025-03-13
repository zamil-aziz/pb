'use client';
import { useContext, useState } from 'react';
import { PhotoboothContext, ActionTypes } from '../contexts/PhotoboothContext';
import NavigationButtons from '../components/NavigationButtons';

export default function PhotoModeSelector() {
    const { state, dispatch } = useContext(PhotoboothContext);
    const [mode, setMode] = useState('strips'); // 'strips' or 'single'
    const [showQuantityPopup, setShowQuantityPopup] = useState(false);
    const [selectedQuantity, setSelectedQuantity] = useState(2); // Default quantity

    // Handle selection of photo mode and show quantity popup immediately
    const handleModeSelect = selectedMode => {
        setMode(selectedMode);
        // Only update the mode in context, not the quantity yet
        dispatch({ type: ActionTypes.SET_PHOTO_MODE, payload: selectedMode });
        setSelectedQuantity(2); // Reset quantity selection when changing modes
        setShowQuantityPopup(true);
    };

    // Handle quantity selection
    const handleQuantitySelect = quantity => {
        setSelectedQuantity(quantity);
    };

    // Continue to camera view with selected mode and quantity
    const continueToCamera = () => {
        // Just proceed to camera view - quantity is already saved
        dispatch({ type: ActionTypes.SET_VIEW, payload: 'camera' });
    };

    // Confirm quantity selection and close popup
    const confirmQuantity = () => {
        dispatch({ type: ActionTypes.SET_PRINT_QUANTITY, payload: selectedQuantity });
        setShowQuantityPopup(false);
    };

    // Close popup and return to mode selection
    const closePopup = () => {
        setShowQuantityPopup(false);
    };

    // Go back to welcome screen
    const goBack = () => {
        dispatch({ type: ActionTypes.SET_VIEW, payload: 'welcome' });
    };

    // Calculate price based on mode and quantity
    const calculatePrice = (photoMode, quantity) => {
        const basePrice = photoMode === 'strips' ? 10.0 : 15.0;
        const multiplier = quantity === 2 ? 1 : quantity === 4 ? 1.8 : quantity === 6 ? 2.5 : quantity === 8 ? 3.0 : 1;

        return (basePrice * multiplier).toFixed(2);
    };

    // Calculate estimated price for popup
    const calculateEstimatedPrice = () => {
        return calculatePrice(mode, selectedQuantity);
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
                    {state.printQuantity > 0 && state.photoMode === 'strips' ? (
                        <div className='flex items-center justify-between mb-4'>
                            <h3 className='text-2xl font-bold text-indigo-700' style={{ marginBottom: 0 }}>
                                Photo Strips
                            </h3>
                            <div className='ml-3 px-3 py-1.5 bg-indigo-100 rounded-lg inline-flex items-center'>
                                <span className='text-sm text-indigo-800 whitespace-nowrap'>
                                    <span className='font-semibold'>{state.printQuantity} copies</span> •
                                    <span className='ml-1 font-bold'>
                                        RM{calculatePrice('strips', state.printQuantity)}
                                    </span>
                                </span>
                            </div>
                        </div>
                    ) : (
                        <h3 className='text-2xl font-bold text-center text-indigo-700 mb-5'>Photo Strips</h3>
                    )}
                    <div className='bg-white p-2 shadow-md mx-auto w-20 mb-5'>
                        <div className='flex flex-col space-y-2'>
                            {[1, 2, 3, 4].map(item => (
                                <div key={item} className='bg-gray-800 h-14'></div>
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
                    {state.printQuantity > 0 && state.photoMode === 'single' ? (
                        <div className='flex items-center justify-between mb-4'>
                            <h3 className='text-2xl font-bold text-pink-700' style={{ marginBottom: 0 }}>
                                Single Photo
                            </h3>
                            <div className='ml-3 px-3 py-1.5 bg-pink-100 rounded-lg inline-flex items-center'>
                                <span className='text-sm text-pink-800 whitespace-nowrap'>
                                    <span className='font-semibold'>{state.printQuantity} copies</span> •
                                    <span className='ml-1 font-bold'>
                                        RM{calculatePrice('single', state.printQuantity)}
                                    </span>
                                </span>
                            </div>
                        </div>
                    ) : (
                        <h3 className='text-2xl font-bold text-center text-pink-700 mb-5'>Single Photo</h3>
                    )}
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

            {/* Updated navigation buttons */}
            <div>
                <NavigationButtons
                    onBackClick={goBack}
                    onContinueClick={continueToCamera}
                    backText='Back'
                    continueText='Continue'
                />
            </div>

            {/* Print Quantity Popup - Updated to blur background instead of black overlay */}
            {showQuantityPopup && (
                <div className='fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50'>
                    <div className='bg-white bg-opacity-95 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white border-opacity-40 relative overflow-hidden animate-fade-in-up'>
                        {/* Decorative elements */}
                        <div className='absolute top-0 left-0 w-32 h-32 -mt-10 -ml-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-20 animate-pulse'></div>
                        <div className='absolute bottom-0 right-0 w-36 h-36 -mb-12 -mr-12 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-full opacity-20 animate-pulse'></div>
                        <div className='absolute top-16 right-10 w-24 h-24 rounded-full bg-gradient-to-r from-pink-300 to-purple-400 opacity-30 blur-xl'></div>

                        <h3 className='text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 mb-5 relative z-10'>
                            Select Print Quantity
                        </h3>

                        {/* Photo style preview with quantity indicator */}
                        <div className='flex justify-center items-center mb-5 relative z-10'>
                            <div className='relative'>
                                {mode === 'strips' ? (
                                    <div className='bg-white p-1 shadow-md mx-auto w-12 mb-2'>
                                        <div className='flex flex-col space-y-1'>
                                            {[1, 2, 3, 4].map(item => (
                                                <div key={item} className='bg-gray-800 h-8'></div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className='bg-white p-2 shadow-md mx-auto w-24 h-28 mb-2'>
                                        <div className='bg-gray-800 h-full w-full'></div>
                                    </div>
                                )}
                                <span className='absolute top-1/2 -right-8 transform -translate-y-1/2 text-lg font-bold text-gray-700'>
                                    x{selectedQuantity}
                                </span>
                            </div>
                        </div>

                        <p className='text-center text-gray-700 mb-6 relative z-10'>
                            How many copies of {mode === 'strips' ? 'photo strips' : 'single photos'} would you like to
                            print?
                        </p>

                        <div className='grid grid-cols-2 gap-4 mb-8 relative z-10'>
                            {[2, 4, 6, 8].map(quantity => (
                                <div
                                    key={quantity}
                                    onClick={() => handleQuantitySelect(quantity)}
                                    className={`p-6 rounded-xl text-center cursor-pointer transition-all transform hover:scale-105 ${
                                        selectedQuantity === quantity
                                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg'
                                            : 'bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-indigo-300 shadow-md'
                                    }`}
                                >
                                    <div className='text-4xl font-bold mb-2'>{quantity}</div>
                                    <div
                                        className={`text-sm ${
                                            selectedQuantity === quantity ? 'text-white' : 'text-gray-500'
                                        }`}
                                    >
                                        copies
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className='mb-8 p-5 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl shadow-inner relative z-10'>
                            <div className='text-center'>
                                <span className='ml-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600'>
                                    RM{calculateEstimatedPrice()}
                                </span>
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-4 relative z-10'>
                            <button
                                onClick={closePopup}
                                className='py-4 px-6 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2'
                            >
                                Back
                            </button>
                            <button
                                onClick={confirmQuantity}
                                className='py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2'
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
