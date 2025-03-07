export const Footer = ({ state }) => {
    return (
        <div className='text-center flex-shrink-0'>
            <p className='text-sm sm:text-md text-gray-800 font-medium mb-1'>
                {state.photosPerSession} photos will be taken
            </p>
            <p className='text-xs sm:text-sm text-gray-700 font-medium'>Get ready to strike your best pose!</p>

            {/* {!state.selectedBackground && (
                <p className='mt-1 sm:mt-2 text-amber-600 text-xs sm:text-sm font-semibold'>
                    No background selected. Photos will be taken with your natural background.
                </p>
            )} */}
        </div>
    );
};
