import { defineConfig } from 'cypress';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../frontend/.env') });

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
  },
});