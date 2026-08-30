# 🏥 Aal is Well – Maternal & Infant Care Platform

**Aal is Well** is a robust, full-stack platform designed to bridge the gap between parents and quality healthcare. It leverages AI, Machine Learning, and standard medical guidelines to provide a comprehensive companion for the journey from pregnancy to early childhood.

Aligning with **SDG-3: Good Health and Well-Being**, the platform focuses on maternal safety, infant health, and ethical AI-driven assistance.

---

## 🌟 Key Features

### 🚀 Smart Dashboards
- **Pregnancy Journey**: Weekly progress tracking, development visualization, and EDD calculation (based on LMP).
- **Infant Care**: Dynamic switch to baby tracking after birth, age calculation in months, and tailored care modules.

### 🤖 AI & Machine Learning
- **AI Health Assistant**: Multilingual chatbot (English, Hindi, Marathi, Gujarati) powered by **Groq LLM** for health queries.
- **Cry Analysis**: Python-based ML module that analyzes baby cries to detect hunger, fatigue, or pain.
- **RAG Service**: Knowledge-based retrieval for specialized maternal and infant care advice.

### 📅 Medical & Care Tracking
- **Vaccination Management**: Automated schedules based on birth date (BCG, Polio, DPT, MMR, etc.).
- **Routine Scheduling**: Track feeding, sleep cycles, and medication.
- **Digital Diary**: Store baby moments, mood tracking, and medical observations.

### 📞 Safety & Connectivity
- **Doctor Portal**: Dedicated access for medical professionals to monitor progress and leave notes.
- **Emergency SOS**: Instant alerts via **Twilio** (Calls/SMS) to family and hospitals.

---

## 🛠️ Technical Architecture

### **Technology Stack**
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui.
- **Backend**: Node.js, Express, TypeScript, Mongoose.
- **Database**: MongoDB Atlas (Primary), Firebase (Auth & Storage).
- **ML/AI Services**: Python, Groq LLM, LangChain, Librosa (Audio Processing).
- **Communication**: Twilio API.

### **Project Structure**
```text
HM035_HackMatrix/
├── frontend/             # React/Vite Frontend
├── backend/              # Node.js/Express API Server
├── cry-analysis/         # Python ML Module (Cry classification)
├── rag-service/          # Knowledge retrieval service
└── experiments/          # Research & Prototyping
```

---

## 🚀 Getting Started

### 📋 Prerequisites
- Node.js (v18+)
- Python 3.9+
- MongoDB Atlas Account
- Firebase Project (Service Account JSON)

### 📥 Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/JayPaunikar/HM035_HackMatrix.git
   cd HM035_HackMatrix
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Create .env with VITE_API_URL, VITE_GROQ_API_KEY, etc.
   ```

3. **Backend Setup**
   ```bash
   cd ../backend
   npm install
   # Create .env with MONGODB_URI, FIREBASE_SERVICE_ACCOUNT_PATH, etc.
   ```

4. **Service Setup (Cry Analysis / RAG)**
   ```bash
   cd ../cry-analysis # or rag-service
   pip install -r requirements.txt
   ```

### 🏃 Running Locally

You can use the PowerShell helper script for a unified start:
```powershell
.\start-dev.ps1
```

Or start manually:
- **Backend**: `cd backend && npm run dev`
- **Frontend**: `cd frontend && npm run dev`

---

## 👨‍💻 Team Jhatpat

- **Jay Paunikar** ([GitHub](https://github.com/JayPaunikar))
- **Srushti Rokade** ([GitHub](https://github.com/ssrok))
- **Nikita Kapse** ([GitHub](https://github.com/Nikita-Kapse))
- **Raj Kakade** ([GitHub](https://github.com/kakaderaj23))

---

## 💙 Final Note
*Aal is Well is not just an application — it is a trusted digital companion that supports parents with clarity, confidence, and care during one of the most important phases of life.*
