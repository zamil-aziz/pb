'use client';
import { useContext, useState } from 'react';
import { PhotoboothContext, ActionTypes } from '../contexts/PhotoboothContext';

export default function FrameSelector() {
    const { state, dispatch } = useContext(PhotoboothContext);
    const [selectedFrame, setSelectedFrame] = useState(state.selectedFrame || 'classic');

    // Create a separate file for this in a real application
    const frames = [
        {
            id: 'classic',
            name: 'Classic White',
            class: 'bg-white border-8 border-white shadow-2xl',
            previewClass: 'bg-gradient-to-r from-white to-gray-100',
            description: 'Timeless white frame that complements any photo style',
        },
        {
            id: 'blackEdge',
            name: 'Bold Black',
            class: 'bg-white border-8 border-black shadow-xl',
            previewClass: 'bg-black',
            description: 'Striking black border for dramatic contrast',
        },
        {
            id: 'goldLeaf',
            name: 'Gold Leaf',
            class: "bg-amber-50 border-8 border-yellow-500 shadow-xl relative overflow-hidden before:absolute before:inset-0 before:content-[''] before:bg-gradient-to-r before:from-yellow-300 before:to-amber-400 before:opacity-50 after:absolute after:inset-0 after:content-[''] after:bg-[url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f59e0b' fill-opacity='0.3' fill-rule='evenodd'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 20.83l2.83-2.83 1.41 1.41L1.41 22.24H0v-1.41zM0 3.06l2.83-2.83 1.41 1.41L1.41 4.47H0V3.06zm20 0l2.83-2.83 1.41 1.41L21.41 4.47h-1.41V3.06zm0 17.77l2.83-2.83 1.41 1.41-2.83 2.83h-1.41v-1.41zm0 17.77l2.83-2.83 1.41 1.41-2.83 2.83H20v-1.41zM3.06 0l-1.41 1.41-1.4-1.4L1.65 0h1.41zm17.77 0L18.42 2.83 17.01 1.42l1.41-1.41h2.41zm17.77 0l-1.41 1.41-1.41-1.4 1.4-1.4h1.42zM3.06 20l-1.41-1.41-1.42 1.4L1.65 22h1.41zM3.06 40l-1.41-1.41-1.41 1.41 1.41 1.41h1.41zM20.83 40l-1.41-1.41-1.41 1.41 1.41 1.41h1.41zM38.59 40l-1.41-1.41-1.41 1.41 1.41 1.41h1.41zM20.83 20l-1.41-1.41-1.41 1.41 1.41 1.41h1.41zM38.59 20l-1.41-1.41-1.41 1.41 1.41 1.41h1.41zM38.59 0l-1.41 1.41-1.41-1.41 1.41-1.41h1.41z'/%3E%3C/g%3E%3C/svg%3E\")] after:opacity-60",
            previewClass: 'bg-gradient-to-r from-yellow-400 to-amber-500',
            description: 'Luxurious gold finish for elegant presentation',
        },
        {
            id: 'woodGrain',
            name: 'Natural Wood',
            class: "bg-amber-100 border-8 border-amber-700 shadow-xl relative overflow-hidden before:absolute before:inset-0 before:content-[''] before:bg-[url(\"data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%23854d0e' fill-opacity='0.5' fill-rule='evenodd'/%3E%3C/svg%3E\")] before:opacity-70",
            previewClass: 'bg-gradient-to-r from-amber-600 to-amber-800',
            description: 'Warm wooden texture for a rustic, organic feel',
        },
        // Other frames...
    ];

    const handleFrameSelect = frameId => {
        setSelectedFrame(frameId);
    };

    const continueToPayment = () => {
        dispatch({ type: ActionTypes.SET_FRAME, payload: selectedFrame });
        dispatch({ type: ActionTypes.SET_VIEW, payload: 'payment' });
    };

    return (
        <div className='p-8 max-w-4xl mx-auto bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white border-opacity-40 relative overflow-hidden'>
            {/* Decorative elements */}
            <div className='absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-10'></div>
            <div className='absolute bottom-0 left-0 w-40 h-40 -mb-16 -ml-16 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full opacity-10'></div>

            <h2 className='text-4xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600'>
                Choose Your Frame
            </h2>

            <div className='flex flex-col md:flex-row gap-8 mb-8'>
                {/* Preview of photos in selected frame */}
                <div className='md:w-1/3 flex flex-col justify-center items-center'>
                    <div
                        className={`relative w-full max-w-[220px] mx-auto ${
                            frames.find(f => f.id === selectedFrame)?.class
                        }`}
                    >
                        <div className='flex flex-col gap-1 p-2'>
                            {state.selectedPhotos &&
                                state.selectedPhotos.map((photo, index) => (
                                    <div key={index} className='relative'>
                                        <img
                                            src={photo}
                                            alt={`Selected photo ${index + 1}`}
                                            className='w-full h-auto'
                                        />
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                {/* Frame options - Fixed grid and scrolling */}
                <div className='md:w-2/3'>
                    <h3 className='text-xl font-semibold mb-4 text-gray-700'>Premium Frame Styles</h3>
                    <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-2'>
                        {frames.map(frame => (
                            <div
                                key={frame.id}
                                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                                    selectedFrame === frame.id
                                        ? 'bg-indigo-100 ring-2 ring-indigo-500 shadow-lg'
                                        : 'bg-gray-100 hover:bg-gray-200 hover:shadow-md'
                                }`}
                                onClick={() => handleFrameSelect(frame.id)}
                            >
                                {/* Fixed height preview for mini frame examples */}
                                <div className='h-20 mb-2 overflow-hidden rounded-lg'>
                                    <div className={`h-full w-full ${frame.class}`}>
                                        <div className='h-full flex flex-col p-1 relative'>
                                            {/* Mini representation of photo strips */}
                                            <div className='h-5 w-11/12 bg-gray-300 mt-1 mx-auto rounded-sm'></div>
                                            <div className='h-5 w-11/12 bg-gray-300 mt-1 mx-auto rounded-sm'></div>
                                            <div className='h-5 w-11/12 bg-gray-300 mt-1 mx-auto rounded-sm'></div>
                                        </div>
                                    </div>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <div
                                            className={`w-4 h-4 rounded-full ${frame.previewClass} border border-gray-300 flex-shrink-0`}
                                        ></div>
                                        <p className='font-medium text-sm text-gray-700 truncate'>{frame.name}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
                <button
                    onClick={continueToPayment}
                    className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 md:py-6 px-6 md:px-8 rounded-xl text-lg md:text-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl'
                >
                    Continue with Selected Frame
                </button>

                <button
                    onClick={() => dispatch({ type: ActionTypes.SET_VIEW, payload: 'preview' })}
                    className='bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 md:py-6 px-6 md:px-8 rounded-xl text-lg md:text-xl shadow-lg transform transition-all duration-300 hover:scale-105'
                >
                    Back to Photos
                </button>
            </div>
        </div>
    );
}
