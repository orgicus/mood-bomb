import axios from 'axios';

const API_BASE_URL = 'http://localhost:9887';

export const processVideo = async (
  imageUrl: string,
  effectsPrompt: string,
  message: string
) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/process-video`, {
      image_url: imageUrl,
      effects_prompt: effectsPrompt,
      message: message
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error processing video:', error);
    throw error;
  }
}; 