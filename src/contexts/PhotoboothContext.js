'use client';
import { createContext, useReducer, useEffect } from 'react';
import { getBackgrounds } from '../lib/backgroundUtils';

export const PhotoboothContext = createContext();

const initialState = {
    currentView: 'welcome',
    selectedBackground: null,
    availableBackgrounds: [],
    selectedFilter: null,
    availableFilters: [
        { id: 'normal', name: 'Normal', style: {} },
        { id: 'grayscale', name: 'Retro', style: { filter: 'grayscale(100%)' } },
        { id: 'warm', name: 'Warm', style: { filter: 'saturate(130%) hue-rotate(30deg) brightness(105%)' } },
        { id: 'high-contrast', name: 'High Contrast', style: { filter: 'contrast(150%) brightness(110%)' } },
    ],
    photos: [],
    photosPerSession: 8,
    price: 10.0,
    lastActivityTime: Date.now(),
};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_VIEW':
            return {
                ...state,
                currentView: action.payload,
                lastActivityTime: Date.now(),
            };
        case 'SET_BACKGROUND':
            return {
                ...state,
                selectedBackground: action.payload,
                lastActivityTime: Date.now(),
            };
        case 'SET_FILTER':
            return {
                ...state,
                selectedFilter: action.payload,
                lastActivityTime: Date.now(),
            };
        case 'SET_BACKGROUNDS':
            return {
                ...state,
                availableBackgrounds: action.payload,
            };
        case 'ADD_PHOTO':
            return {
                ...state,
                photos: [...state.photos, action.payload],
                lastActivityTime: Date.now(),
            };
        case 'CLEAR_PHOTOS':
            return {
                ...state,
                photos: [],
                lastActivityTime: Date.now(),
            };
        case 'RESET_APP':
            return {
                ...initialState,
                availableBackgrounds: state.availableBackgrounds,
                lastActivityTime: Date.now(),
            };
        case 'SET_SELECTED_PHOTOS':
            return {
                ...state,
                selectedPhotos: action.payload,
                lastActivityTime: Date.now(),
            };
        default:
            return state;
    }
}

export function PhotoboothProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        // Load available backgrounds on mount
        const loadBackgrounds = async () => {
            const backgrounds = await getBackgrounds();
            dispatch({ type: 'SET_BACKGROUNDS', payload: backgrounds });
        };

        loadBackgrounds();

        // Set up periodic background refresh (every hour)
        const refreshTimer = setInterval(loadBackgrounds, 3600000);

        return () => clearInterval(refreshTimer);
    }, []);

    return <PhotoboothContext.Provider value={{ state, dispatch }}>{children}</PhotoboothContext.Provider>;
}
