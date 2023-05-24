import sys
import librosa
from sklearn.metrics.pairwise import cosine_similarity
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io

app = Flask(__name__)
CORS(app)

@app.route('/audio_similarity', methods=['POST'])
def calculate_audio_similarity():
    # Get the JSON data from the request
    data = request.get_json()
    print("got_data")
    # Extract the audio data from the JSON
    original_audio = data['original_audio']
    plagiarized_audio = data['plagiarized_audio']
    original_audio_arr = []
    for audio in original_audio:
        temp = base64.b64decode(audio)
        original_audio_arr.append(temp)
    plagiarizedAudio = base64.b64decode(plagiarized_audio)
    plagiarizedAudioData, plagiarized_sr = librosa.load(io.BytesIO(plagiarizedAudio), sr=None)

    res = {}

    for originalAudio in original_audio_arr:
        originalAudioData, original_sr = librosa.load(io.BytesIO(originalAudio), sr=None)
        original_mfcc = librosa.feature.mfcc(y=originalAudioData, sr=original_sr)
        plagiarized_mfcc = librosa.feature.mfcc(y=plagiarizedAudioData, sr=plagiarized_sr)
        original_mfcc = original_mfcc.reshape(-1, original_mfcc.shape[0])
        plagiarized_mfcc = plagiarized_mfcc.reshape(-1, plagiarized_mfcc.shape[0])
        similarity = cosine_similarity(original_mfcc.T, plagiarized_mfcc.T)
        if similarity[0][0]>0.8:
            res[original_audio_arr.index(originalAudio)]=int(similarity[0][0])

    print(res)
    return jsonify(res)
        
if __name__ == '__main__':
    app.run(port=8000)
