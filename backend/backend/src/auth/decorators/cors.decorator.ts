import { applyDecorators, Header } from '@nestjs/common';
export function EnableCors(origin = 'http://localhost:5173') {
  return applyDecorators(
    Header('Access-Control-Allow-Origin', origin),
    Header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS'),
    Header('Access-Control-Allow-Headers', 'Content-Type, Authorization'),
    Header('Access-Control-Allow-Credentials', 'true'),
  );
}