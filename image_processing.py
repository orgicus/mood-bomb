"""
1. service to process user image from Supabase
    1. validate the Supabase URL
    2. upload the result URL to fal background removal
    3. store output video somewhere
2. service to take in effects prompt:
    - input = background removal result
    - prompt (can contain effects)
3. service to take in prompt to generate audio
    - use elevenlabs api script
    - store result
4. service to put it together
    - video effects .mp4 file
    - eleven labs .mp3 file
    - send to fal for lipsync
    - store result
5. when done notify/email URL
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from pathlib import Path
from dotenv import load_dotenv
import fal_client
import time
import tempfile
import requests
from supabase import create_client

# Load environment variables
load_dotenv()

# Configure ElevenLabs
ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')
ELEVENLABS_VOICE_ID = os.getenv('ELEVENLABS_VOICE_ID', 'default_voice_id')

# Initialize Supabase client
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:8080", "http://127.0.0.1:8080"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

def validate_supabase_url(image_url):
    """
    Validate that the provided URL is a valid Supabase storage URL
    """
    try:
        # Check if the URL is from your Supabase storage
        if not image_url.startswith(os.getenv('SUPABASE_URL')):
            print(f"Invalid Supabase URL: {image_url}")
            return None
            
        # Verify the file exists in Supabase
        file_path = image_url.split('/')[-1]  # Get the filename from URL
        result = supabase.storage \
            .from_('user-images') \
            .get_public_url(file_path)
            
        if result:
            print(f"Valid Supabase URL: {image_url}")
            return image_url
        return None
    except Exception as e:
        print(f"Error validating Supabase URL: {str(e)}")
        return None

def remove_background(image_url):
    """
    Remove background from image using fal.ai
    """
    def on_queue_update(update):
        if isinstance(update, fal_client.InProgress):
            for log in update.logs:
                print(log["message"])

    try:
        result = fal_client.subscribe(
            "fal-ai/bria/background/remove",
            arguments={
                "image_url": image_url
            },
            with_logs=True,
            on_queue_update=on_queue_update,
        )
        return result
    except Exception as e:
        print(f"Error removing background: {str(e)}")
        return None

def generate_video_effects(background_removed_url, effects_prompt):
    """
    Generate video with effects using fal-ai pixverse
    """
    def on_queue_update(update):
        if isinstance(update, fal_client.InProgress):
            for log in update.logs:
                print(log["message"])

    try:
        result = fal_client.subscribe(
            "fal-ai/pixverse/v4.5/image-to-video/fast",
            arguments={
                "image_url": background_removed_url,
                "prompt": effects_prompt,
            },
            with_logs=True,
            on_queue_update=on_queue_update,
        )
        return result
    except Exception as e:
        print(f"Error generating video effects: {str(e)}")
        return None

def generate_audio_elevenlabs(message):
    """
    Generate audio from text using ElevenLabs API
    """
    try:
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY
        }
        
        data = {
            "text": message,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5
            }
        }
        
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code == 200:
            # Save audio to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
                temp_file.write(response.content)
                temp_file.flush()
                
                # Upload to Supabase storage
                file_name = f"audio_{int(time.time())}.mp3"
                with open(temp_file.name, 'rb') as f:
                    supabase.storage \
                        .from_('generated-audio') \
                        .upload(file_name, f)
                
                # Get public URL
                audio_url = supabase.storage \
                    .from_('generated-audio') \
                    .get_public_url(file_name)
                
                # Clean up temp file
                os.unlink(temp_file.name)
                
                return audio_url
        else:
            print(f"ElevenLabs API error: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"Error generating audio: {str(e)}")
        return None

def sync_lips(video_url, audio_url):
    """
    Sync lips using fal.ai lipsync service
    """
    def on_queue_update(update):
        if isinstance(update, fal_client.InProgress):
            for log in update.logs:
                print(log["message"])

    try:
        result = fal_client.subscribe(
            "veed/lipsync",
            arguments={
                "video_url": video_url,
                "audio_url": audio_url
            },
            with_logs=True,
            on_queue_update=on_queue_update,
        )
        return result
    except Exception as e:
        print(f"Error syncing lips: {str(e)}")
        return None

def store_final_video(video_url):
    """
    Download the final video from fal.ai and store it in Supabase
    """
    try:
        # Download the video from fal.ai
        response = requests.get(video_url)
        if response.status_code != 200:
            print(f"Error downloading video: {response.status_code}")
            return None

        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_file:
            temp_file.write(response.content)
            temp_file.flush()
            
            # Upload to Supabase storage
            file_name = f"final_video_{int(time.time())}.mp4"
            with open(temp_file.name, 'rb') as f:
                supabase.storage \
                    .from_('final-videos') \
                    .upload(file_name, f)
            
            # Get public URL
            final_url = supabase.storage \
                .from_('final-videos') \
                .get_public_url(file_name)
            
            # Clean up temp file
            os.unlink(temp_file.name)
            
            return final_url
    except Exception as e:
        print(f"Error storing final video: {str(e)}")
        return None

@app.route('/process-video', methods=['POST'])
def process_video():
    """
    Main endpoint to process video with the complete pipeline
    """
    try:
        # Validate request
        if 'image_url' not in request.json:
            return jsonify({'error': 'No image URL provided'}), 400
        
        if 'effects_prompt' not in request.json:
            return jsonify({'error': 'No effects_prompt provided'}), 400
            
        if 'message' not in request.json:
            return jsonify({'error': 'No message provided'}), 400

        image_url = request.json['image_url']
        effects_prompt = request.json['effects_prompt']
        message = request.json['message']

        # Validate the Supabase URL
        validated_url = validate_supabase_url(image_url)
        if not validated_url:
            return jsonify({'error': 'Invalid image URL'}), 400

        try:
            # Step 1: Remove background (using the validated Supabase URL)
            print("Step 1: Removing background...")
            background_result = remove_background(validated_url)
            if not background_result or 'image' not in background_result:
                return jsonify({'error': 'Failed to remove background'}), 500
            
            background_removed_url = background_result['image']['url']

            # Step 2: Generate video with effects
            print("Step 2: Generating video with effects...")
            video_result = generate_video_effects(background_removed_url, effects_prompt)
            if not video_result or 'video' not in video_result:
                return jsonify({'error': 'Failed to generate video effects'}), 500
            
            video_url = video_result['video']['url']

            # Step 3: Generate audio from message
            print("Step 3: Generating audio...")
            audio_url = generate_audio_elevenlabs(message)
            if not audio_url:
                return jsonify({'error': 'Failed to generate audio'}), 500

            # Step 4: Sync lips
            print("Step 4: Syncing lips...")
            lipsync_result = sync_lips(video_url, audio_url)
            if not lipsync_result or 'video' not in lipsync_result:
                return jsonify({'error': 'Failed to sync lips'}), 500

            # Step 5: Store final video in Supabase
            print("Step 5: Storing final video...")
            final_video_url = store_final_video(lipsync_result['video']['url'])
            if not final_video_url:
                return jsonify({'error': 'Failed to store final video'}), 500

            return jsonify({
                'success': True,
                'video_url': final_video_url
            })

        except Exception as e:
            print(f"Error in video processing pipeline: {str(e)}")
            return jsonify({'error': str(e)}), 500

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Video processing server is running'})

@app.route('/', methods=['GET'])
def home():
    """Basic info endpoint"""
    return jsonify({
        'message': 'Video Processing API',
        'endpoints': {
            'process_video': 'POST /process-video - Process image with effects and audio',
            'health': 'GET /health - Health check'
        },
        'required_params': {
            'image_url': 'String - Supabase URL of uploaded image',
            'effects_prompt': 'String - Video effects description',
            'message': 'String - Text to convert to speech'
        }
    })

if __name__ == "__main__":
    # Check required environment variables
    required_env_vars = [
        'SUPABASE_URL',
        'SUPABASE_KEY',
        'ELEVENLABS_API_KEY',
        'FAL_KEY'  # fal_client uses FAL_KEY
    ]
    
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    if missing_vars:
        print(f"Missing required environment variables: {', '.join(missing_vars)}")
        print("Please set these in your .env file")
        exit(1)
    
    print("Starting video processing server...")
    print("Required environment variables found")
    print("Server will be available at http://localhost:9887")
    print("\nEndpoints:")
    print("  POST /process-video - Main processing endpoint")
    print("  GET /health - Health check")
    print("  GET / - API info")
    
    app.run(debug=True, host='0.0.0.0', port=9887)