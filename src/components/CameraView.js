'use client';
import { useRef, useEffect, useContext } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';

export default function CameraView() {
    const videoRef = useRef(null);
    const { state, dispatch } = useContext(PhotoboothContext);

    // Initialize camera
    useEffect(() => {
        if (videoRef.current) {
            // For iPad, use the environment-facing camera by default (rear camera)
            navigator.mediaDevices
                .getUserMedia({
                    video: {
                        facingMode: 'environment',
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    },
                })
                .then(stream => {
                    videoRef.current.srcObject = stream;
                })
                .catch(err => {
                    console.error('Error accessing camera:', err);
                    // Fallback to any available camera
                    navigator.mediaDevices
                        .getUserMedia({ video: true })
                        .then(stream => {
                            videoRef.current.srcObject = stream;
                        })
                        .catch(fallbackErr => {
                            console.error('Fallback camera also failed:', fallbackErr);
                        });
                });
        }

        return () => {
            // Clean up camera stream
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className='w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden'>
            <h2 className='text-2xl font-bold p-4 text-gray-400 text-center'>Ready to Take Your Photos</h2>

            <div className='relative mx-auto overflow-hidden rounded-lg'>
                {state.selectedBackground && (
                    <div className='absolute inset-0 z-0'>
                        <img
                            src={state.selectedBackground.url}
                            alt='Background'
                            className='object-cover w-full h-full'
                        />
                    </div>
                )}

                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className='w-full h-auto z-10 relative'
                    style={{
                        mixBlendMode: state.selectedBackground ? 'screen' : 'normal',
                        opacity: state.selectedBackground ? 0.9 : 1,
                    }}
                />
            </div>

            <div className='grid grid-cols-2 gap-4 p-6'>
                <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'countdown' })}
                    className='text-2xl bg-green-500 hover:bg-green-600 text-white font-bold py-6 px-8 rounded-xl shadow-lg'
                >
                    Take Photos
                </button>

                <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'welcome' })}
                    className='text-2xl bg-gray-500 hover:bg-gray-600 text-white font-bold py-6 px-8 rounded-xl shadow-lg'
                >
                    Go Back
                </button>
            </div>

            <div className='text-center p-4 text-gray-400'>
                <p className='text-lg'>{state.photosPerSession} photos will be taken. Get ready to pose!</p>
            </div>
        </div>
    );
}
