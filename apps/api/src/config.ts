import { config } from 'dotenv';
import { resolve } from 'path';
config();

export const NODE_ENV = process.env.NODE_ENV || 'development';

const envFile = NODE_ENV === 'development' ? '.env.development' : '.env';

config({ path: resolve(__dirname, `../${envFile}`) });
config({ path: resolve(__dirname, `../${envFile}.local`), override: true });

// Load all environment variables from .env file

export const PORT = process.env.PORT || 8000;
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const VERIFY_EMAIL_SECRET = process.env.VERIFY_EMAIL_SECRET || '';
export const JWT_SECRET = process.env.JWT_SECRET || '';
export const NODEMAILER_EMAIL = process.env.NODEMAILER_EMAIL || '';
export const NODEMAILER_PASSWORD = process.env.NODEMAILER_PASSWORD || '';
export const verification_url = process.env.VERIFICATION_URL || '';
export const forgot_password_url = process.env.FORGOT_PASSWORD_URL || '';
