import { useContext } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';

export default function BackgroundSelector() {
    const { state, dispatch } = useContext(PhotoboothContext);

    return (
        <div className='mb-12 px-4'>
            <h3 className='text-xl mb-6 text-gray-600 border-b pb-2'>Choose Your Perfect Background</h3>

            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8'>
                {/* No background option */}
                <div
                    className={`cursor-pointer overflow-hidden rounded-xl border-4 ${
                        !state.selectedBackground ? 'border-blue-500' : 'border-gray-200'
                    } shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl`}
                    onClick={() => dispatch({ type: 'SET_BACKGROUND', payload: null })}
                >
                    <div className='bg-gradient-to-br from-gray-100 to-gray-200 h-48 flex items-center justify-center'>
                        <span className='text-xl font-medium text-gray-600'>No Background</span>
                    </div>
                </div>

                {state.availableBackgrounds.map(bg => (
                    <div
                        key={bg.id}
                        className={`cursor-pointer overflow-hidden rounded-xl border-4 ${
                            state.selectedBackground?.id === bg.id ? 'border-blue-500' : 'border-gray-200'
                        } shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl group`}
                        onClick={() => dispatch({ type: 'SET_BACKGROUND', payload: bg })}
                    >
                        <div className='relative h-48'>
                            <img
                                src={bg.url}
                                alt={bg.name}
                                className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
                            />
                            <div className='absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                            <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300'>
                                <span className='text-lg font-medium'>{bg.name}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
