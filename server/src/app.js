import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());

import authRoutes from './routes/auth.route.js';
import noteRoutes from './routes/note.route.js';
import writingSessionRoutes from './routes/writingSession.route.js';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/sessions', writingSessionRoutes);


export default app;