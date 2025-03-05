'use client';

// Apply CSS filter effects to a canvas element
export const applyCanvasFilter = (canvas, filterId, availableFilters) => {
    if (!canvas) return;

    const filter = availableFilters.find(f => f.id === filterId);
    if (filter && filter.style.filter) {
        canvas.style.filter = filter.style.filter;
    } else {
        canvas.style.filter = '';
    }
};

// Apply CSS filter to a video element
export const applyVideoFilter = (video, filterId, availableFilters) => {
    if (!video) return;

    const filter = availableFilters.find(f => f.id === filterId);
    if (filter && filter.style.filter) {
        video.style.filter = filter.style.filter;
    } else {
        video.style.filter = '';
    }
};

// Apply filter effects directly to image data
export const applyFilterToImageData = (ctx, width, height, filterId, availableFilters) => {
    if (!ctx) return false;

    const filter = availableFilters.find(f => f.id === filterId);
    if (!filter || !filter.style.filter) return false;

    const filterStyle = filter.style.filter;

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Apply filter effects based on the filter type
    if (filterStyle.includes('grayscale')) {
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg; // R
            data[i + 1] = avg; // G
            data[i + 2] = avg; // B
        }
    } else if (filterStyle.includes('sepia')) {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189); // R
            data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168); // G
            data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131); // B
        }
    } else if (filterStyle.includes('saturate')) {
        const saturationFactor = 1.3; // Corresponds to saturate(130%)
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = Math.min(255, avg + (data[i] - avg) * saturationFactor); // R
            data[i + 1] = Math.min(255, avg + (data[i + 1] - avg) * saturationFactor); // G
            data[i + 2] = Math.min(255, avg + (data[i + 2] - avg) * saturationFactor); // B
        }
    } else if (filterStyle.includes('contrast')) {
        const contrastFactor = 1.5; // Corresponds to contrast(150%)
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, 128 + (data[i] - 128) * contrastFactor); // R
            data[i + 1] = Math.min(255, 128 + (data[i + 1] - 128) * contrastFactor); // G
            data[i + 2] = Math.min(255, 128 + (data[i + 2] - 128) * contrastFactor); // B
        }
    } else if (filterStyle.includes('hue-rotate')) {
        // For warm filter (hue-rotate + saturate + brightness)
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.1); // Boost red
            data[i + 2] = Math.min(255, data[i + 2] * 0.9); // Reduce blue
        }
    }

    ctx.putImageData(imageData, 0, 0);
    return true;
};
