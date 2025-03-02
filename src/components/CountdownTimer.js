import { useState, useEffect, useRef, useContext } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';
import { capturePhoto } from '../lib/cameraUtils';

export default function CountdownTimer() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [countdown, setCountdown] = useState(3);
    const [photosTaken, setPhotosTaken] = useState(0);
    const [message, setMessage] = useState('Get Ready!');
    const { state, dispatch } = useContext(PhotoboothContext);

    // Initialize camera
    useEffect(() => {
        if (videoRef.current) {
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
                    console.error('Camera error:', err);
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
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Handle countdown and photo capture
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            // Take photo
            setMessage('Smile!');

            setTimeout(() => {
                const photo = capturePhoto(videoRef.current, canvasRef.current, state.selectedBackground);
                const newPhotos = [...state.photos, photo];
                dispatch({ type: 'ADD_PHOTO', payload: photo });

                setPhotosTaken(prev => {
                    const newCount = prev + 1;

                    if (newCount >= state.photosPerSession) {
                        dispatch({ type: 'SET_VIEW', payload: 'preview' });
                        return 0;
                    } else {
                        setMessage(`Great! ${state.photosPerSession - newCount} more to go`);
                        setCountdown(3); // Reset countdown immediately
                        setMessage('Get Ready!');
                        return newCount;
                    }
                });
            }, 400);
        }
    }, [countdown, photosTaken, state.photosPerSession, dispatch]);

    return (
        <div className='w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden'>
            <canvas ref={canvasRef} className='hidden'></canvas>

            <div className='relative'>
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

                <div className='absolute z-20 inset-0 flex flex-col items-center justify-center'>
                    <div className='bg-black bg-opacity-60 rounded-full w-40 h-40 flex items-center justify-center'>
                        <span className='text-9xl font-bold text-white'>{countdown > 0 ? countdown : '📸'}</span>
                    </div>

                    <div className='mt-6 bg-black bg-opacity-60 px-8 py-4 rounded-xl'>
                        <p className='text-3xl font-bold text-white'>{message}</p>
                    </div>
                </div>
            </div>

            <div className='p-4 text-center'>
                <p className='text-2xl text-gray-400'>
                    Photo {photosTaken + 1} of {state.photosPerSession}
                </p>
            </div>
        </div>
    );
}
