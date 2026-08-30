import os
import shutil
import numpy as np
import librosa
import joblib
import warnings
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Suppress warnings
warnings.filterwarnings('ignore')

app = FastAPI(title="Baby Cry Analysis Service")

# CORS (Allow all for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
N_FFT = 2048
HOP_LENGTH = 512
WIN_LENGTH = 2048
WINDOW = 'hann'
N_MELS = 128
N_BANDS = 7
FMIN = 50

# Global Model Variables
model = None
le = None

@app.on_event("startup")
def load_models():
    global model, le
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, 'model.joblib')
    label_path = os.path.join(script_dir, 'label.joblib')

    try:
        if os.path.exists(model_path) and os.path.exists(label_path):
            model = joblib.load(model_path)
            le = joblib.load(label_path)
            print("Models loaded successfully.")
        else:
            print("Warning: Model files not found. Service will return errors.")
    except Exception as e:
        print(f"Error loading models: {e}")

def extract_features(file_path):
    try:
        y, sr = librosa.load(file_path, sr=16000)
        
        # MFCC
        mfcc = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40, n_fft=N_FFT, hop_length=HOP_LENGTH, win_length=WIN_LENGTH, window=WINDOW).T, axis=0)
        
        # Mel Spectrogram
        mel = np.mean(librosa.feature.melspectrogram(y=y, sr=sr, n_fft=N_FFT, hop_length=HOP_LENGTH, win_length=WIN_LENGTH, window=WINDOW, n_mels=N_MELS).T, axis=0)
        
        # STFT
        stft = np.abs(librosa.stft(y, n_fft=N_FFT, hop_length=HOP_LENGTH, win_length=WIN_LENGTH, window=WINDOW))
        
        # Chroma
        chroma = np.mean(librosa.feature.chroma_stft(S=stft, y=y, sr=sr, n_fft=N_FFT, hop_length=HOP_LENGTH, win_length=WIN_LENGTH, window=WINDOW).T, axis=0)
        
        # Spectral Contrast
        contrast = np.mean(librosa.feature.spectral_contrast(S=stft, y=y, sr=sr, n_fft=N_FFT, hop_length=HOP_LENGTH, win_length=WIN_LENGTH, n_bands=N_BANDS, fmin=FMIN).T, axis=0)
        
        # Tonnetz
        tonnetz = np.mean(librosa.feature.tonnetz(y=y, sr=sr).T, axis=0)
        
        features = np.concatenate((mfcc, chroma, mel, contrast, tonnetz))
        return features
    except Exception as e:
        print(f"Feature extraction error: {e}")
        return None

@app.get("/")
def health_check():
    return {"status": "ok", "service": "cry-analysis"}

@app.post("/analyze")
async def analyze_cry(file: UploadFile = File(...)):
    if not model or not le:
        raise HTTPException(status_code=503, detail="Models not loaded")

    # Save temp file
    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        features = extract_features(temp_filename)
        
        if features is None:
            return {
                "pattern": "Unclear",
                "confidence": 0.0,
                "message": "Could not process audio."
            }
            
        features = features.reshape(1, -1)
        
        # Predict
        print(f"Feature shape: {features.shape}")
        print(f"Model type: {type(model).__name__}")
        print(f"Has predict_proba: {hasattr(model, 'predict_proba')}")
        
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(features)[0]
            pred_idx = np.argmax(probs)
            confidence = float(probs[pred_idx])
            raw_label = le.inverse_transform([pred_idx])[0]
            print(f"Probabilities: {probs}")
            print(f"Predicted index: {pred_idx}, Label: {raw_label}, Confidence: {confidence}")
        else:
            prediction = model.predict(features)
            raw_label = le.inverse_transform(prediction)[0]
            confidence = 0.5
            print(f"Model has no predict_proba, using default confidence")
            print(f"Predicted label: {raw_label}")

        # Map to Awareness Categories
        label = raw_label.lower()
        pattern = "Unclear"
        
        print(f"Raw label (lowercase): {label}")
        
        if confidence >= 0.4:
            if 'hunger' in label:
                pattern = "Hunger-related"
            elif 'tired' in label or 'sleep' in label:
                pattern = "Sleep-related"
            elif 'pain' in label or 'burp' in label or 'discomfort' in label:
                pattern = "Discomfort-related"
        
        print(f"Final pattern: {pattern}, confidence: {confidence}")

        return {
            "pattern": pattern,
            "confidence": confidence
        }

    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail="Analysis failed")
        
    finally:
        # Cleanup
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
