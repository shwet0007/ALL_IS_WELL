# Aal is Well - Backend Server

Express Node.js backend for the Aal is Well maternal and infant care platform.

## 🚀 Features

- **Secure API Proxying**: Groq and Sarvam API keys secured server-side
- **Firebase Admin Integration**: Server-side authentication and Firestore operations
- **Rate Limiting**: Protects against abuse and manages API costs
- **Request Validation**: Input validation using express-validator
- **Error Handling**: Centralized error handling with detailed logging
- **TypeScript**: Full type safety throughout the codebase

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase service account JSON file
- Groq API key
- Sarvam API key

## 🛠️ Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
PORT=3001
NODE_ENV=development

# API Keys
GROQ_API_KEY=your_groq_api_key_here
SARVAM_API_KEY=your_sarvam_api_key_here

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_PATH=../aal-is-well-2a625-firebase-adminsdk-fbsvc-5878f386ec.json

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Firebase Service Account

Make sure the Firebase service account JSON file is in the root directory (one level up from `server/`).

## 🏃 Running the Server

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3001` with hot-reload enabled.

### Production Build

```bash
npm run build
npm start
```

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health status

### Groq AI Endpoints
- `POST /api/groq/chat` - Chat completions
- `POST /api/groq/schedule` - Generate personalized schedules
- `POST /api/groq/diet` - Generate diet plans
- `POST /api/groq/baby-diet` - Baby-specific diet plans
- `POST /api/groq/disease-awareness` - Disease information
- `POST /api/groq/vaccine-suggestions` - Vaccine schedules
- `POST /api/groq/pregnancy-checkups` - Pregnancy checkup schedules

### Sarvam Voice Endpoints
- `POST /api/sarvam/speech-to-text` - Voice transcription
- `POST /api/sarvam/text-to-speech` - Voice synthesis

### User Endpoints (Authenticated)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/diary` - Get diary entries
- `POST /api/users/diary` - Add diary entry

## 🔒 Authentication

Protected endpoints require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## 🚦 Rate Limits

- **General API**: 100 requests per 15 minutes
- **AI Endpoints**: 30 requests per 15 minutes
- **Generation Endpoints**: 10 requests per hour

## 📝 Example Requests

### Chat Completion

```bash
curl -X POST http://localhost:3001/api/groq/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What should I eat during pregnancy?",
    "language": "en",
    "userProfile": {
      "name": "Sarah",
      "role": "pregnant",
      "trimester": "2"
    }
  }'
```

### Generate Schedule

```bash
curl -X POST http://localhost:3001/api/groq/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "userProfile": {
      "name": "Sarah",
      "role": "pregnant",
      "trimester": "2",
      "medicalConditions": {
        "diabetes": true
      }
    }
  }'
```

## 🏗️ Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── env.ts           # Environment configuration
│   │   └── firebase.ts      # Firebase Admin setup
│   ├── middleware/
│   │   ├── auth.ts          # Authentication middleware
│   │   ├── errorHandler.ts # Error handling
│   │   └── rateLimiter.ts  # Rate limiting
│   ├── routes/
│   │   ├── groq.routes.ts   # Groq API routes
│   │   ├── sarvam.routes.ts # Sarvam API routes
│   │   └── user.routes.ts   # User routes
│   ├── services/
│   │   ├── groq.service.ts  # Groq business logic
│   │   └── sarvam.service.ts# Sarvam business logic
│   └── index.ts             # Main application
├── .env                     # Environment variables (not in git)
├── .env.example             # Environment template
├── package.json
└── tsconfig.json
```

## 🔧 Development

### Type Checking

TypeScript will check types during development. Fix any type errors before committing.

### Logging

- Development: Detailed logs with `morgan('dev')`
- Production: Standard combined logs

## 🚀 Deployment

1. Build the project: `npm run build`
2. Set environment variables on your hosting platform
3. Upload the Firebase service account JSON (keep it secure!)
4. Start the server: `npm start`

## 🛡️ Security Notes

- Never commit `.env` or Firebase service account JSON to git
- Keep API keys secure and rotate them regularly
- Use HTTPS in production
- Configure CORS properly for your frontend domain

## 👥 Team Jhatpat

Built with ❤️ for maternal and infant care.
