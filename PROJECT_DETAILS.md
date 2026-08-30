# **AAL IS WELL – Maternal & Infant Care Platform**

## **📌 Project Overview**
**Aal is Well** is a comprehensive Maternal and Infant Care Platform designed to support parents from pregnancy through early childhood. It provides preventive care guidance, personalized reminders, health awareness, and secure doctor connectivity in a unified, trusted space.

The platform is built with a focus on **SDG-3: Good Health and Well-Being**, specifically targeting maternal safety and infant health through ethical AI-driven assistance. It leverages AI, Machine Learning, and standard medical guidelines to provide a comprehensive companion for the journey from pregnancy to early childhood.

---

## **🚀 Feature Breakdown**

### 1. Unified Parent Dashboard
The application features a dynamic dashboard that adapts based on the user's role:
- **Pregnancy Journey**: Tracks weekly progress, visualizes development with a progress bar, and calculates the Estimated Date of Delivery (EDD) based on the Last Menstrual Period (LMP).
- **Infant Care**: Swaps to baby tracking after birth. It calculates the baby's age in months from the Date of Birth (DOB) and provides tailored care modules.

### 2. AI & Machine Learning Integration
- **AI Health Assistant**: A multilingual (English, Hindi, Marathi, Gujarati) chatbot powered by Groq LLM. It acts as a first point of contact for health queries and advice.
- **Cry Analysis**: A sophisticated Python-based ML module that analyzes audio recordings of baby cries to help parents understand if the baby is hungry, tired, or in pain.
- **Diet Planner**: Generates personalized weekly nutrition plans for mothers and age-appropriate food introduction schedules for infants.
- **Baby-Style Emotional Reminders**: Loving, mother-baby bonding messages ("Mummaaa, time for my medicine!") to make care tasks feel more personal.
- **RAG Service**: Retrieval Augmented Generation service for providing accurate medical knowledge and advice.

### 3. Medical & Care Tracking
- **Vaccination Management**: Automated schedule based on birth date, highlighting mandatory vaccines (BCG, Polio, DPT, MMR, etc.) and their due dates.
- **Routine Scheduling**: Tracks daily tasks such as feeding sessions, sleep cycles, and medication.
- **Medical Reports & Notes**: Secure storage for digital health records, test results, and doctor consultation notes.
- **Daily One Step Ahead**: Informative daily health check-ins and guidance.

### 4. Professional Connectivity
- **Doctor Portal / Patient-Doctor Rooms**: Dedicated space for medical professionals to monitor patient progress, view reports, and provide specialized care via secure consultation rooms.

### 5. Safety & SOS System
- **Emergency SOS**: A critical feature that initiates instant alerts.
- **Automated Communication**: Integrated with Twilio for backup emergency calls and SMS to primary contacts and hospitals.

---

## **🛠️ Technology Stack**

### **Frontend**
- **Framework**: React 18 with Vite for high-performance builds.
- **Language**: TypeScript for type safety.
- **UI System**: 
    - **Tailwind CSS**: For custom, responsive utility-first styling.
    - **shadcn/ui**: For accessible, high-quality components (Dialogs, Tabs, Cards).
    - **Lucide React**: For consistent, modern iconography.
- **State Management**: React Hooks, Context API.
- **Utilities**: `date-fns` for precise date/age calculations.

### **Backend**
- **Runtime**: Node.js with Express.
- **Language**: TypeScript for shared types between frontend and backend.
- **Database**: MongoDB Atlas (via Mongoose) for robust document storage.
- **Authentication**: Firebase Admin SDK for secure user management.
- **Integrations**:
    - **Twilio**: For telecommunication services (Emergency Calls).
    - **Groq API / LangChain**: For large language model (LLM) orchestration.
    - **Sarvam AI**: For multilingual/voice support.

### **Specialized AI Services**
- **Cry Analysis**: Python-based service (Flask/FastAPI) using `librosa` and `joblib` for audio processing and classification.
- **RAG Service**: Python-based service for medical knowledge retrieval.

---

## **📂 Directory Layout**

```text
HM035_HackMatrix/
├── frontend/                # React Vite Frontend Application
│   ├── src/
│   │   ├── components/      # UI components (shadcn/ui, custom)
│   │   ├── pages/           # Main application pages (Dashboard, Diary, Diet)
│   │   ├── lib/             # Utilities (api, db, firebase)
│   │   ├── utils/           # Helper functions (babyReminderMessages)
│   │   └── contexts/        # React Contexts (AuthContext)
│   └── package.json         # Frontend dependencies
│
├── backend/                 # Main Node.js/Express Backend
│   ├── src/
│   │   ├── models/          # Mongoose Schemas (User, Schedule, Checkup)
│   │   ├── routes/          # API Route definitions
│   │   ├── utils/           # Backend utilities (cron, reminder.util)
│   │   ├── middleware/      # Auth & Error handling middleware
│   │   ├── services/        # Service integrations (Groq, Scheduler, Notification)
│   │   └── config/          # DB & Env configurations
│   └── package.json         # Backend dependencies
│
├── cry-analysis/            # Python AI service for infant cry analysis
│   ├── main.py              # Service entry point
│   ├── model.joblib         # Trained machine learning model
│   └── analyze_cry.py       # Analysis logic
│
├── rag-service/             # Retrieval Augmented Generation service
│   ├── main.py              # Knowledge retrieval API
│   └── data/                # Medical data for the knowledge base
│
├── server/                  # Alternative/Legacy Express Server
├── start-dev.ps1            # PowerShell script to start full stack dev env
└── README.md                # Project README & Setup Guide
```

---

## **🚀 Development Setup**

### **Prerequisites**
- Node.js & npm
- Python (for Cry Analysis & RAG)
- MongoDB Connection
- Firebase Project (Service Account Key)

### **Starting the Application**
The easiest way to start both frontend and backend is using the provided script:
```powershell
.\start-dev.ps1
```

Or manually:
1. **Backend**: `cd backend && npm install && npm run dev`
2. **Frontend**: `cd frontend && npm install && npm run dev`

---

## **👥 Team Jhatpat**
- **Jay Paunikar**
- **Srushti Rokade**
- **Nikita Kapse**
- **Raj Kakade**
