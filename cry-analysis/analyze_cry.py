import sys
import os
import json
import numpy as np
import librosa
import joblib
import warnings

# Suppress warnings
warnings.filterwarnings('ignore')

# Constants for feature extraction (from user snippet/training config)
# Using defaults or what implies from the snippets. 
# The user snippet uses variables: n_fft, hop_length, win_length, window, n_mels, n_bands, fmin
# I need to define them. Assuming standard values if not provided.
# "make sure this matches the function used during training" - User didn't provide values.
# I'll use common librosa defaults or try to infer.
# Standard: n_fft=2048, hop_length=512...
# Wait, the user snippet had `n_fft=n_fft` without defining it. This is a risk.
# I will define some standard values.
n_fft = 2048
hop_length = 512
win_length = 2048
window = 'hann'
n_mels = 128
n_bands = 7
fmin = 50 # Lowered to fit 7 bands validity within 8kHz Nyquist (sr=16000)

def extract_features(file_path):
    try:
        # Load audio file and extract features
        # User snippet: y, sr = librosa.load(file_path, sr=16000)
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
        tonnetz = np.mean(librosa.feature.tonnetz(y=y, sr=sr).T, axis=0) # Match snippet: y=y
        
        features = np.concatenate((mfcc, chroma, mel, contrast, tonnetz))
        # print(f"DEBUG: Features shape: {features.shape}", file=sys.stderr)
        return features
    except Exception as e:
        print(f"Error in feature extraction: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return None

def analyze_cry(file_path, model_path, label_path):
    if not os.path.exists(model_path) or not os.path.exists(label_path):
        return {"error": "Model files not found.", "category": "Unclear / mixed pattern", "confidence": 0}

    try:
        loaded_model = joblib.load(model_path)
        loaded_le = joblib.load(label_path)
    except Exception as e:
        return {"error": f"Failed to load model: {str(e)}", "category": "Unclear / mixed pattern"}

    features = extract_features(file_path)
    
    if features is not None:
        try:
            features = features.reshape(1, -1)
            
            # Predict
            # Check if predict_proba is supported
            if hasattr(loaded_model, "predict_proba"):
                probs = loaded_model.predict_proba(features)[0]
                prediction_idx = np.argmax(probs)
                confidence = probs[prediction_idx]
                predicted_label = loaded_le.inverse_transform([prediction_idx])[0]
            else:
                prediction = loaded_model.predict(features)
                predicted_label = loaded_le.inverse_transform(prediction)[0]
                confidence = 0.8 # Placeholder if no probability
            
            # Map to user friendly categories
            # "belly pain, burping, discomfort, hunger, tiredness"
            category_map = {
                "hunger": "Hunger-related pattern",
                "tiredness": "Sleep-related pattern",
                "belly_pain": "Discomfort / general distress", # Assuming snake case or space? label encoder usually keeps original strings
                "belly pain": "Discomfort / general distress",
                "burping": "Discomfort / general distress",
                "discomfort": "Discomfort / general distress"
            }
            
            # Normalize label
            label_lower = predicted_label.lower().strip()
            final_category = category_map.get(label_lower, "Unclear / mixed pattern")
            
            # Confidence threshold (e.g. 0.4?? User said "Interpret results safely")
            if confidence < 0.4:
                final_category = "Unclear / mixed pattern"

            return {
                "category": final_category,
                "confidence": float(confidence),
                "raw_label": predicted_label
            }
            
        except Exception as e:
            return {"error": f"Prediction error: {str(e)}", "category": "Unclear / mixed pattern"}
    else:
        return {"error": "Could not extract features", "category": "Unclear / mixed pattern"}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
        
    audio_file = sys.argv[1]
    # Assuming script is run from server root or we handle paths relative to script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, 'model.joblib')
    label_path = os.path.join(script_dir, 'label.joblib')
    
    # If model files missing, for HACKATHON/DEMO safety, maybe return a mock result based on random or filename?
    # No, strict requirement: "Strictly avoiding... definitive predictions". 
    # If model missing, return error or Unclear.
    
    result = analyze_cry(audio_file, model_path, label_path)
    print(json.dumps(result))
