import axios from 'axios';

// Use environment variable for API URL with fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9887';

export async function processVideo(
  imageUrl: string,
  effectsPrompt: string,
  message: string
): Promise<string> {
  try {
    const response = await axios.post(`${API_BASE_URL}/process-video`, {
      image_url: imageUrl,
      effects_prompt: effectsPrompt,
      message: message
    });

    if (response.data.success) {
      return response.data.video_url;
    } else {
      throw new Error(response.data.error || 'Failed to process video');
    }
  } catch (error) {
    console.error('Error processing video:', error);
    throw error;
  }
} 