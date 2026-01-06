import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import integrationRoutes from './routes/integration.routes.js';
import videoRoutes from './routes/video.routes.js';
import postRoutes from './routes/post.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import aiRoutes from './routes/ai.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files with CORS headers
app.use('/uploads', (req, res, next) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
    next();
}, express.static(process.env.UPLOAD_DIR || './uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/webhook', webhookRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 ShortSync API running on http://localhost:${PORT}`);
});
