'use client';
import { useRef, useEffect, useContext, useState } from 'react';
import { PhotoboothContext } from '../../contexts/PhotoboothContext';
import { useCamera } from '../../hooks/useCamera';
import { useSegmentation } from '../../hooks/useSegmentation';
import { useFaceMesh } from '../../hooks/useFaceMesh';
import { Camera } from './Camera';
import { BackgroundsPanel } from './BackgroundPanels';
import { AccessoriesPanel } from './AccessoriesPanel';
import { ControlButtons } from './ControlButtons';
import { Footer } from './Footer';
import { ImageIcon, Sparkles } from 'lucide-react';

export default function CameraPreview() {
    const canvasRef = useRef(null);
    const { state, dispatch } = useContext(PhotoboothContext);
    const [activeTab, setActiveTab] = useState('backgrounds');
    const [faceLandmarks, setFaceLandmarks] = useState(null);

    // Use our custom hooks
    const { videoRef, isLoading, error, initializeCamera } = useCamera();
    const {
        modelLoaded,
        error: segmentationError,
        startSegmentation,
    } = useSegmentation(videoRef, state.selectedBackground);
    const { faceLoaded, error: faceError, startFaceDetection } = useFaceMesh(videoRef);

    // Initialize camera on component mount
    useEffect(() => {
        initializeCamera('user'); // Prefer front camera
    }, []);

    // Start segmentation when canvas and video are ready
    useEffect(() => {
        if (videoRef.current && canvasRef.current && state.selectedBackground) {
            const stopSegmentation = startSegmentation(canvasRef.current);
            return stopSegmentation;
        }
    }, [videoRef.current, canvasRef.current, state.selectedBackground, startSegmentation]);

    // Start face detection when needed for accessories
    useEffect(() => {
        if (videoRef.current && canvasRef.current && state.selectedAccessory && faceLoaded) {
            const stopFaceDetection = startFaceDetection(landmarks => {
                setFaceLandmarks(landmarks);
            });
            return stopFaceDetection;
        }
    }, [videoRef.current, canvasRef.current, state.selectedAccessory, faceLoaded, startFaceDetection]);

    // Render video to canvas when no segmentation is used but we need canvas for accessories
    useEffect(() => {
        // Only run this effect if we're not doing segmentation but have accessories
        if (!state.selectedBackground && state.selectedAccessory && videoRef.current && canvasRef.current) {
            const renderVideoToCanvas = () => {
                if (!videoRef.current || !canvasRef.current) return;

                if (videoRef.current.readyState < 2) return;

                const width = videoRef.current.videoWidth;
                const height = videoRef.current.videoHeight;

                if (width === 0 || height === 0) return;

                // Set canvas dimensions if needed
                if (canvasRef.current.width !== width || canvasRef.current.height !== height) {
                    canvasRef.current.width = width;
                    canvasRef.current.height = height;
                }

                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    ctx.drawImage(videoRef.current, 0, 0, width, height);
                }
            };

            const interval = setInterval(renderVideoToCanvas, 33); // ~30fps
            return () => clearInterval(interval);
        }
    }, [state.selectedBackground, state.selectedAccessory, videoRef.current, canvasRef.current]);

    return (
        <div className='p-4 max-w-full w-full sm:max-w-2xl md:max-w-4xl mx-auto bg-white bg-opacity-90 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl sm:shadow-2xl border border-white border-opacity-40 relative h-full flex flex-col overflow-hidden'>
            {/* Decorative elements */}
            <div className='absolute top-0 right-0 w-16 sm:w-24 md:w-32 h-16 sm:h-24 md:h-32 -mt-5 sm:-mt-8 md:-mt-10 -mr-5 sm:-mr-8 md:-mr-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-10 hidden sm:block'></div>
            <div className='absolute bottom-0 left-0 w-20 sm:w-32 md:w-40 h-20 sm:h-32 md:h-40 -mb-8 sm:-mb-12 md:-mb-16 -ml-8 sm:-ml-12 md:-ml-16 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full opacity-10 hidden sm:block'></div>

            <Camera
                videoRef={videoRef}
                canvasRef={canvasRef}
                isLoading={isLoading}
                state={state}
                modelLoaded={modelLoaded}
                faceLoaded={faceLoaded}
                faceLandmarks={faceLandmarks}
                error={error || segmentationError || faceError}
            />

            <div
                className='mb-3 sm:mb-4 bg-white bg-opacity-80 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-purple-100 flex-shrink-0 w-full max-w-full overflow-hidden'
                style={{ height: '25vh', maxHeight: '25vh' }}
            >
                {/* Enhanced Tab Navigation - removed max-w-md */}
                <div className='flex items-center justify-center px-4 pt-3 pb-1 bg-gradient-to-r from-purple-50 via-white to-purple-50'>
                    <div className='flex w-full bg-gray-100 rounded-lg p-1 shadow-inner'>
                        {/* Backgrounds tab */}
                        <button
                            className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 space-x-2 flex-1 w-full cursor-pointer hover:bg-opacity-90 ${
                                activeTab === 'backgrounds'
                                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md transform scale-105'
                                    : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-purple-500'
                            }`}
                            onClick={() => setActiveTab('backgrounds')}
                        >
                            <ImageIcon
                                size={18}
                                className={activeTab === 'backgrounds' ? 'text-white' : 'text-purple-400'}
                            />
                            <span>Backgrounds</span>
                        </button>
                        {/* Accessories tab */}
                        <button
                            className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 space-x-2 flex-1 w-full cursor-pointer hover:bg-opacity-90 ${
                                activeTab === 'accessories'
                                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md transform scale-105'
                                    : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-purple-500'
                            }`}
                            onClick={() => setActiveTab('accessories')}
                        >
                            <Sparkles
                                size={18}
                                className={activeTab === 'accessories' ? 'text-white' : 'text-purple-400'}
                            />
                            <span>Accessories (Beta)</span>
                        </button>
                    </div>
                </div>

                <div className='p-2 sm:p-4 overflow-y-auto' style={{ height: 'calc(25vh - 64px)' }}>
                    {activeTab === 'backgrounds' ? (
                        <BackgroundsPanel state={state} dispatch={dispatch} />
                    ) : (
                        <AccessoriesPanel state={state} dispatch={dispatch} />
                    )}
                </div>
            </div>

            <ControlButtons dispatch={dispatch} />

            <Footer state={state} />
        </div>
    );
}
