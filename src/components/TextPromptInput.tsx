
import React from 'react';
import { Sparkles } from 'lucide-react';

interface TextPromptInputProps {
  value: string;
  onChange: (value: string) => void;
}

const TextPromptInput: React.FC<TextPromptInputProps> = ({ value, onChange }) => {
  const suggestions = [
    "Add rainbow unicorns in the background",
    "Make it rain confetti and balloons",
    "Add magical sparkles and stars",
    "Put me in a tropical paradise",
    "Add disco lights and party vibes",
    "Make it look like I'm floating in space"
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border-4 border-blue-200">
      <h3 className="text-2xl font-bold text-blue-800 mb-4 text-center">
        ✨ Video Magic Effects
      </h3>
      
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe the magical effects you want to add..."
          className="w-full h-32 p-4 border-3 border-blue-200 rounded-2xl text-lg resize-none focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
        />
        <Sparkles className="absolute top-4 right-4 w-6 h-6 text-blue-400" />
      </div>
      
      <div className="mt-4">
        <p className="text-sm font-semibold text-blue-700 mb-2">💡 Try these ideas:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onChange(suggestion)}
              className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-xs hover:from-blue-200 hover:to-purple-200 transition-all duration-200 hover:scale-105"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextPromptInput;
