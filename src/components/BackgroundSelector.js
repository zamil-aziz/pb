import { useContext } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';

export default function BackgroundSelector() {
    const { state, dispatch } = useContext(PhotoboothContext);

    return (
        <div className='mb-10'>
            <h3 className='text-2xl font-semibold mb-6'>Choose a Background:</h3>

            <div className='grid grid-cols-2 gap-6 mb-8'>
                {/* No background option */}
                <div
                    className={`cursor-pointer overflow-hidden rounded-xl border-4 ${
                        !state.selectedBackground ? 'border-blue-500' : 'border-transparent'
                    } shadow-md transition-all transform hover:scale-105`}
                    onClick={() => dispatch({ type: 'SET_BACKGROUND', payload: null })}
                >
                    <div className='bg-gray-200 h-40 flex items-center justify-center'>
                        <span className='text-xl text-gray-600'>No Background</span>
                    </div>
                </div>

                {state.availableBackgrounds.map(bg => (
                    <div
                        key={bg.id}
                        className={`cursor-pointer overflow-hidden rounded-xl border-4 ${
                            state.selectedBackground?.id === bg.id ? 'border-blue-500' : 'border-transparent'
                        } shadow-md transition-all transform hover:scale-105`}
                        onClick={() => dispatch({ type: 'SET_BACKGROUND', payload: bg })}
                    >
                        <div className='relative h-40'>
                            <img src={bg.url} alt={bg.name} className='h-full w-full object-cover' />
                            <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2'>
                                <span className='text-lg'>{bg.name}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
