import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import groqRoutes from './routes/groq.routes';
import sarvamRoutes from './routes/sarvam.routes';
import userRoutes from './routes/user.routes';
import { connectDatabase } from './config/database';
import callRoutes from './routes/callRoutes';
import cryRoutes from './routes/cry.routes';
import cryAnalysisRoutes from './routes/cry.analysis.routes';
import analyticsRoutes from './routes/analytics.routes';
import { initScheduler } from './services/scheduler';
import reminderRoutes from './routes/reminder.routes';
import notificationRoutes from './routes/notification.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import { startBackgroundJobs } from './utils/cron';
import { initNotificationScheduler } from './jobs/reminderNotificationScheduler';
import { seedMarketplace } from './utils/seeder';

const app: Application = express();

// Connect to Database
connectDatabase().then(() => {
    seedMarketplace(); // Auto-seed on DB connection
});

// Initialize Schedulers & Background Jobs
initScheduler();
initNotificationScheduler();
startBackgroundJobs();

// Security middleware
app.use(helmet());

// Trust proxy for production (Render, Heroku, etc.)
app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
    origin: config.allowedOrigins,
    credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv
    });
});

// API routes
app.use('/api/groq', groqRoutes);
app.use('/api/sarvam', sarvamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/call', callRoutes);
app.use('/api/cry', cryRoutes);
app.use('/api/cry-analysis', cryAnalysisRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🌸 Aal is Well - Backend Server                    ║
║                                                       ║
║   Status: Running                                     ║
║   Port: ${PORT}                                        ║
║   Environment: ${config.nodeEnv}                      ║
║   Time: ${new Date().toLocaleString()}                ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;
