import React, { useState } from 'react';
import { Settings, Upload, Eye, EyeOff } from 'lucide-react';
import { ThumbnailUploader } from './ThumbnailUploader';
import { VideoThumbnailData } from '../utils/thumbnailGenerator';

interface AdminPanelProps {
  onVideoDataUpdate?: (videos: VideoThumbnailData[]) => void;
}

export function AdminPanel({ onVideoDataUpdate }: AdminPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload');

  const handleThumbnailsGenerated = (thumbnails: VideoThumbnailData[]) => {
    onVideoDataUpdate?.(thumbnails);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 p-3 bg-black/80 text-white rounded-full hover:bg-black/90 transition-colors backdrop-blur-sm"
        title="Open Admin Panel"
      >
        <Settings size={20} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-4 bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bosenAlt text-black/90">
            ADMIN PANEL
          </h1>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <EyeOff size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'upload'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Upload size={16} className="inline mr-2" />
            Upload & Generate
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'manage'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Eye size={16} className="inline mr-2" />
            Manage Videos
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto h-full">
          {activeTab === 'upload' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Generate Thumbnails from Videos
                </h2>
                <p className="text-gray-600">
                  Upload your video files to automatically generate 1-second preview thumbnails. 
                  This will significantly improve loading performance on your portfolio.
                </p>
              </div>
              
              <ThumbnailUploader onThumbnailsGenerated={handleThumbnailsGenerated} />
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Upload your video files using the area above</li>
                  <li>2. Thumbnails are automatically generated from the 1-second mark</li>
                  <li>3. Download the thumbnails and upload them to your `/public/thumbnails/` folder</li>
                  <li>4. Update your video data to include the thumbnail paths</li>
                  <li>5. Your portfolio will now load much faster with instant previews!</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'manage' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Video Management
                </h2>
                <p className="text-gray-600">
                  Manage your video portfolio and thumbnail associations.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <Image size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">
                  Video management features coming soon. For now, use the upload tab to generate thumbnails.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;