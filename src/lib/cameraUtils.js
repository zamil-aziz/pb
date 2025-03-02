export function capturePhoto(videoElement, canvasElement, background) {
    if (!videoElement || !canvasElement) return null;

    // Get video dimensions
    const width = videoElement.videoWidth;
    const height = videoElement.videoHeight;

    // Set canvas to match video dimensions
    canvasElement.width = width;
    canvasElement.height = height;

    const ctx = canvasElement.getContext('2d');

    // If using a background
    if (background) {
        // Create a temporary image object
        const bgImg = new Image();
        bgImg.src = background.url;

        // Fill canvas with background image
        ctx.drawImage(bgImg, 0, 0, width, height);

        // Set blend mode for compositing camera feed
        ctx.globalCompositeOperation = 'screen';
    } else {
        // Clear canvas if no background
        ctx.clearRect(0, 0, width, height);
    }

    // Draw video frame on canvas
    ctx.drawImage(videoElement, 0, 0, width, height);

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';

    // Get the image data URL
    return canvasElement.toDataURL('image/jpeg', 0.9);
}
