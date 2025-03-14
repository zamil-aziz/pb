export async function getBackgrounds() {
    try {
        // Instead of fetching from API, return static backgrounds
        // This avoids the 404 error when the API endpoint doesn't exist
        console.log('Loading static backgrounds');

        return [
            {
                id: '1',
                name: 'Paris',
                url: '/backgrounds/paris.jpeg',
                fallbackColor: '#0D8A3E',
            },
            {
                id: '2',
                name: 'The Great Barrier Reef',
                url: '/backgrounds/barrier-reef.jpeg',
                fallbackColor: '#0A0A2A',
            },
            {
                id: '3',
                name: 'Machu Pichu',
                url: '/backgrounds/machu-pichu.jpeg',
                fallbackColor: '#B22222',
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
