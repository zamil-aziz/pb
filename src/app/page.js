'use client';
import { useEffect, useContext } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';
import PhotoModeSelector from '@/components/PhotoModeSelector';
import CameraPreview from '../components/camera-preview/CameraPreview';
import CountdownTimer from '../components/CountdownTimer';
import PhotoPreview from '../components/PhotoPreview';
import CustomizeSection from '../components/customize-section/CustomizeSection';
import PaymentProcessor from '../components/PaymentProcessor';
import PrintManager from '../components/PrintManager';
import ThankYou from '../components/ThankYou';
import { Camera, Image, PartyPopper } from 'lucide-react';

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
                    dispatch({ type: 'RESET_APP' });
                }
                // }, 30000); // 30 seconds
            }, 3000000);
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

    // Animated background elements
    const BackgroundElements = () => (
        <>
            {/* Animated floating circles */}
            <div className='absolute inset-0 overflow-hidden pointer-events-none'>
                <div className='absolute top-10 left-5 w-20 h-20 rounded-full bg-pink-400 opacity-20 animate-float-slow'></div>
                <div className='absolute top-3/4 right-10 w-32 h-32 rounded-full bg-purple-400 opacity-15 animate-float-medium'></div>
                <div className='absolute top-1/3 left-3/4 w-16 h-16 rounded-full bg-indigo-400 opacity-20 animate-float-fast'></div>
                <div className='absolute bottom-10 left-1/4 w-24 h-24 rounded-full bg-blue-400 opacity-15 animate-float-medium'></div>
                <div className='absolute top-1/2 left-10 w-12 h-12 rounded-full bg-yellow-400 opacity-10 animate-float-fast'></div>
            </div>

            {/* Light rays */}
            <div className='absolute inset-0 opacity-30 overflow-hidden'>
                <div className='absolute top-0 left-1/4 w-full h-full bg-gradient-radial from-purple-300 to-transparent opacity-30 blur-xl'></div>
                <div className='absolute bottom-0 right-1/4 w-full h-full bg-gradient-radial from-pink-300 to-transparent opacity-30 blur-xl'></div>
            </div>

            {/* Pattern overlay - using CSS gradients instead of SVG patterns */}
            <div className='absolute inset-0 opacity-5'>
                <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10'></div>
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.3),transparent_10%)]'></div>
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.3),transparent_10%)]'></div>
            </div>
        </>
    );

    return (
        <div className='min-h-screen w-full flex flex-col bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 overflow-hidden'>
            {/* Enhanced header with animated glow */}
            <header className='bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 p-3 md:p-5 text-white shadow-xl relative overflow-hidden flex-shrink-0'>
                <div className='absolute inset-0'>
                    <div className='absolute top-0 left-0 w-full h-full opacity-10'>
                        <div className='absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,white,transparent_5%)]'></div>
                        <div className='absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,white,transparent_5%)]'></div>
                    </div>
                    <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent_30%)] animate-pulse-slow'></div>
                    <div className='absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.2),transparent_30%)] animate-pulse-slow delay-1000'></div>
                </div>

                <div className='relative z-10 flex items-center justify-center'>
                    <Image className='h-8 w-8 mr-3 text-yellow-300' />
                    <h1 className='text-3xl md:text-4xl font-bold text-center tracking-wider group'>
                        Photo Booth
                        <span className='absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-yellow-300 rounded-full group-hover:animate-pulse'></span>
                    </h1>
                </div>
            </header>

            {/* Content area with enhanced visual elements */}
            <main className='flex-grow flex items-center justify-center p-4 relative overflow-hidden'>
                <BackgroundElements />
                {state.currentView === 'welcome' && (
                    <div className='text-center p-6 md:p-10 w-full max-w-4xl mx-auto bg-white bg-opacity-80 backdrop-blur-md rounded-3xl shadow-2xl border border-white border-opacity-60 relative overflow-hidden transform transition-all duration-500 hover:scale-102 hover:shadow-2xl'>
                        {/* Decorative top corner accents */}
                        <div className='absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-20'></div>
                        <div className='absolute -bottom-20 -left-20 w-56 h-56 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full opacity-20'></div>

                        {/* Shimmer effect overlay */}
                        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -translate-x-full animate-shimmer'></div>

                        {/* Header with icon */}
                        <div className='flex flex-col items-center mb-0'>
                            <div className='mb-4 p-5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg'>
                                <Camera size={40} className='text-white' />
                            </div>
                            <h2 className='text-5xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 animate-gradient'>
                                Touch to Start!
                            </h2>
                        </div>

                        <p className='text-2xl md:text-xl mb-8 text-gray-800 max-w-lg mx-auto'>
                            Capture unforgettable memories with our photo booth. Choose your props, strike a pose, and
                            take home a print to remember the moment.
                        </p>

                        {/* Features grid */}
                        <div className='grid grid-cols-3 gap-4 mb-8'>
                            <div className='p-3 bg-indigo-50 rounded-xl'>
                                <div className='bg-indigo-100 p-2 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2'>
                                    <Image size={24} className='text-indigo-600' />
                                </div>
                                <p className='text-indigo-800 font-semibold'>Amazing Filters</p>
                            </div>
                            <div className='p-3 bg-purple-50 rounded-xl'>
                                <div className='bg-purple-100 p-2 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2'>
                                    <PartyPopper size={24} className='text-purple-600' />
                                </div>
                                <p className='text-purple-800 font-semibold'>Fun Props</p>
                            </div>
                            <div className='p-3 bg-pink-50 rounded-xl'>
                                <div className='bg-pink-100 p-2 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2'>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='24'
                                        height='24'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        className='text-pink-600'
                                    >
                                        <rect x='6' y='3' width='12' height='18' rx='2' />
                                        <line x1='12' y1='7' x2='12' y2='7' />
                                    </svg>
                                </div>
                                <p className='text-pink-800 font-semibold'>Instant Prints</p>
                            </div>
                        </div>

                        <button
                            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'photoMode' })}
                            className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-5 px-10 rounded-full text-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300 relative overflow-hidden group'
                        >
                            <span className='relative z-10 flex items-center justify-center gap-2'>
                                Start Now
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='24'
                                    height='24'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    className='ml-2 group-hover:translate-x-1 transition-transform'
                                >
                                    <path d='M5 12h14'></path>
                                    <path d='m12 5 7 7-7 7'></path>
                                </svg>
                            </span>
                            {/* Button glow effect */}
                            <span className='absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-30 blur-md transition-opacity'></span>
                        </button>
                    </div>
                )}
                {state.currentView === 'photoMode' && <PhotoModeSelector />}{' '}
                {state.currentView === 'camera' && <CameraPreview />}
                {state.currentView === 'countdown' && <CountdownTimer />}
                {state.currentView === 'preview' && <PhotoPreview />}
                {state.currentView === 'frame' && <CustomizeSection />}
                {state.currentView === 'payment' && <PaymentProcessor />}
                {state.currentView === 'printing' && <PrintManager />}
                {state.currentView === 'thankyou' && <ThankYou />}
            </main>

            {/* Enhanced footer with shine effect */}
            <footer className='h-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 relative overflow-hidden flex-shrink-0'>
                <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 -translate-x-full animate-shine'></div>
            </footer>
        </div>
    );
}
