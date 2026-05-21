import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || '5001',
  connection_string: process.env.CONNECTION_STRING as string,
  jwt_secret: process.env.JWT_SECRET as string,
  jwt_expires_in: process.env.JWT_EXPIRES_IN || '7d',
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
};
