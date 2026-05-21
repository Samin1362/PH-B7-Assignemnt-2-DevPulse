import { Pool } from 'pg';
import config from '../config/index.js';

export const pool = new Pool({
  connectionString: config.connection_string,
});

export const closePool = async (): Promise<void> => {
  await pool.end();
};
