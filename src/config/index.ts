import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.join(process.cwd(), '.env'),
});

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const config = {
  node_env: process.env['NODE_ENV'] ?? 'development',
  port: process.env['PORT'] ?? '5001',
  connection_string: requireEnv('CONNECTION_STRING'),
  jwt_secret: requireEnv('JWT_SECRET'),
  jwt_expires_in: process.env['JWT_EXPIRES_IN'] ?? '7d',
  bcrypt_salt_rounds: Number(process.env['BCRYPT_SALT_ROUNDS'] ?? 10),
};

export default config;
