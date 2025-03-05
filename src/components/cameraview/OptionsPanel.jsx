import React from 'react';
import { BackgroundsPanel } from './BackgroundPanels';
import { FiltersPanel } from './FiltersPanel';

export const OptionsPanel = ({ selectedTab, setSelectedTab, state, dispatch }) => {
    // Function to handle filter application
    const applyFilter = filterId => {
        dispatch({ type: 'SET_FILTER', payload: filterId });
    };

    return (
        <div
            className='mb-3 sm:mb-4 bg-white bg-opacity-80 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-purple-100 flex-shrink-0 w-full max-w-full'
            style={{ height: '25vh', maxHeight: '25vh' }}
        >
            <div className='flex text-center border-b border-purple-100'>
                <button
                    className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base md:text-lg ${
                        selectedTab === 'backgrounds'
                            ? 'text-purple-800 border-b-2 border-purple-600'
                            : 'text-gray-700 hover:text-purple-700'
                    }`}
                    onClick={() => setSelectedTab('backgrounds')}
                    aria-label='Select backgrounds tab'
                >
                    Backgrounds
                </button>
                <button
                    className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base md:text-lg ${
                        selectedTab === 'filters'
                            ? 'text-purple-800 border-b-2 border-purple-600'
                            : 'text-gray-700 hover:text-purple-700'
                    }`}
                    onClick={() => setSelectedTab('filters')}
                    aria-label='Select filters tab'
                >
                    Filters
                </button>
            </div>

            <div className='p-2 sm:p-4 overflow-y-auto' style={{ height: 'calc(25vh - 2.5rem)' }}>
                {selectedTab === 'backgrounds' && <BackgroundsPanel state={state} dispatch={dispatch} />}

                {selectedTab === 'filters' && (
                    <FiltersPanel
                        filters={state.availableFilters}
                        selectedFilter={state.selectedFilter}
                        applyFilter={applyFilter}
                    />
                )}
            </div>
        </div>
    );
};
