import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import issuesRoutes from './modules/issues/issues.routes.js';
import notFound from './middleware/notFound.js';
import globalErrorHandler from './middleware/globalErrorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'DevPulse API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
