import app from './app.js';
import config from './config/index.js';
import { closePool, pool } from './db/index.js';

const port = Number(config.port);

const bootstrap = async (): Promise<void> => {
  try {
    await pool.query('SELECT 1');
    console.log('PostgreSQL connection established');

    const server = app.listen(port, () => {
      console.log(`DevPulse API listening on port ${port}`);
    });

    const shutdown = async (signal: string): Promise<void> => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed');
      });
      await closePool();
      console.log('Database pool closed');
      process.exit(0);
    };

    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));

    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Rejection:', reason);
    });
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

void bootstrap();
