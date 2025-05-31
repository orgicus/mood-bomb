import React from 'react';
import { Video, Sparkles, Heart } from 'lucide-react';

interface VideoPreviewProps {
  uploadedImage: string | null;
  videoPrompt: string;
  friendMessage: string;
  onCreateVideo: () => void;
  finalVideoUrl?: string | null;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ 
  uploadedImage, 
  videoPrompt, 
  friendMessage, 
  onCreateVideo, 
  finalVideoUrl
}) => {
  const isReady = uploadedImage && videoPrompt && friendMessage;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border-4 border-green-200">
      <h3 className="text-2xl font-bold text-green-800 mb-4 text-center">
        🎬 Video Preview
      </h3>
      
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border-3 border-green-200">
        {finalVideoUrl ? (
          <video 
            src={finalVideoUrl} 
            controls 
            className="w-full h-48 object-cover rounded-xl border-2 border-green-300"
          />
        ) : (
          uploadedImage ? (
            <div className="relative">
              <img 
                src={uploadedImage} 
                alt="Preview" 
                className="w-full h-48 object-cover rounded-xl border-2 border-green-300"
              />
              {videoPrompt && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Sparkles size={12} />
                  Effects: {videoPrompt.slice(0, 20)}...
                </div>
              )}
              {friendMessage && (
                <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 text-white p-3 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart size={14} />
                    <span className="text-xs font-semibold">Your Message:</span>
                  </div>
                  <p className="text-sm">{friendMessage}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-48 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Video size={48} className="mx-auto mb-2" />
                <p>Upload an image to see preview</p>
              </div>
            </div>
          )
        )}
      </div>
      
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${uploadedImage ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className={`text-sm ${uploadedImage ? 'text-green-700 font-semibold' : 'text-gray-500'}`}>
            Photo uploaded
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${videoPrompt ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className={`text-sm ${videoPrompt ? 'text-green-700 font-semibold' : 'text-gray-500'}`}>
            Video effects added
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${friendMessage ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className={`text-sm ${friendMessage ? 'text-green-700 font-semibold' : 'text-gray-500'}`}>
            Friend message written
          </span>
        </div>
      </div>
      
      <button
        onClick={onCreateVideo}
        disabled={!isReady}
        className={`w-full mt-6 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
          isReady
            ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 hover:scale-105 shadow-lg'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isReady ? '🎉 Create Magic Video!' : '⚠️ Complete all steps above'}
      </button>
    </div>
  );
};

export default VideoPreview;