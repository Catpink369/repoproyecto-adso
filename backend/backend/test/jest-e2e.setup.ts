import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.test'), override: true });

// Fix de serialización de BigInt - necesario porque los tests e2e arman la app
(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};