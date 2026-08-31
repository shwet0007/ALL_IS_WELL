# AAL IS WELL - Project Details

## Project Overview

Aal Is Well is a full-stack maternal and infant care platform focused on preventive care, personalized routines, secure doctor connectivity, AI assistance, and emergency support.

The current repository uses Spring Boot as the only active application backend. React remains the frontend, MySQL is the application database, and Python services remain dedicated to RAG and cry analysis.

## Feature Breakdown

### Unified Parent Dashboard

- Pregnancy progress, trimester context, care guidance, and expected delivery context.
- Infant care modules for feeding, sleep, vaccination, and daily health routines.

### AI and ML Integration

- Groq-backed maternal and infant health assistant through Spring Boot.
- Sarvam speech-to-text and text-to-speech proxy endpoints through Spring Boot.
- Python RAG service for knowledge retrieval.
- Python cry-analysis service for infant audio classification.

### Medical and Care Tracking

- Schedules, reminders, notifications, diary entries, daily tasks, daily checkups, checkups, vaccinations, and medical reports.
- Spring Data JPA entities and repositories persist application data in MySQL.

### Doctor Connectivity

- Doctor discovery.
- Patient connection requests.
- Connected patient lists.
- Doctor notes and scheduled checkups.

### Safety

- Emergency call flow through the Spring Boot Twilio integration.
- Firebase Cloud Messaging can remain enabled for push notifications and device tokens.

## Technology Stack

### Frontend

- React 18
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React

### Backend

- Java 17+
- Spring Boot
- Spring MVC
- Spring Security
- JWT authentication
- BCrypt password hashing
- Spring Data JPA
- Hibernate
- MySQL
- WebClient integrations for Groq, Sarvam, RAG, and cry analysis
- Twilio emergency calls

### Specialized Services

- `rag-service/`: Python FastAPI service for retrieval-augmented guidance.
- `cry-analysis/`: Python ML service for infant cry analysis.

## Directory Layout

```text
HM035_HackMatrix-main/
├── frontend/                # React Vite frontend
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── lib/
│       └── pages/
├── backend-spring/          # Primary Spring Boot backend
│   └── src/main/java/com/aalliswell/
│       ├── config/
│       ├── controller/
│       ├── dto/
│       ├── entity/
│       ├── repository/
│       ├── security/
│       └── service/
├── rag-service/             # Python RAG microservice
├── cry-analysis/            # Python cry-analysis microservice
├── experiments/             # Research and prototypes
├── .env.example
└── start-dev.ps1
```

## Development Setup

Required local tooling:

- Java 17+
- Maven
- npm
- Python 3.9+
- MySQL

Backend:

```bash
cd backend-spring
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Main verification:

```bash
cd backend-spring
mvn test
```

```bash
cd frontend
npm run build
```

## Runtime Configuration

The Spring backend reads database, JWT, CORS, AI, Twilio, and Firebase Admin FCM configuration from environment variables. Firebase Auth is not used. See `.env.example` and `backend-spring/.env.example`.

The frontend points to the Spring backend with:

```env
VITE_API_URL=http://localhost:3001
```

## Team Jhatpat

- Jay Paunikar
- Srushti Rokade
- Nikita Kapse
- Raj Kakade
