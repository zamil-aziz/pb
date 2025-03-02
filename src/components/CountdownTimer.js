import { useState, useEffect, useRef, useContext } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';
import { capturePhoto } from '../lib/cameraUtils';

export default function CountdownTimer() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [countdown, setCountdown] = useState(3);
    const [photosTaken, setPhotosTaken] = useState(0);
    const [message, setMessage] = useState('Get Ready!');
    const [showCountdown, setShowCountdown] = useState(true);
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
                dispatch({ type: 'ADD_PHOTO', payload: photo });

                // First hide the countdown
                setShowCountdown(false);

                // Then wait before starting the next photo sequence
                setTimeout(() => {
                    setPhotosTaken(prev => {
                        const newCount = prev + 1;

                        if (newCount >= state.photosPerSession) {
                            dispatch({ type: 'SET_VIEW', payload: 'preview' });
                            return 0;
                        } else {
                            setMessage(`Great! ${state.photosPerSession - newCount} more to go`);
                            setCountdown(3);
                            setMessage('Get Ready!');
                            setShowCountdown(true);
                            return newCount;
                        }
                    });
                }, 1000); // Show blank/no countdown for 1 second
            }, 500);
        }
    }, [countdown, photosTaken, state.photosPerSession, dispatch]);

    // Function to determine countdown color
    const getCountdownColor = () => {
        switch (countdown) {
            case 3:
                return 'text-yellow-400';
            case 2:
                return 'text-orange-400';
            case 1:
                return 'text-red-500';
            default:
                return 'text-white';
        }
    };

    // Function to get message background color
    const getMessageBgColor = () => {
        if (message === 'Smile!') {
            return 'bg-green-600 bg-opacity-80';
        }
        return 'bg-black bg-opacity-60';
    };

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

                {showCountdown && (
                    <div className='absolute z-20 inset-0 flex flex-col items-center justify-center'>
                        <div
                            className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-full w-48 h-48 flex items-center justify-center shadow-2xl border-4 ${
                                countdown > 0 ? `border-${getCountdownColor().replace('text-', '')}` : 'border-white'
                            } transform ${
                                countdown > 0 ? 'scale-100 animate-pulse' : 'scale-110'
                            } transition-all duration-300`}
                        >
                            <span className={`text-9xl font-bold ${getCountdownColor()} drop-shadow-lg`}>
                                {countdown > 0 ? countdown : '📸'}
                            </span>
                        </div>

                        <div
                            className={`mt-8 ${getMessageBgColor()} px-10 py-5 rounded-xl shadow-xl transform transition-all duration-300 ${
                                message === 'Smile!' ? 'scale-110' : 'scale-100'
                            }`}
                        >
                            <p className='text-3xl font-bold text-white drop-shadow-md'>{message}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className='p-4 text-center bg-gradient-to-r from-purple-100 to-blue-100'>
                <p className='text-2xl font-semibold text-gray-700'>
                    Photo <span className='text-purple-600'>{photosTaken + 1}</span> of{' '}
                    <span className='text-blue-600'>{state.photosPerSession}</span>
                </p>
            </div>
        </div>
    );
}
