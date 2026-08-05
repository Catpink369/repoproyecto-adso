import { SetMetadata } from '@nestjs/common';
import { Roles as RolesEnum } from '../enums/roles.enum';

export const ROLES_KEY = 'roles'; // llave de la etiqueta
export const Roles = (...roles: RolesEnum[]) => SetMetadata(ROLES_KEY, roles); // acepta uno o varios roles