export async function getBackgrounds() {
    try {
        // Instead of fetching from API, return static backgrounds
        // This avoids the 404 error when the API endpoint doesn't exist
        console.log('Loading static backgrounds');

        return [
            {
                id: '1',
                name: 'Hari Raya',
                url: '/backgrounds/raya.jpg',
                // Fallback to a color if image doesn't exist
                fallbackColor: '#0D8A3E', // Rich green, a common color for Hari Raya
            },
            {
                id: '2',
                name: 'Christmas',
                url: '/backgrounds/christmas.jpg',
                fallbackColor: '#B22222', // Festive red for Christmas
            },
            {
                id: '3',
                name: 'Space',
                url: '/backgrounds/space.jpg',
                fallbackColor: '#0A0A2A',
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
