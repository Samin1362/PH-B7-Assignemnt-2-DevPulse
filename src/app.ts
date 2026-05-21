import express, {
  type Application,
  type Request,
  type Response,
} from 'express';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import notFound from './middleware/notFound.js';
import globalErrorHandler from './middleware/globalErrorHandler.js';

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

app.use(notFound);
app.use(globalErrorHandler);

export default app;
