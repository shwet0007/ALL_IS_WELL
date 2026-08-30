# Baby Cry Analysis Service

This service provides machine learning analysis for infant cry patterns.

## Prerequisites
- Python 3.8+
- Pre-trained models: `model.joblib`, `label.joblib` (in this directory)

## Setup
1. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage
Called by the Backend server via child_process.
```bash
python predict.py /path/to/audio/file.webm
```

## Output
JSON object with `pattern`, `confidence`, and `message`.
