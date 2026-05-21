import { Pool, type QueryResult, type QueryResultRow } from 'pg';
import config from '../config/index.js';

export const pool = new Pool({
  connectionString: config.connection_string,
});

export const query = async <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: ReadonlyArray<unknown>,
): Promise<QueryResult<T>> => {
  return pool.query<T>(text, params as unknown[]);
};

export const closePool = async (): Promise<void> => {
  await pool.end();
};
