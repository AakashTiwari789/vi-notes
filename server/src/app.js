import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const origin = process.env.CLIENT_URL || 'http://localhost:5173';
const corsOptions = {
    origin,
    credentials: true,
};


const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

import authRoutes from './routes/auth.route.js';
import noteRoutes from './routes/note.route.js';
import writingSessionRoutes from './routes/writingSession.route.js';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/sessions', writingSessionRoutes);


export default app;