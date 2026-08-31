# Aal Is Well

Aal Is Well is a maternal and infant care platform for pregnancy tracking, infant routines, doctor connectivity, reminders, AI guidance, cry analysis, and emergency support.

The repository now uses this primary architecture:

```text
React + TypeScript
  -> Spring Boot + Spring Security + JWT
  -> MySQL + Spring Data JPA/Hibernate
  -> Python RAG service and Python cry-analysis service
```

Firebase Auth is not used. Application login is handled by Spring Boot JWT endpoints. Firebase remains only for client SDK features that still need it, such as Storage and Cloud Messaging/device tokens, and the Spring backend sends FCM pushes through the Firebase Admin Java SDK.

## Features

- Parent dashboards for pregnancy and infant care.
- Spring Security registration and login with JWT bearer tokens.
- MySQL-backed profiles, baby details, pregnancy details, schedules, reminders, notifications, diary entries, medical reports, doctor requests, checkups, analytics, and marketplace data.
- Doctor portal for patient connection requests, reports, notes, and checkup scheduling.
- Groq and Sarvam integrations through the Spring Boot backend.
- Python RAG and cry-analysis services called by Spring Boot over HTTP.
- Twilio emergency call integration.

## Project Structure

```text
HM035_HackMatrix-main/
├── frontend/          # React/Vite application
├── backend-spring/    # Primary Spring Boot API
├── rag-service/       # Python FastAPI RAG service
├── cry-analysis/      # Python infant cry-analysis service
├── experiments/       # Research and prototypes
├── .env.example       # Root environment template
└── start-dev.ps1      # Local frontend + Spring backend helper
```

## Prerequisites

- Java 17+
- Maven
- npm for the React frontend
- Python 3.9+ for the AI services
- MySQL

## Environment

Copy `.env.example` values into your local shell or service configuration. The Spring backend expects MySQL and JWT values such as:

```env
DB_URL=jdbc:mysql://localhost:3306/aal_is_well?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USERNAME=root
DB_PASSWORD=
JWT_SECRET=replace-with-at-least-32-random-characters
VITE_API_URL=http://localhost:3001
```

Set `GROQ_API_KEY`, `SARVAM_API_KEY`, `TWILIO_*`, and Firebase Admin values only for features you run locally. For push notifications, set `FIREBASE_ADMIN_ENABLED=true` and provide `FIREBASE_CREDENTIALS_PATH` or Application Default Credentials; optionally set `FIREBASE_PROJECT_ID`.

The frontend also has `frontend/.env.example` for Vite and Firebase client SDK values used by Storage/Cloud Messaging.

## Run Locally

Use the helper script on Windows/PowerShell:

```powershell
.\start-dev.ps1
```

Or start services manually:

```bash
cd backend-spring
mvn spring-boot:run
```

```bash
cd frontend
npm install
npm run dev
```

Python services remain independent:

```bash
cd rag-service
pip install -r requirements.txt
python main.py
```

```bash
cd cry-analysis
pip install -r requirements.txt
python main.py
```

## Authentication

- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Protected requests: `Authorization: Bearer <JWT>`
- Frontend token storage key: `aal_access_token`

## Verification

Run the main checks before handing off changes:

```bash
cd backend-spring
mvn test
```

```bash
cd frontend
npm run build
```

## Team Jhatpat

- Jay Paunikar
- Srushti Rokade
- Nikita Kapse
- Raj Kakade
