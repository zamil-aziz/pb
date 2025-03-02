export async function getBackgrounds() {
    try {
        // In a real app, fetch from your API
        const response = await fetch('/api/backgrounds');
        if (!response.ok) throw new Error('Failed to fetch backgrounds');
        return await response.json();
    } catch (error) {
        console.error('Error loading backgrounds:', error);
        // Return fallback backgrounds if API fails
        return [
            { id: '1', name: 'Beach', url: '/backgrounds/beach.jpg' },
            { id: '2', name: 'City', url: '/backgrounds/city.jpg' },
            { id: '3', name: 'Space', url: '/backgrounds/space.jpg' },
        ];
    }
}
