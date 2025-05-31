
import React from 'react';
import { Heart } from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ value, onChange }) => {
  const suggestions = [
    "Happy Birthday! 🎉",
    "Congratulations! 🎊",
    "Miss you so much! 💕",
    "Thinking of you! 🌟",
    "You're amazing! ⭐",
    "Have the best day ever! 🌈"
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border-4 border-pink-200">
      <h3 className="text-2xl font-bold text-pink-800 mb-4 text-center">
        💌 Message to Friend
      </h3>
      
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write a sweet message to your friend..."
          className="w-full h-32 p-4 border-3 border-pink-200 rounded-2xl text-lg resize-none focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all duration-300"
        />
        <Heart className="absolute top-4 right-4 w-6 h-6 text-pink-400" />
      </div>
      
      <div className="mt-4">
        <p className="text-sm font-semibold text-pink-700 mb-2">💖 Quick messages:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onChange(suggestion)}
              className="px-3 py-1 bg-gradient-to-r from-pink-100 to-red-100 text-pink-700 rounded-full text-xs hover:from-pink-200 hover:to-red-200 transition-all duration-200 hover:scale-105"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
