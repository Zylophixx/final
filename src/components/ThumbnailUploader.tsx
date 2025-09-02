import React, { useState, useRef } from 'react';
import { Upload, Download, X, Play, Image } from 'lucide-react';
import { 
  generateThumbnailFromVideo, 
  batchGenerateThumbnails, 
  downloadThumbnail,
  createThumbnailFileName,
  isValidVideoFile,
  VideoThumbnailData 
} from '../utils/thumbnailGenerator';

interface ThumbnailUploaderProps {
  onThumbnailsGenerated?: (thumbnails: VideoThumbnailData[]) => void;
}

export function ThumbnailUploader({ onThumbnailsGenerated }: ThumbnailUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedThumbnails, setGeneratedThumbnails] = useState<VideoThumbnailData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    const videoFiles = files.filter(isValidVideoFile);
    
    if (videoFiles.length === 0) {
      alert('Please select valid video files (MP4, WebM, OGG, MOV, AVI)');
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      const results = await batchGenerateThumbnails(
        videoFiles,
        1, // Generate thumbnail at 1 second
        (completed, total) => {
          setProgress((completed / total) * 100);
        }
      );

      const thumbnailData: VideoThumbnailData[] = results.map((result, index) => ({
        src: URL.createObjectURL(result.file),
        thumbnail: result.thumbnail,
        title: `VIDEO ${String(index + 1).padStart(2, '0')}`,
        aspectRatio: 'video' as const
      }));

      setGeneratedThumbnails(thumbnailData);
      onThumbnailsGenerated?.(thumbnailData);
      
    } catch (error) {
      console.error('Error processing videos:', error);
      alert('Error processing videos. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadAllThumbnails = () => {
    generatedThumbnails.forEach((item, index) => {
      const fileName = `thumbnail-${String(index + 1).padStart(2, '0')}.jpg`;
      downloadThumbnail(item.thumbnail, fileName);
    });
  };

  const clearThumbnails = () => {
    // Clean up object URLs to prevent memory leaks
    generatedThumbnails.forEach(item => {
      URL.revokeObjectURL(item.src);
      URL.revokeObjectURL(item.thumbnail);
    });
    setGeneratedThumbnails([]);
    setProgress(0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bosenAlt text-black/90 mb-2">
          VIDEO THUMBNAIL GENERATOR
        </h2>
        <p className="text-black/60">
          Upload videos to automatically generate 1-second preview thumbnails
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${processing ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          <Upload className={`w-12 h-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <div>
            <p className="text-lg font-medium text-gray-700">
              {processing ? 'Processing videos...' : 'Drop video files here or click to browse'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports MP4, WebM, OGG, MOV, AVI files
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {processing && (
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {Math.round(progress)}% complete
            </p>
          </div>
        )}
      </div>

      {/* Generated Thumbnails */}
      {generatedThumbnails.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bosenAlt text-black/80">
              GENERATED THUMBNAILS ({generatedThumbnails.length})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={downloadAllThumbnails}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Download size={16} />
                Download All
              </button>
              <button
                onClick={clearThumbnails}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <X size={16} />
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {generatedThumbnails.map((item, index) => (
              <ThumbnailPreview
                key={index}
                data={item}
                index={index}
                onDownload={(thumbnailUrl, fileName) => downloadThumbnail(thumbnailUrl, fileName)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ThumbnailPreviewProps {
  data: VideoThumbnailData;
  index: number;
  onDownload: (thumbnailUrl: string, fileName: string) => void;
}

function ThumbnailPreview({ data, index, onDownload }: ThumbnailPreviewProps) {
  const [showVideo, setShowVideo] = useState(false);

  const handleDownload = () => {
    const fileName = `thumbnail-${String(index + 1).padStart(2, '0')}.jpg`;
    onDownload(data.thumbnail, fileName);
  };

  return (
    <div className="relative group">
      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
        {showVideo ? (
          <video
            src={data.src}
            className="w-full h-full object-cover"
            controls
            preload="metadata"
          />
        ) : (
          <img
            src={data.thumbnail}
            alt={`Thumbnail ${index + 1}`}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Overlay Controls */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-lg">
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowVideo(!showVideo)}
            className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            title={showVideo ? "Show thumbnail" : "Show video"}
          >
            {showVideo ? <Image size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            title="Download thumbnail"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-600 mt-2 text-center font-medium">
        {data.title}
      </p>
    </div>
  );
}

export default ThumbnailUploader;