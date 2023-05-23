import sys
import librosa
from sklearn.metrics.pairwise import cosine_similarity

def calculate_audio_similarity(original_audio_path, plagiarized_audio_path):
    print('hello')
    original_audio, original_sr = librosa.load(original_audio_path)
    plagiarized_audio, plagiarized_sr = librosa.load(plagiarized_audio_path)
    original_mfcc = librosa.feature.mfcc(y=original_audio, sr=original_sr)
    plagiarized_mfcc = librosa.feature.mfcc(y=plagiarized_audio, sr=plagiarized_sr)
    original_mfcc = original_mfcc.reshape(-1, original_mfcc.shape[0])
    plagiarized_mfcc = plagiarized_mfcc.reshape(-1, plagiarized_mfcc.shape[0])
    similarity = cosine_similarity(original_mfcc.T, plagiarized_mfcc.T)
    return similarity[0][0]


# Command-line arguments: original audio file path and plagiarized audio file path

if __name__ == "__main__":
    print('hello')
    original_audio_path = sys.argv[1]
    plagiarized_audio_path = sys.argv[2]


similarity_score = calculate_audio_similarity(original_audio_path, plagiarized_audio_path)
print(similarity_score)
