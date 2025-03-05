'use client';
import { useContext, useState } from 'react';
import { PhotoboothContext, ActionTypes } from '../contexts/PhotoboothContext';

export default function PhotoPreview() {
    const { state, dispatch } = useContext(PhotoboothContext);
    const [selectedPhotos, setSelectedPhotos] = useState([]);

    // Check if we're in single or strips mode
    const isSingleMode = state.photoMode === 'single';
    // Number of photos required to continue
    const requiredPhotos = isSingleMode ? 1 : 4;

    const togglePhotoSelection = photoIndex => {
        if (selectedPhotos.includes(photoIndex)) {
            setSelectedPhotos(selectedPhotos.filter(index => index !== photoIndex));
        } else {
            // In single mode, replace the selection. In strips mode, add to selection (up to 4)
            if (isSingleMode) {
                setSelectedPhotos([photoIndex]);
            } else if (selectedPhotos.length < requiredPhotos) {
                setSelectedPhotos([...selectedPhotos, photoIndex]);
            }
        }
    };

    const continueWithSelected = () => {
        // Check if we have the required number of photos based on mode
        if (selectedPhotos.length === requiredPhotos) {
            const selectedPhotoData = selectedPhotos.map(index => state.photos[index]);
            dispatch({ type: ActionTypes.SET_SELECTED_PHOTOS, payload: selectedPhotoData });
            dispatch({ type: ActionTypes.SET_VIEW, payload: 'frame' });
        }
    };

    return (
        <div className='p-8 max-w-4xl mx-auto bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white border-opacity-40 relative overflow-hidden'>
            {/* Decorative elements - matching CameraView */}
            <div className='absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-10'></div>
            <div className='absolute bottom-0 left-0 w-40 h-40 -mb-16 -ml-16 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full opacity-10'></div>
            <div className='absolute top-10 left-10 w-24 h-24 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 opacity-30 blur-xl'></div>
            <div className='absolute bottom-20 right-10 w-32 h-32 rounded-full bg-gradient-to-r from-blue-300 to-indigo-300 opacity-30 blur-xl'></div>

            <h2 className='text-4xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600'>
                Your Photos
            </h2>

            <p className='text-center text-gray-800 font-medium mb-4'>
                Select {isSingleMode ? 'your favorite photo' : '4 photos'} to continue ({selectedPhotos.length}/
                {requiredPhotos} selected)
            </p>

            <div className='relative mx-auto overflow-hidden rounded-xl shadow-lg mb-8'>
                <div className='grid grid-rows-2 gap-4'>
                    {/* Top row - first 4 photos */}
                    <div className='grid grid-cols-4 gap-4 p-2'>
                        {state.photos.slice(0, 4).map((photo, index) => (
                            <div
                                key={index}
                                className={`rounded-xl shadow-lg cursor-pointer transition-all duration-200 transform relative ${
                                    selectedPhotos.includes(index) ? 'scale-105 z-10' : ''
                                }`}
                                onClick={() => togglePhotoSelection(index)}
                            >
                                <div
                                    className={`rounded-xl overflow-hidden border-2 ${
                                        selectedPhotos.includes(index)
                                            ? 'border-indigo-600 ring-2 ring-indigo-600'
                                            : 'border-white border-opacity-40'
                                    }`}
                                >
                                    <img src={photo} alt={`Photo ${index + 1}`} className='w-full h-auto' />
                                    {selectedPhotos.includes(index) && (
                                        <div className='absolute top-2 right-2 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center'>
                                            ✓
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Bottom row - next 4 photos */}
                    <div className='grid grid-cols-4 gap-4 p-2'>
                        {state.photos.slice(4, 8).map((photo, index) => (
                            <div
                                key={index + 4}
                                className={`rounded-xl shadow-lg cursor-pointer transition-all duration-200 transform relative ${
                                    selectedPhotos.includes(index + 4) ? 'scale-105 z-10' : ''
                                }`}
                                onClick={() => togglePhotoSelection(index + 4)}
                            >
                                <div
                                    className={`rounded-xl overflow-hidden border-2 ${
                                        selectedPhotos.includes(index + 4)
                                            ? 'border-indigo-600 ring-2 ring-indigo-600'
                                            : 'border-white border-opacity-40'
                                    }`}
                                >
                                    <img src={photo} alt={`Photo ${index + 5}`} className='w-full h-auto' />
                                    {selectedPhotos.includes(index + 4) && (
                                        <div className='absolute top-2 right-2 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center'>
                                            ✓
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-2 gap-6 mb-6'>
                <button
                    onClick={continueWithSelected}
                    disabled={selectedPhotos.length !== requiredPhotos}
                    className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-6 px-8 rounded-xl text-2xl shadow-lg transform transition-all duration-300 ${
                        selectedPhotos.length === requiredPhotos
                            ? 'hover:from-indigo-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl'
                            : 'opacity-50 cursor-not-allowed'
                    }`}
                >
                    Continue with Selected
                </button>

                <button
                    onClick={() => {
                        dispatch({ type: ActionTypes.CLEAR_PHOTOS });
                        dispatch({ type: ActionTypes.SET_VIEW, payload: 'camera' });
                    }}
                    className='bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-6 px-8 rounded-xl text-2xl shadow-lg transform transition-all duration-300 hover:scale-105'
                >
                    Retake Photos
                </button>
            </div>

            <div className='text-center'>
                <p className='text-xl text-gray-700 mb-2'>Price: RM {state.price.toFixed(2)}</p>
                <div className='flex space-x-4 items-center justify-center'>
                    {state.selectedFilter && state.selectedFilter !== 'normal' && (
                        <p className='text-lg'>
                            <span className='font-medium text-gray-700'>Filter:</span>{' '}
                            <span className='text-indigo-600'>
                                {state.availableFilters.find(f => f.id === state.selectedFilter)?.name ||
                                    state.selectedFilter}
                            </span>
                        </p>
                    )}
                    {state.selectedBackground && (
                        <p className='text-lg'>
                            <span className='font-medium text-gray-700'>Background:</span>{' '}
                            <span className='text-indigo-600'>
                                {state.selectedBackground.name || state.selectedBackground.id}
                            </span>
                        </p>
                    )}
                </div>
                <p className='text-lg text-gray-700 font-medium mt-2'>
                    Select {isSingleMode ? 'your favorite photo' : 'your favorite 4 photos'} to continue
                </p>
            </div>
        </div>
    );
}
