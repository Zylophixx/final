/**
 * Utility functions for generating and managing video thumbnails
 */

export interface VideoThumbnailData {
  src: string;
  thumbnail: string;
  title: string;
  aspectRatio?: 'video' | 'vertical';
}

/**
 * Generate a thumbnail from a video file at the 1-second mark
 * This function can be used to create thumbnails from uploaded videos
 */
export function generateThumbnailFromVideo(
  videoFile: File,
  timeInSeconds: number = 1
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    video.addEventListener('loadedmetadata', () => {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Seek to the specified time
      video.currentTime = Math.min(timeInSeconds, video.duration);
    });

    video.addEventListener('seeked', () => {
      try {
        // Draw the current frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob and create URL
        canvas.toBlob((blob) => {
          if (blob) {
            const thumbnailUrl = URL.createObjectURL(blob);
            resolve(thumbnailUrl);
          } else {
            reject(new Error('Failed to create thumbnail blob'));
          }
        }, 'image/jpeg', 0.8);
      } catch (error) {
        reject(error);
      }
    });

    video.addEventListener('error', () => {
      reject(new Error('Video failed to load'));
    });

    // Load the video
    video.src = URL.createObjectURL(videoFile);
    video.load();
  });
}

/**
 * Create a thumbnail file name based on video file name
 */
export function createThumbnailFileName(videoFileName: string): string {
  const nameWithoutExtension = videoFileName.replace(/\.[^/.]+$/, '');
  return `${nameWithoutExtension}-thumb.jpg`;
}

/**
 * Batch process multiple video files to generate thumbnails
 */
export async function batchGenerateThumbnails(
  videoFiles: File[],
  timeInSeconds: number = 1,
  onProgress?: (completed: number, total: number) => void
): Promise<{ file: File; thumbnail: string; fileName: string }[]> {
  const results = [];
  
  for (let i = 0; i < videoFiles.length; i++) {
    try {
      const thumbnail = await generateThumbnailFromVideo(videoFiles[i], timeInSeconds);
      const fileName = createThumbnailFileName(videoFiles[i].name);
      
      results.push({
        file: videoFiles[i],
        thumbnail,
        fileName
      });
      
      onProgress?.(i + 1, videoFiles.length);
    } catch (error) {
      console.error(`Failed to generate thumbnail for ${videoFiles[i].name}:`, error);
    }
  }
  
  return results;
}

/**
 * Download a thumbnail as a file
 */
export function downloadThumbnail(thumbnailUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.href = thumbnailUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Validate video file type
 */
export function isValidVideoFile(file: File): boolean {
  const validTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo'
  ];
  
  return validTypes.includes(file.type);
}