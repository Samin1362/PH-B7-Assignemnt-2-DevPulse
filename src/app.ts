import express, {
  type Application,
  type Request,
  type Response,
} from 'express';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import notFound from './middleware/notFound.js';
import globalErrorHandler from './middleware/globalErrorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import issuesRoutes from './modules/issues/issues.routes.js';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'DevPulse API is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
