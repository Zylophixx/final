# Thumbnails Directory

This directory contains thumbnail images for video previews.

## File Naming Convention

- **Showreel**: `showreel-thumb.jpg`
- **Featured Work**: `video-01-thumb.jpg`, `video-02-thumb.jpg`, etc.
- **Social Content**: `social-01-thumb.jpg`, `social-02-thumb.jpg`, etc.

## How to Generate Thumbnails

1. Use the Admin Panel (gear icon in top-right corner)
2. Upload your video files
3. Thumbnails will be automatically generated at the 1-second mark
4. Download the generated thumbnails
5. Upload them to this directory with the correct naming convention

## Benefits

- **Instant Loading**: Thumbnails show immediately while videos load in background
- **Reduced Bandwidth**: Only load full videos when user clicks to play
- **Better UX**: No waiting for video metadata to load for preview
- **Performance**: Significantly faster page load times

## Technical Details

- Thumbnails are generated as JPEG files with 80% quality
- Generated at exactly 1 second into the video
- Maintains original video aspect ratio
- Optimized for web delivery