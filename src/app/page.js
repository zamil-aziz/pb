'use client';
import { useEffect, useContext } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';
import CameraView from '../components/CameraView';
import BackgroundSelector from '../components/BackgroundSelector';
import CountdownTimer from '../components/CountdownTimer';
import PhotoPreview from '../components/PhotoPreview';
import PaymentProcessor from '../components/PaymentProcessor';
import PrintManager from '../components/PrintManager';

export default function Photobooth() {
    const { state, dispatch } = useContext(PhotoboothContext);

    // Prevent gestures that might navigate away from the app
    useEffect(() => {
        document.addEventListener(
            'touchmove',
            e => {
                if (e.scale !== 1) e.preventDefault();
            },
            { passive: false }
        );

        // Enter fullscreen if possible
        document.documentElement.requestFullscreen?.();

        // Prevent sleep/screen timeout
        const keepAwake = async () => {
            try {
                if (navigator.wakeLock) {
                    const wakeLock = await navigator.wakeLock.request('screen');
                    return wakeLock;
                }
            } catch (err) {
                console.log('Wake Lock error:', err);
            }
        };

        const wakeLockRelease = keepAwake();

        return () => {
            document.exitFullscreen?.();
            wakeLockRelease?.then(lock => lock?.release());
        };
    }, []);

    // Reset app after inactivity
    useEffect(() => {
        let inactivityTimer;

        const resetTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                if (state.currentView !== 'welcome') {
                    // Reset to welcome screen after 2 minutes of inactivity
                    dispatch({ type: 'RESET_APP' });
                }
            }, 120000); // 2 minutes
        };

        // Reset timer on any user interaction
        const events = ['touchstart', 'touchmove', 'touchend'];
        events.forEach(event => document.addEventListener(event, resetTimer));

        resetTimer();

        return () => {
            clearTimeout(inactivityTimer);
            events.forEach(event => document.removeEventListener(event, resetTimer));
        };
    }, [state.currentView, dispatch]);

    return (
        <div className='h-screen w-screen flex flex-col bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 overflow-hidden'>
            {/* Stylish header with animated background */}
            <div className='bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 p-6 text-white shadow-lg relative overflow-hidden'>
                <div className='absolute inset-0 opacity-20'>
                    <div className='absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.1),transparent_20%)]'></div>
                    <div className='absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_25%)]'></div>
                </div>
                <h1 className='text-5xl font-bold text-center tracking-wider relative z-10'>
                    Photo Booth
                    <span className='absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-yellow-300 rounded-full'></span>
                </h1>
            </div>

            <div className='flex-grow flex items-center justify-center p-4 relative'>
                {/* Background decorative elements */}
                <div className='absolute top-10 left-10 w-24 h-24 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 opacity-30 blur-xl'></div>
                <div className='absolute bottom-20 right-10 w-32 h-32 rounded-full bg-gradient-to-r from-blue-300 to-indigo-300 opacity-30 blur-xl'></div>
                <div className='absolute bottom-40 left-40 w-16 h-16 rounded-full bg-gradient-to-r from-yellow-300 to-orange-300 opacity-20 blur-lg'></div>

                {state.currentView === 'welcome' && (
                    <div className='text-center p-8 max-w-6xl mx-auto bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white border-opacity-40 relative overflow-hidden'>
                        <div className='absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-10'></div>
                        <div className='absolute bottom-0 left-0 w-40 h-40 -mb-16 -ml-16 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full opacity-10'></div>

                        <h2 className='text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600'>
                            Touch to Start!
                        </h2>
                        <p className='text-2xl mb-10 text-gray-700'>Capture memories with amazing backgrounds</p>

                        <div className='mb-10'>
                            <BackgroundSelector />
                        </div>

                        <button
                            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'camera' })}
                            className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-6 px-12 rounded-full text-3xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl'
                        >
                            Start
                            <span className='ml-2'>✨</span>
                        </button>
                    </div>
                )}

                {state.currentView === 'camera' && <CameraView />}
                {state.currentView === 'countdown' && <CountdownTimer />}
                {state.currentView === 'preview' && <PhotoPreview />}
                {state.currentView === 'payment' && <PaymentProcessor />}
                {state.currentView === 'printing' && <PrintManager />}
                {state.currentView === 'thankyou' && (
                    <div className='text-center p-8 max-w-2xl mx-auto bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white border-opacity-40 relative overflow-hidden'>
                        <div className='absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 bg-gradient-to-br from-green-400 to-teal-400 rounded-full opacity-10'></div>
                        <div className='absolute bottom-0 left-0 w-40 h-40 -mb-16 -ml-16 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full opacity-10'></div>

                        <h2 className='text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500'>
                            Thank You!
                        </h2>
                        <p className='text-2xl mb-8 text-gray-700'>Your photos are printing...</p>

                        <div className='mb-12 relative'>
                            <div className='absolute inset-0 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-20 blur-lg transform scale-110'></div>
                            <img
                                src='/images/printing.gif'
                                alt='Printing animation'
                                className='mx-auto w-48 h-48 object-contain relative z-10'
                            />
                        </div>

                        <p className='text-xl mb-12 text-gray-600'>Enjoy your photos!</p>

                        <button
                            onClick={() => dispatch({ type: 'RESET_APP' })}
                            className='bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-4 px-8 rounded-full text-2xl shadow-lg transform transition-all duration-300 hover:scale-105'
                        >
                            Start New Session
                        </button>
                    </div>
                )}
            </div>

            {/* Decorative footer */}
            <div className='h-2 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500'></div>
        </div>
    );
}
