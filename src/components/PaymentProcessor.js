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
        <div className='w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden'>
            <h2 className='text-3xl font-bold p-4 text-center'>Payment</h2>

            <div className='p-6 text-center'>
                <p className='text-2xl mb-6'>Total: ${state.price.toFixed(2)}</p>
            </div>

            {error && (
                <div className='mx-6 mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg'>{error}</div>
            )}

            <div className='grid grid-cols-1 gap-6 p-6'>
                <button
                    onClick={() => handlePayment('card')}
                    disabled={isProcessing}
                    className='text-2xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-8 px-8 rounded-xl shadow-lg flex items-center justify-center'
                >
                    {isProcessing ? 'Processing...' : 'Pay with Card'}
                </button>

                <button
                    onClick={() => handlePayment('cash')}
                    disabled={isProcessing}
                    className='text-2xl bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-8 px-8 rounded-xl shadow-lg flex items-center justify-center'
                >
                    {isProcessing ? 'Processing...' : 'Pay with Cash'}
                </button>

                <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'preview' })}
                    disabled={isProcessing}
                    className='text-xl bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-xl shadow-lg'
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
