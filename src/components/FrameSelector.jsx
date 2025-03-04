import { useContext, useState } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';

export default function FrameSelector() {
    const { state, dispatch } = useContext(PhotoboothContext);
    const [selectedFrame, setSelectedFrame] = useState(state.selectedFrame || 'classic');

    const frames = [
        {
            id: 'classic',
            name: 'Classic Polaroid',
            class: 'bg-white border-8 border-white shadow-xl',
            previewClass: 'bg-white',
        },
        {
            id: 'blackBorder',
            name: 'Black Frame',
            class: 'bg-white border-8 border-black shadow-xl',
            previewClass: 'bg-black',
        },
        {
            id: 'filmStrip',
            name: 'Film Strip',
            class: 'bg-white border-y-8 border-black shadow-xl relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-8 before:bg-black before:bg-opacity-80 before:content-[""] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-8 after:bg-black after:bg-opacity-80 after:content-[""]',
            previewClass: 'bg-gradient-to-r from-black via-white to-black',
        },
        {
            id: 'dotted',
            name: 'Dotted',
            class: 'bg-white border-8 border-gray-300 border-dashed shadow-xl',
            previewClass: 'bg-white',
        },
        {
            id: 'vintage',
            name: 'Vintage',
            class: 'bg-[#f3e8d2] border-8 border-amber-200 shadow-xl',
            previewClass: 'bg-amber-200',
        },
        {
            id: 'colorful',
            name: 'Rainbow',
            class: 'bg-white border-8 border-purple-500 shadow-xl overflow-hidden relative before:absolute before:inset-0 before:content-[""] before:bg-gradient-to-r before:from-red-500 before:via-yellow-500 before:to-blue-500 before:h-4 before:top-0 after:absolute after:inset-0 after:content-[""] after:bg-gradient-to-r after:from-green-500 after:via-blue-500 after:to-purple-500 after:h-4 after:bottom-0',
            previewClass: 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500',
        },
        {
            id: 'glitter',
            name: 'Glitter',
            class: 'bg-white border-8 border-pink-300 shadow-xl relative overflow-hidden before:absolute before:inset-0 before:content-[""] before:bg-[radial-gradient(circle,white,transparent_10%,transparent_20%,white_30%,transparent_40%)] before:bg-pink-200 before:opacity-50',
            previewClass: 'bg-pink-300',
        },
        {
            id: 'retro',
            name: 'Retro Camera',
            class: 'bg-gray-200 border-8 border-gray-800 shadow-xl relative overflow-hidden after:absolute after:bottom-0 after:left-0 after:right-0 after:h-12 after:bg-gray-800 after:content-[""]',
            previewClass: 'bg-gray-800',
        },
    ];

    const handleFrameSelect = frameId => {
        setSelectedFrame(frameId);
    };

    const continueToPayment = () => {
        dispatch({ type: 'SET_FRAME', payload: selectedFrame });
        dispatch({ type: 'SET_VIEW', payload: 'payment' });
    };

    return (
        <div className='p-8 max-w-4xl mx-auto bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white border-opacity-40 relative overflow-hidden'>
            {/* Decorative elements */}
            <div className='absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-10'></div>
            <div className='absolute bottom-0 left-0 w-40 h-40 -mb-16 -ml-16 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full opacity-10'></div>
            <div className='absolute top-10 left-10 w-24 h-24 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 opacity-30 blur-xl'></div>
            <div className='absolute bottom-20 right-10 w-32 h-32 rounded-full bg-gradient-to-r from-blue-300 to-indigo-300 opacity-30 blur-xl'></div>

            <h2 className='text-4xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600'>
                Choose Your Frame
            </h2>

            <div className='flex flex-col md:flex-row gap-8 mb-8'>
                {/* Preview of photos in selected frame - Made smaller */}
                <div className='flex-1 flex justify-center items-center'>
                    <div className={`relative max-w-[180px] ${frames.find(f => f.id === selectedFrame)?.class}`}>
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

                {/* Frame options - Enhanced visual appeal */}
                <div className='flex-1'>
                    <h3 className='text-xl font-semibold mb-4 text-gray-700'>Frame Styles</h3>
                    <div className='grid grid-cols-2 gap-4 max-h-[320px] overflow-y-auto pr-2'>
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
                                <div className={`h-24 mb-2 overflow-hidden rounded-lg ${frame.class}`}>
                                    <div className='h-full flex flex-col p-1 relative'>
                                        {/* Mini representation of photo strips */}
                                        <div className='h-4 w-11/12 bg-gray-300 mt-1 mx-auto rounded-sm'></div>
                                        <div className='h-4 w-11/12 bg-gray-300 mt-1 mx-auto rounded-sm'></div>
                                        <div className='h-4 w-11/12 bg-gray-300 mt-1 mx-auto rounded-sm'></div>
                                        <div className='h-4 w-11/12 bg-gray-300 mt-1 mx-auto rounded-sm'></div>
                                    </div>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <div
                                        className={`w-4 h-4 rounded-full ${frame.previewClass} border border-gray-300 flex-shrink-0`}
                                    ></div>
                                    <p className='font-medium text-gray-700 truncate'>{frame.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-2 gap-6 mb-6'>
                <button
                    onClick={continueToPayment}
                    className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-6 px-8 rounded-xl text-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl'
                >
                    Continue
                </button>

                <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'preview' })}
                    className='bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-6 px-8 rounded-xl text-2xl shadow-lg transform transition-all duration-300 hover:scale-105'
                >
                    Back to Photos
                </button>
            </div>
        </div>
    );
}
