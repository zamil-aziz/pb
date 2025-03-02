'use client';
import { useState, useEffect, useContext } from 'react';
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
        <div className='h-screen w-screen flex flex-col bg-gradient-to-b from-blue-50 to-purple-50 overflow-hidden'>
            {/* Large touchable elements for iPad */}
            <div className='bg-gradient-to-r from-purple-600 to-blue-500 p-6 text-white shadow-lg'>
                <h1 className='text-4xl font-bold text-center'>Photo Booth</h1>
            </div>

            <div className='flex-grow flex items-center justify-center p-4'>
                {state.currentView === 'welcome' && (
                    <div className='text-center p-4 max-w-3xl mx-auto bg-white rounded-2xl shadow-xl'>
                        <h2 className='text-5xl font-bold mb-8'>Touch to Start!</h2>
                        <p className='text-2xl mb-8'>Take fun photos with custom backgrounds</p>

                        <BackgroundSelector />

                        <button
                            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'camera' })}
                            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-6 px-12 rounded-full text-3xl shadow-lg'
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
                {state.currentView === 'thankyou' && (
                    <div className='text-center p-8 max-w-2xl mx-auto bg-white rounded-2xl shadow-xl'>
                        <h2 className='text-5xl font-bold mb-8'>Thank You!</h2>
                        <p className='text-2xl mb-8'>Your photos are printing...</p>

                        <div className='mb-12'>
                            <img
                                src='/images/printing.gif'
                                alt='Printing animation'
                                className='mx-auto w-48 h-48 object-contain'
                            />
                        </div>

                        <p className='text-xl mb-12'>Enjoy your photos!</p>

                        <button
                            onClick={() => dispatch({ type: 'RESET_APP' })}
                            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full text-2xl'
                        >
                            Start New Session
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
