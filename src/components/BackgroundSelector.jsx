import { useContext } from 'react';
import { PhotoboothContext } from '../contexts/PhotoboothContext';

export default function BackgroundSelector() {
    const { state, dispatch } = useContext(PhotoboothContext);

    return (
        <div className='w-full'>
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4'>
                {/* No background option */}
                <div
                    className={`cursor-pointer overflow-hidden rounded-lg sm:rounded-xl border-2 sm:border-4 ${
                        !state.selectedBackground ? 'border-blue-500' : 'border-gray-200'
                    } shadow-md sm:shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl`}
                    onClick={() => dispatch({ type: 'SET_BACKGROUND', payload: null })}
                    role='button'
                    aria-label='Select no background'
                    tabIndex={0}
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            dispatch({ type: 'SET_BACKGROUND', payload: null });
                        }
                    }}
                >
                    <div
                        className='bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center'
                        style={{ aspectRatio: '5/3', maxHeight: '100px' }}
                    >
                        <span className='text-sm sm:text-base md:text-lg font-medium text-gray-600'>No Background</span>
                    </div>
                </div>

                {state.availableBackgrounds.map(bg => (
                    <div
                        key={bg.id}
                        className={`cursor-pointer overflow-hidden rounded-lg sm:rounded-xl border-2 sm:border-4 ${
                            state.selectedBackground?.id === bg.id ? 'border-blue-500' : 'border-gray-200'
                        } shadow-md sm:shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl group`}
                        onClick={() => dispatch({ type: 'SET_BACKGROUND', payload: bg })}
                        role='button'
                        aria-label={`Select ${bg.name} background`}
                        tabIndex={0}
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                dispatch({ type: 'SET_BACKGROUND', payload: bg });
                            }
                        }}
                    >
                        <div className='relative' style={{ aspectRatio: '5/3', maxHeight: '100px' }}>
                            <img
                                src={bg.url}
                                alt={bg.name}
                                className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
                                loading='lazy'
                            />
                            <div className='absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                            <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-1 sm:p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300'>
                                <span className='text-xs sm:text-sm font-medium truncate block'>{bg.name}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
