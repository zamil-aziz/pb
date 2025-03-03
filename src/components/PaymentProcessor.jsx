'use client';

import { useState, useContext } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';
import { processPayment } from '../lib/paymentUtils';

export default function PaymentProcessor() {
    const { state, dispatch } = useContext(PhotoboothContext);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handlePayment = async method => {
        setIsProcessing(true);
        setError(null);

        try {
            await processPayment({
                amount: state.price,
                method,
                description: `Photobooth - ${state.photos.length} photos`,
            });

            // Proceed to printing
            dispatch({ type: 'SET_VIEW', payload: 'printing' });
        } catch (err) {
            setError(`Payment failed: ${err.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className='p-8 max-w-4xl mx-auto bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white border-opacity-40 relative overflow-hidden'>
            {/* Decorative elements - matching CameraView */}
            <div className='absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-10'></div>
            <div className='absolute bottom-0 left-0 w-40 h-40 -mb-16 -ml-16 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full opacity-10'></div>
            <div className='absolute top-10 left-10 w-24 h-24 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 opacity-30 blur-xl'></div>
            <div className='absolute bottom-20 right-10 w-32 h-32 rounded-full bg-gradient-to-r from-blue-300 to-indigo-300 opacity-30 blur-xl'></div>

            <h2 className='text-4xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600'>
                Payment
            </h2>

            <div className='relative mx-auto overflow-hidden rounded-xl shadow-lg mb-8 p-6 bg-white bg-opacity-70'>
                <p className='text-2xl font-bold text-gray-800 text-center'>Total: RM {state.price.toFixed(2)}</p>

                {error && (
                    <div className='mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center'>
                        {error}
                    </div>
                )}
            </div>

            <div className='grid grid-cols-1 gap-6 mb-6'>
                <button
                    onClick={() => handlePayment('card')}
                    disabled={isProcessing}
                    className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-6 px-8 rounded-xl text-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center'
                >
                    {isProcessing ? 'Processing...' : 'Pay with Card'}
                </button>

                <button
                    onClick={() => handlePayment('cash')}
                    disabled={isProcessing}
                    className='bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-6 px-8 rounded-xl text-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center'
                >
                    {isProcessing ? 'Processing...' : 'Pay with Cash'}
                </button>

                <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'preview' })}
                    disabled={isProcessing}
                    className='bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-6 px-8 rounded-xl text-2xl shadow-lg transform transition-all duration-300 hover:scale-105'
                >
                    Go Back
                </button>
            </div>

            <div className='text-center'>
                <p className='text-lg text-gray-500'>Choose your preferred payment method</p>
            </div>
        </div>
    );
}
