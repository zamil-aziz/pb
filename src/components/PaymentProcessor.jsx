'use client';

import { useState, useContext } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';
import { processPayment } from '../lib/paymentUtils';
import { CreditCard, Wallet, QrCode, ArrowLeft } from 'lucide-react';

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
            {/* Decorative elements - matching previous pages */}
            <div className='absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-10'></div>
            <div className='absolute bottom-0 left-0 w-40 h-40 -mb-16 -ml-16 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full opacity-10'></div>
            <div className='absolute top-10 left-10 w-24 h-24 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 opacity-30 blur-xl'></div>
            <div className='absolute bottom-20 right-10 w-32 h-32 rounded-full bg-gradient-to-r from-blue-300 to-indigo-300 opacity-30 blur-xl'></div>

            <h2 className='text-3xl font-bold mb-4 text-center text-purple-600'>Payment</h2>

            {/* Vertical layout container */}
            <div className='flex flex-col gap-4 mb-6 items-center'>
                {/* Total price display - Now above QR code */}
                <div className='w-full max-w-lg bg-white rounded-xl shadow-sm overflow-hidden mb-2'>
                    <div className='p-3 bg-indigo-500'>
                        <div className='flex items-center text-white'>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                className='h-5 w-5 mr-2'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                />
                            </svg>
                            <h3 className='text-base font-medium'>Total</h3>
                        </div>
                    </div>
                    <div className='p-4 flex justify-center items-center'>
                        <p className='text-xl font-bold text-gray-800'>RM {state.price.toFixed(2)}</p>
                    </div>
                </div>

                {/* QR Code section */}
                <div className='w-full max-w-lg bg-white rounded-xl shadow-sm overflow-hidden'>
                    <div className='flex flex-col items-center'>
                        <div className='w-110 h-110 flex flex-col items-center justify-center'>
                            <img
                                src='/qr.png'
                                alt='Payment QR Code'
                                className='w-full h-full object-contain'
                                onError={e => {
                                    e.target.outerHTML = `<div class='flex flex-col items-center justify-center w-full h-full'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500 mb-2"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
                                        <p class='text-sm text-gray-500'>QR Code</p>
                                    </div>`;
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Payment buttons - Now below QR code and side by side */}
                <div className='w-full max-w-lg flex flex-row gap-3'>
                    <button
                        onClick={() => handlePayment('card')}
                        disabled={isProcessing}
                        className='flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 rounded-lg shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50'
                    >
                        <div className='p-3'>
                            <div className='flex items-center justify-center text-white'>
                                <CreditCard size={18} className='mr-2' />
                                <h3 className='text-base font-medium'>Pay with Card</h3>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => handlePayment('cash')}
                        disabled={isProcessing}
                        className='flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 rounded-lg shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50'
                    >
                        <div className='p-3'>
                            <div className='flex items-center justify-center text-white'>
                                <Wallet size={18} className='mr-2' />
                                <h3 className='text-base font-medium'>Pay with Cash</h3>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Error display */}
            {error && (
                <div className='mt-2 mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center'>
                    {error}
                </div>
            )}

            {/* Back Button - Styled like FrameSelector */}
            <div className='mt-6'>
                <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'frame' })}
                    disabled={isProcessing}
                    className='w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg transform transition-all duration-300 hover:scale-105 flex items-center justify-center'
                >
                    <ArrowLeft size={18} className='mr-2' />
                    Back to Frame Selection
                </button>
            </div>
        </div>
    );
}
