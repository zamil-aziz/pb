export const frames = [
    {
        id: 'classic',
        name: 'Classic',
        class: 'bg-white border-1 border-white shadow-2xl',
        previewClass: 'bg-gradient-to-r from-white to-gray-100',
        description: 'Timeless white frame that complements any photo style',
        type: 'css',
    },
    {
        id: 'pngFrame',
        name: 'Custom Frame',
        class: 'bg-transparent', // Minimal base styling for PNG frames
        previewClass: 'bg-gradient-to-r from-yellow-400 to-amber-500',
        description: 'Custom PNG frame with decorative border',
        type: 'png',
        imgSrc: '/frames/cinnamoroll.png',
    },
];
