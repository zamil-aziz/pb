export async function getBackgrounds() {
    try {
        // Instead of fetching from API, return static backgrounds
        // This avoids the 404 error when the API endpoint doesn't exist
        console.log('Loading static backgrounds');

        return [
            {
                id: '1',
                name: 'Beach',
                url: '/backgrounds/beach.jpg',
                // Fallback to a color if image doesn't exist
                fallbackColor: '#87CEEB',
            },
            {
                id: '2',
                name: 'City',
                url: '/backgrounds/city.jpg',
                fallbackColor: '#1E3A8A',
            },
            {
                id: '3',
                name: 'Space',
                url: '/backgrounds/space.jpg',
                fallbackColor: '#000000',
            },
        ];
    } catch (error) {
        console.error('Error loading backgrounds:', error);
        // Return minimal fallback for testing
        return [
            {
                id: '5',
                name: 'Plain Black',
                url: null,
                fallbackColor: '#000000',
            },
        ];
    }
}
