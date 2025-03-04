import { useContext } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';

export default function PhotoPreview() {
    const { state, dispatch } = useContext(PhotoboothContext);

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

            <div className='relative mx-auto overflow-hidden rounded-xl shadow-lg mb-8'>
                <div className='grid grid-cols-2 gap-4'>
                    {state.photos.map((photo, index) => (
                        <div
                            key={index}
                            className='rounded-xl overflow-hidden shadow-lg border border-white border-opacity-40'
                        >
                            <img src={photo} alt={`Photo ${index + 1}`} className='w-full h-auto' />
                        </div>
                    ))}
                </div>
            </div>

            <div className='grid grid-cols-2 gap-6 mb-6'>
                <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'payment' })}
                    className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-6 px-8 rounded-xl text-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl'
                >
                    Print Photos
                </button>

                <button
                    onClick={() => {
                        dispatch({ type: 'CLEAR_PHOTOS' });
                        dispatch({ type: 'SET_VIEW', payload: 'camera' });
                    }}
                    className='bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-6 px-8 rounded-xl text-2xl shadow-lg transform transition-all duration-300 hover:scale-105'
                >
                    Retake Photos
                </button>
            </div>

            <div className='text-center'>
                <p className='text-xl text-gray-700 mb-2'>Price: RM {state.price.toFixed(2)}</p>
                {state.selectedFilter && state.selectedFilter !== 'normal' && (
                    <p className='text-lg text-indigo-600 mb-2'>
                        Filter:{' '}
                        {state.availableFilters.find(f => f.id === state.selectedFilter)?.name || state.selectedFilter}
                    </p>
                )}
                <p className='text-lg text-gray-500'>Looking good! Ready to print?</p>
            </div>
        </div>
    );
}
