import { defineConfig } from 'cypress';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const cypressEnvPath = path.resolve(__dirname, 'cypress.env.json');
const cypressEnv = fs.existsSync(cypressEnvPath)
  ? JSON.parse(fs.readFileSync(cypressEnvPath, 'utf8'))
  : {};

/**
 * Cypress → FRONT (Docker :8080 o Vite :5173) → API :3000 → BD del backend.
 *
 * Pruebas automatizadas: backend DEBE usar gurama_test
 *   docker compose -f docker-compose.yml -f docker-compose.test.yml up -d
 *
 * App local normal: solo docker-compose.yml → guramaonline
 * Todo apagado / despliegue: Render + Vercel (BD producción)
 */
export default defineConfig({
  e2e: {
    baseUrl: cypressEnv.FRONT_URL || 'http://localhost:8080',
    numTestsKeptInMemory: 1,
    defaultCommandTimeout: 10000,
    env: {
      ...cypressEnv,
      FRONT_URL: cypressEnv.FRONT_URL || 'http://localhost:8080',
      API_URL: cypressEnv.API_URL || 'http://localhost:3000',
      API_KEY: cypressEnv.API_KEY || process.env.VITE_API_KEY || 'xyz123',
    },
    setupNodeEvents(on, config) {
      const api = config.env.API_URL || '';
      const front = config.env.FRONT_URL || config.baseUrl || '';
      if (/onrender\.com|vercel\.app/i.test(api) || /onrender\.com|vercel\.app/i.test(front)) {
        console.warn(
          '\n⚠️  Cypress apunta a producción. Para gurama_test usa localhost:8080 + docker-compose.test.yml\n',
        );
      } else {
        console.log(
          `\n✓ Cypress → front: ${front} | api: ${api}\n` +
            `  Asegura backend con DATABASE_URL=.../gurama_test (docker-compose.test.yml)\n`,
        );
      }
      return config;
    },
  },
});
