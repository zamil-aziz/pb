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
        <div className='p-10 pt-6 max-w-4xl mx-auto bg-white bg-opacity-95 backdrop-blur-md rounded-3xl shadow-2xl border border-white border-opacity-40 relative overflow-hidden'>
            {/* Enhanced decorative elements */}
            <div className='absolute top-0 right-0 w-40 h-40 -mt-12 -mr-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-20 animate-pulse'></div>
            <div className='absolute bottom-0 left-0 w-48 h-48 -mb-16 -ml-16 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-full opacity-20 animate-pulse'></div>
            <div className='absolute top-10 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-pink-300 to-purple-400 opacity-30 blur-xl'></div>
            <div className='absolute bottom-20 right-10 w-40 h-40 rounded-full bg-gradient-to-r from-blue-300 to-indigo-400 opacity-30 blur-xl'></div>

            <h2 className='text-4xl font-extrabold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 tracking-tight leading-tight'>
                Complete Your Payment
            </h2>

            <p className='text-center text-gray-700 text-lg mb-4 max-w-2xl mx-auto leading-relaxed'>
                Choose your preferred payment method to continue
            </p>

            {/* Vertical layout container with improved styling */}
            <div className='flex flex-col gap-6 mb-8 items-center'>
                {/* Total price display with enhanced styling */}
                <div className='w-full max-w-lg bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-lg overflow-hidden border border-white border-opacity-60 transform transition-all duration-300 hover:shadow-xl'>
                    <div className='p-4 bg-gradient-to-r from-indigo-600 to-purple-600'>
                        <div className='flex items-center text-white'>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                className='h-6 w-6 mr-3'
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
                            <h3 className='text-lg font-semibold'>Total Amount</h3>
                        </div>
                    </div>
                    <div className='p-6 flex justify-center items-center'>
                        <p className='text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600'>
                            RM {state.price.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* QR Code section with enhanced styling */}
                <div className='w-full max-w-lg bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-xl'>
                    <div className='p-4 bg-gradient-to-r from-blue-500 to-indigo-500'>
                        <div className='flex items-center text-white'>
                            <QrCode size={20} className='mr-3' />
                            <h3 className='text-lg font-semibold'>Scan to Pay</h3>
                        </div>
                    </div>
                    <div className='p-8 flex flex-col items-center'>
                        <div className='w-64 h-64 mb-4 bg-white p-4 rounded-lg shadow-inner border border-gray-100 flex items-center justify-center'>
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
                        <p className='text-gray-600 text-center'>Scan this QR code with your banking app or e-wallet</p>
                    </div>
                </div>

                {/* Payment buttons with enhanced styling */}
                <div className='w-full max-w-lg grid grid-cols-2 gap-4'>
                    <button
                        onClick={() => handlePayment('card')}
                        disabled={isProcessing}
                        className='bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
                    >
                        <div className='flex items-center justify-center'>
                            <CreditCard size={20} className='mr-3' />
                            <span>Card Payment</span>
                        </div>
                    </button>

                    <button
                        onClick={() => handlePayment('cash')}
                        disabled={isProcessing}
                        className='bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2'
                    >
                        <div className='flex items-center justify-center'>
                            <Wallet size={20} className='mr-3' />
                            <span>Cash Payment</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Error display with enhanced styling */}
            {error && (
                <div className='my-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl text-center shadow-md'>
                    <p className='flex items-center justify-center'>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-5 w-5 mr-2'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                        >
                            <path
                                fillRule='evenodd'
                                d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                                clipRule='evenodd'
                            />
                        </svg>
                        {error}
                    </p>
                </div>
            )}

            {/* Loading indicator */}
            {isProcessing && (
                <div className='my-6 flex justify-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500'></div>
                </div>
            )}

            {/* Back Button with enhanced styling */}
            <div className='mt-6'>
                <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'stickers' })}
                    disabled={isProcessing}
                    className='w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 flex items-center justify-center'
                >
                    <ArrowLeft size={20} className='mr-3' />
                    Back to Stickers
                </button>
            </div>
        </div>
    );
}
