
import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import TextPromptInput from '../components/TextPromptInput';
import MessageInput from '../components/MessageInput';
import VideoPreview from '../components/VideoPreview';
import { Sparkles, Heart, Video } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [friendMessage, setFriendMessage] = useState('');

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      toast.success('📸 Photo uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    toast.success('Photo removed');
  };

  const handleCreateVideo = () => {
    toast.success('🎬 Video creation started! (This would integrate with video generation API)');
  };

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
