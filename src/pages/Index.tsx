import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import TextPromptInput from '../components/TextPromptInput';
import MessageInput from '../components/MessageInput';
import VideoPreview from '../components/VideoPreview';
import { Sparkles, Heart, Video, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { processVideo } from '../services/videoProcessing';

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [friendMessage, setFriendMessage] = useState('');
  const [isCreatingVideo, setIsCreatingVideo] = useState(false);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);

  const handleImageUpload = (file: File, url: string) => {
    console.log('Image uploaded:', { file, url });
    setUploadedImage(url);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    toast.success('Photo removed');
  };

  const handleCreateVideo = async () => {
    if (!uploadedImage || !videoPrompt || !friendMessage) {
      toast.error('Please complete all fields');
      return;
    }

    setIsCreatingVideo(true);
    toast.loading('🎬 Creating your magical video...');

    try {
      // Use the existing Supabase URL directly
      const result = await processVideo(uploadedImage, videoPrompt, friendMessage);

      // Update the UI with the result
      setFinalVideoUrl(result);
      toast.success('✨ Your magical video is ready!');
    } catch (error) {
      console.error('Error creating video:', error);
      toast.error('Failed to create video. Please try again.');
      setIsCreatingVideo(false);
    }
  };

  const handleBackToEditor = () => {
    setIsCreatingVideo(false);
  };

  if (isCreatingVideo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Video className="w-10 h-10 text-white" />
            <h1 className="text-5xl font-bold text-white">
              VideoMagic
            </h1>
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
          <p className="text-xl text-white opacity-90 font-medium">
            Your magical video is ready! ✨
          </p>
        </div>

        {/* Video Result Box */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-lg border-4 border-green-200">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBackToEditor}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Editor
              </button>
              <h2 className="text-2xl font-bold text-green-800">🎬 Your Magic Video</h2>
              <div></div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl aspect-video flex items-center justify-center border-4 border-dashed border-gray-300">
              {finalVideoUrl ? (
                <video 
                  src={finalVideoUrl} 
                  controls 
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div className="text-center text-gray-600">
                  <Video size={80} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-2xl font-bold mb-2">Processing Video...</h3>
                  <p className="text-lg">Your magical video is being created!</p>
                  <p className="text-sm mt-2 opacity-75">
                    This may take a few moments
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105">
                📱 Share Video
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl font-bold hover:from-green-600 hover:to-blue-600 transition-all duration-300 hover:scale-105">
                💾 Download Video
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-3 mb-4">
          <Video className="w-10 h-10 text-white" />
          <h1 className="text-5xl font-bold text-white">
            VideoMagic
          </h1>
          <Sparkles className="w-10 h-10 text-white animate-pulse" />
        </div>
        <p className="text-xl text-white opacity-90 font-medium">
          Create magical video messages for your friends! ✨
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input Components */}
          <div className="space-y-6">
            <ImageUpload 
              onImageUpload={handleImageUpload}
              uploadedImage={uploadedImage}
              onRemoveImage={handleRemoveImage}
            />
            
            <TextPromptInput 
              value={videoPrompt}
              onChange={setVideoPrompt}
            />
            
            <MessageInput 
              value={friendMessage}
              onChange={setFriendMessage}
            />
          </div>

          {/* Right Column - Preview */}
          <div>
            <VideoPreview 
              uploadedImage={uploadedImage}
              videoPrompt={videoPrompt}
              friendMessage={friendMessage}
              onCreateVideo={handleCreateVideo}
              finalVideoUrl={finalVideoUrl}
            />
          </div>
        </div>
      </div>

      {/* Fun floating elements */}
      <div className="fixed top-20 left-10 animate-bounce">
        <Heart className="w-8 h-8 text-pink-300 opacity-60" />
      </div>
      <div className="fixed top-40 right-20 animate-pulse">
        <Sparkles className="w-6 h-6 text-yellow-300 opacity-60" />
      </div>
      <div className="fixed bottom-32 left-20 animate-bounce" style={{ animationDelay: '1s' }}>
        <Video className="w-7 h-7 text-blue-300 opacity-60" />
      </div>
      <div className="fixed bottom-20 right-10 animate-pulse" style={{ animationDelay: '2s' }}>
        <Heart className="w-5 h-5 text-purple-300 opacity-60" />
      </div>
    </div>
  );
};

export default Index;
