import sys
import os
import json
import numpy as np
import librosa
import joblib
import warnings

# Suppress warnings
warnings.filterwarnings('ignore')

# Constants (Matched to analyze_cry.py to ensure model compatibility)
n_fft = 2048
hop_length = 512
win_length = 2048
window = 'hann'
n_mels = 128
n_bands = 7
fmin = 50

def extract_features(file_path):
    try:
        y, sr = librosa.load(file_path, sr=16000)
        
        # MFCC
        mfcc = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40, n_fft=n_fft, hop_length=hop_length, win_length=win_length, window=window).T, axis=0)
        
        # Mel Spectrogram
        mel = np.mean(librosa.feature.melspectrogram(y=y, sr=sr, n_fft=n_fft, hop_length=hop_length, win_length=win_length, window=window, n_mels=n_mels).T, axis=0)
        
        # STFT
        stft = np.abs(librosa.stft(y, n_fft=n_fft, hop_length=hop_length, win_length=win_length, window=window))
        
        # Chroma
        chroma = np.mean(librosa.feature.chroma_stft(S=stft, y=y, sr=sr, n_fft=n_fft, hop_length=hop_length, win_length=win_length, window=window).T, axis=0)
        
        # Spectral Contrast
        contrast = np.mean(librosa.feature.spectral_contrast(S=stft, y=y, sr=sr, n_fft=n_fft, hop_length=hop_length, win_length=win_length, n_bands=n_bands, fmin=fmin).T, axis=0)
        
        # Tonnetz
        tonnetz = np.mean(librosa.feature.tonnetz(y=y, sr=sr).T, axis=0)
        
        features = np.concatenate((mfcc, chroma, mel, contrast, tonnetz))
        return features
    except Exception as e:
        # print(f"Error in feature extraction: {str(e)}", file=sys.stderr)
        return None

def predict(file_path):
    # Paths to models (in sibling directory ml_models)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, 'model.joblib')
    label_path = os.path.join(script_dir, 'label.joblib')

    if not os.path.exists(model_path) or not os.path.exists(label_path):
        return {"error": "Model files not found"}

    try:
        model = joblib.load(model_path)
        le = joblib.load(label_path)
    except Exception as e:
        return {"error": f"Failed to load model: {str(e)}"}

    features = extract_features(file_path)
    if features is None:
        return {"error": "Could not process audio file"}

    try:
        features = features.reshape(1, -1)
        
        # Predict
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(features)[0]
            pred_idx = np.argmax(probs)
            confidence = float(probs[pred_idx])
            raw_label = le.inverse_transform([pred_idx])[0]
        else:
            prediction = model.predict(features)
            raw_label = le.inverse_transform(prediction)[0]
            confidence = 0.5 # Default if no proba

        return {
            "raw_label": raw_label,
            "confidence": confidence
        }
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file provided"}))
        sys.exit(1)

    result = predict(sys.argv[1])
    print(json.dumps(result))
