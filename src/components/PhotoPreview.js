import { useContext } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';

export default function PhotoPreview() {
    const { state, dispatch } = useContext(PhotoboothContext);

    return (
        <div className='w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden'>
            <h2 className='text-3xl font-bold p-4 text-center'>Your Photos</h2>

            <div className='grid grid-cols-2 gap-4 p-4'>
                {state.photos.map((photo, index) => (
                    <div key={index} className='rounded-lg overflow-hidden shadow-md'>
                        <img src={photo} alt={`Photo ${index + 1}`} className='w-full h-auto' />
                    </div>
                ))}
            </div>

            <div className='p-4 text-center text-gray-400'>
                <p className='text-2xl mb-4'>Looking good! What would you like to do?</p>
                <p className='text-xl mb-6'>Price: RM {state.price.toFixed(2)}</p>
            </div>

            <div className='grid grid-cols-2 gap-4 p-6'>
                <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'payment' })}
                    className='text-2xl bg-green-500 hover:bg-green-600 text-white font-bold py-6 px-8 rounded-xl shadow-lg'
                >
                    Print Photos
                </button>

                <button
                    onClick={() => {
                        dispatch({ type: 'CLEAR_PHOTOS' });
                        dispatch({ type: 'SET_VIEW', payload: 'camera' });
                    }}
                    className='text-2xl bg-red-500 hover:bg-red-600 text-white font-bold py-6 px-8 rounded-xl shadow-lg'
                >
                    Retake Photos
                </button>
            </div>
        </div>
    );
}
