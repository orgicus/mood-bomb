
import React, { useState, useRef } from 'react';
import { Upload, Camera, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImageUploadProps {
  onImageUpload: (file: File, url: string) => void;
  uploadedImage: string | null;
  onRemoveImage: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, uploadedImage, onRemoveImage }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      uploadImageToSupabase(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadImageToSupabase(files[0]);
    }
  };

  const uploadImageToSupabase = async (file: File) => {
    setIsUploading(true);
    
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('user-images')
        .upload(fileName, file);

      if (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload image');
        return;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-images')
        .getPublicUrl(fileName);

      console.log('Image uploaded successfully:', publicUrl);
      onImageUpload(file, publicUrl);
      toast.success('📸 Photo uploaded successfully!');
      
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border-4 border-purple-200">
      <h3 className="text-2xl font-bold text-purple-800 mb-4 text-center">
        📸 Upload Your Photo
      </h3>
      
      {uploadedImage ? (
        <div className="relative">
          <img 
            src={uploadedImage} 
            alt="Uploaded" 
            className="w-full h-48 object-cover rounded-2xl border-4 border-pink-200"
          />
          <button
            onClick={onRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
            disabled={isUploading}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          className={`border-4 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragging 
              ? 'border-purple-500 bg-purple-50 scale-105' 
              : 'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-400 hover:scale-102'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold text-purple-800 mb-2">
                {isUploading ? 'Uploading...' : 'Drop your photo here!'}
              </p>
              <p className="text-sm text-purple-600">
                {isUploading ? 'Please wait...' : 'Or click to browse your files'}
              </p>
            </div>
            <Upload className={`w-6 h-6 text-purple-400 ${isUploading ? 'animate-spin' : 'animate-bounce'}`} />
          </div>
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};

export default ImageUpload;
