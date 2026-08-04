# database/

Scripts de creación, migración y carga de la base de datos MySQL.

> Recordatorio del equipo: no usar `prisma migrate` sobre el esquema actual (rompe relaciones existentes). Flujo: SQL crudo → actualizar `schema.prisma` manualmente → `npx prisma generate`.
