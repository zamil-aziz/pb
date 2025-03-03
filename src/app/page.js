'use client';
import { useEffect, useContext } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';
import CameraView from '../components/CameraView';
import CountdownTimer from '../components/CountdownTimer';
import PhotoPreview from '../components/PhotoPreview';
import PaymentProcessor from '../components/PaymentProcessor';
import PrintManager from '../components/PrintManager';
import ThankYou from '../components/ThankYou';

export default function Photobooth() {
    const { state, dispatch } = useContext(PhotoboothContext);

    // Prevent gestures that might navigate away from the app
    useEffect(() => {
        const handleTouchMove = e => {
            if (e.scale !== 1) e.preventDefault();
        };

        document.addEventListener('touchmove', handleTouchMove, { passive: false });

        // Enter fullscreen if possible
        const enterFullscreen = () => {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.log('Fullscreen error:', err);
                });
            }
        };

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
            return null;
        };

        // Only request fullscreen when triggered by a user interaction
        const firstInteractionHandler = () => {
            enterFullscreen();
            document.removeEventListener('click', firstInteractionHandler);
            document.removeEventListener('touchstart', firstInteractionHandler);
        };

        document.addEventListener('click', firstInteractionHandler);
        document.addEventListener('touchstart', firstInteractionHandler);

        const wakeLockPromise = keepAwake();
        let wakeLockRelease;

        wakeLockPromise.then(lock => {
            wakeLockRelease = lock;
        });

        return () => {
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('click', firstInteractionHandler);
            document.removeEventListener('touchstart', firstInteractionHandler);

            if (document.exitFullscreen && document.fullscreenElement) {
                document.exitFullscreen().catch(err => {
                    console.log('Exit fullscreen error:', err);
                });
            }

            if (wakeLockRelease) {
                wakeLockRelease.release().catch(err => {
                    console.log('Wake lock release error:', err);
                });
            }
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
        const events = ['touchstart', 'touchmove', 'touchend', 'click', 'mousemove', 'keydown'];
        events.forEach(event => document.addEventListener(event, resetTimer, { passive: true }));

        resetTimer();

        return () => {
            clearTimeout(inactivityTimer);
            events.forEach(event => document.removeEventListener(event, resetTimer));
        };
    }, [state.currentView, dispatch]);

    return (
        <div className='min-h-screen w-full flex flex-col bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 overflow-hidden'>
            {/* Responsive header */}
            <header className='bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 p-2 sm:p-3 md:p-4 text-white shadow-lg relative overflow-hidden flex-shrink-0'>
                <div className='absolute inset-0 opacity-20'>
                    <div className='absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.1),transparent_20%)]'></div>
                    <div className='absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_25%)]'></div>
                </div>
                <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-center tracking-wider relative z-10'>
                    Photo Booth
                    <span className='absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 sm:w-20 md:w-24 h-1 bg-yellow-300 rounded-full'></span>
                </h1>
            </header>

            {/* Content area with proper scrolling */}
            <main className='flex-grow flex items-center justify-center p-2 sm:p-3 md:p-4 relative overflow-y-auto'>
                {/* Background decorative elements - adjust visibility based on screen size */}
                <div className='absolute top-10 left-10 w-12 sm:w-16 md:w-24 h-12 sm:h-16 md:h-24 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 opacity-30 blur-xl hidden sm:block'></div>
                <div className='absolute bottom-20 right-10 w-16 sm:w-24 md:w-32 h-16 sm:h-24 md:h-32 rounded-full bg-gradient-to-r from-blue-300 to-indigo-300 opacity-30 blur-xl hidden sm:block'></div>
                <div className='absolute bottom-40 left-40 w-8 sm:w-12 md:w-16 h-8 sm:h-12 md:h-16 rounded-full bg-gradient-to-r from-yellow-300 to-orange-300 opacity-20 blur-lg hidden md:block'></div>

                {state.currentView === 'welcome' && (
                    <div className='text-center p-4 sm:p-6 md:p-8 w-full max-w-4xl mx-auto bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-white border-opacity-40 relative overflow-hidden'>
                        <div className='absolute top-0 right-0 w-16 sm:w-24 md:w-32 h-16 sm:h-24 md:h-32 -mt-5 sm:-mt-8 md:-mt-10 -mr-5 sm:-mr-8 md:-mr-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-10'></div>
                        <div className='absolute bottom-0 left-0 w-20 sm:w-32 md:w-40 h-20 sm:h-32 md:h-40 -mb-8 sm:-mb-12 md:-mb-16 -ml-8 sm:-ml-12 md:-ml-16 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full opacity-10'></div>

                        <h2 className='text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 md:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600'>
                            Touch to Start!
                        </h2>
                        <p className='text-xl sm:text-2xl md:text-3xl mb-6 sm:mb-8 md:mb-10 text-gray-700'>
                            Capture memories with amazing backgrounds
                        </p>

                        <button
                            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'camera' })}
                            className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 sm:py-4 md:py-6 px-6 sm:px-8 md:px-12 rounded-full text-xl sm:text-2xl md:text-3xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50'
                        >
                            Start
                        </button>
                    </div>
                )}

                {state.currentView === 'camera' && <CameraView />}
                {state.currentView === 'countdown' && <CountdownTimer />}
                {state.currentView === 'preview' && <PhotoPreview />}
                {state.currentView === 'payment' && <PaymentProcessor />}
                {state.currentView === 'printing' && <PrintManager />}
                {state.currentView === 'thankyou' && <ThankYou />}
            </main>

            {/* Decorative footer */}
            <footer className='h-1 sm:h-1.5 md:h-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 flex-shrink-0'></footer>
        </div>
    );
}
