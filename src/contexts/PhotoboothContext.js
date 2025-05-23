'use client';
import { createContext, useReducer, useEffect } from 'react';
import { getBackgrounds } from '../lib/backgroundUtils';

export const PhotoboothContext = createContext();

// Action types as constants to avoid typos
export const ActionTypes = {
    SET_VIEW: 'SET_VIEW',
    SET_PHOTO_MODE: 'SET_PHOTO_MODE',
    SET_BACKGROUND: 'SET_BACKGROUND',
    SET_FILTER: 'SET_FILTER',
    SET_ACCESSORY: 'SET_ACCESSORY',
    SET_BACKGROUNDS: 'SET_BACKGROUNDS',
    ADD_PHOTO: 'ADD_PHOTO',
    CLEAR_PHOTOS: 'CLEAR_PHOTOS',
    RESET_APP: 'RESET_APP',
    SET_SELECTED_PHOTOS: 'SET_SELECTED_PHOTOS',
    SET_FRAME: 'SET_FRAME',
    SET_PRINT_QUANTITY: 'SET_PRINT_QUANTITY',
    SET_APPLIED_STICKERS: 'SET_APPLIED_STICKERS',
};

const initialState = {
    currentView: 'welcome',
    photoMode: 'strips', // New property for photo mode (strips or single)
    selectedBackground: null,
    availableBackgrounds: [],
    selectedFilter: null,
    selectedAccessory: null, // New property for selected accessory
    selectedFrame: 'classic', // Added default frame value
    frameType: 'css', // Added frame type property
    frameImgSrc: null, // Added for PNG frame source
    availableFilters: [
        { id: 'normal', name: 'Normal', style: {} },
        { id: 'grayscale', name: 'Retro', style: { filter: 'grayscale(100%)' } },
        { id: 'warm', name: 'Warm', style: { filter: 'saturate(130%) hue-rotate(30deg) brightness(105%)' } },
    ],
    availableAccessories: [
        // New property for available accessories
        { id: 'cat-ears', name: 'Cat Ears', url: '/accessories/cat-ears.png' },
        { id: 'glasses', name: 'Glasses', url: '/accessories/glasses.png' },
        { id: 'hat', name: 'Cowboy Hat', url: '/accessories/cowboy-hat.png' },
    ],
    photos: [],
    photosPerSession: 8, // Default for strips mode
    printQuantity: 2, // Default print quantity
    price: 10.0,
    appliedStickers: [],
    lastActivityTime: Date.now(),
};

// Base prices per mode
const BASE_PRICES = {
    strips: 10.0,
    single: 15.0,
};

// Calculate price based on mode and quantity
function calculatePrice(mode, quantity) {
    const basePrice = BASE_PRICES[mode];
    // Apply volume discount for higher quantities
    const multiplier = quantity === 2 ? 1 : quantity === 4 ? 1.8 : quantity === 6 ? 2.5 : quantity === 8 ? 3.0 : 1;

    return (basePrice * multiplier).toFixed(2) * 1; // Convert back to number
}

function reducer(state, action) {
    switch (action.type) {
        case ActionTypes.SET_VIEW:
            return {
                ...state,
                currentView: action.payload,
                lastActivityTime: Date.now(),
            };
        case ActionTypes.SET_PHOTO_MODE:
            // Handle photo mode selection and adjust related settings
            return {
                ...state,
                photoMode: action.payload,
                photosPerSession: action.payload === 'single' ? 4 : 8, // 4 photo for single mode, 8 for strips
                price: calculatePrice(action.payload, state.printQuantity), // Adjust price based on mode and quantity
                lastActivityTime: Date.now(),
            };
        case ActionTypes.SET_PRINT_QUANTITY:
            // Update print quantity and recalculate price
            return {
                ...state,
                printQuantity: action.payload,
                price: calculatePrice(state.photoMode, action.payload),
                lastActivityTime: Date.now(),
            };
        case ActionTypes.SET_BACKGROUND:
            return {
                ...state,
                selectedBackground: action.payload,
                lastActivityTime: Date.now(),
            };
        case ActionTypes.SET_FILTER:
            return {
                ...state,
                selectedFilter: action.payload,
                lastActivityTime: Date.now(),
            };
        case ActionTypes.SET_ACCESSORY:
            return {
                ...state,
                selectedAccessory: action.payload,
                lastActivityTime: Date.now(),
            };
        case ActionTypes.SET_BACKGROUNDS:
            return {
                ...state,
                availableBackgrounds: action.payload,
            };
        case ActionTypes.ADD_PHOTO:
            return {
                ...state,
                photos: [...state.photos, action.payload],
                lastActivityTime: Date.now(),
            };
        case ActionTypes.CLEAR_PHOTOS:
            return {
                ...state,
                photos: [],
                lastActivityTime: Date.now(),
            };
        case ActionTypes.RESET_APP:
            return {
                ...initialState,
                availableBackgrounds: state.availableBackgrounds,
                lastActivityTime: Date.now(),
            };
        case ActionTypes.SET_SELECTED_PHOTOS:
            return {
                ...state,
                selectedPhotos: action.payload,
                lastActivityTime: Date.now(),
            };
        case ActionTypes.SET_FRAME:
            // Updated to handle both CSS-only frames and PNG frames
            if (typeof action.payload === 'object' && action.payload.type === 'png') {
                return {
                    ...state,
                    selectedFrame: action.payload.class,
                    frameType: 'png',
                    frameImgSrc: action.payload.imgSrc,
                    lastActivityTime: Date.now(),
                };
            } else {
                return {
                    ...state,
                    selectedFrame: action.payload,
                    frameType: 'css',
                    frameImgSrc: null,
                    lastActivityTime: Date.now(),
                };
            }
        case ActionTypes.SET_APPLIED_STICKERS:
            return {
                ...state,
                appliedStickers: action.payload,
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
            dispatch({ type: ActionTypes.SET_BACKGROUNDS, payload: backgrounds });
        };

        loadBackgrounds();

        // Set up periodic background refresh (every hour)
        const refreshTimer = setInterval(loadBackgrounds, 3600000);

        return () => clearInterval(refreshTimer);
    }, []);

    return <PhotoboothContext.Provider value={{ state, dispatch }}>{children}</PhotoboothContext.Provider>;
}
