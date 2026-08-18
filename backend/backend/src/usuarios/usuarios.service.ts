import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';
import { TaskService } from '../task/task.service';

const SALT_ROUNDS = 10;

@Injectable()

export class UsuariosService {
  constructor(private prisma: PrismaService, private taskService: TaskService,) {}

  // --------------------------------------------------------
  // CREAR USUARIO
  // --------------------------------------------------------
  async create(dto: CreateUsuarioDto) {
    console.log('service - crear usuario:', JSON.stringify(dto));
    // hashear contraseña
    const hashedPassword = await bcrypt.hash(dto.contrasena, SALT_ROUNDS);

    // hashear código si es admin o trabajador
    let hashedCodigo: string | null = null;
    let codigoVisible: string | null = null;

    if (dto.codigo) {
      hashedCodigo = await bcrypt.hash(dto.codigo.toString(), SALT_ROUNDS);
      codigoVisible = dto.codigo.toString();
    }

    const rol = dto.id_rol_usuario || '1';

    return this.prisma.usuario.create({
      data: {
        id_usuario: dto.id_usuario,
        nom_1: dto.nom_1,
        nom_2: dto.nom_2 ?? null,
        ape_1: dto.ape_1,
        ape_2: dto.ape_2 ?? null,
        correo: dto.correo,
        telefono: Number(dto.telefono),
        contrasena: hashedPassword,
        codigo: hashedCodigo,
        codigo_visible: codigoVisible,
        id_rol_usuario: rol,
        t_doc: dto.t_doc as any,
        img_perfil: dto.img_perfil ?? null,
      },
    });
  }

  // --------------------------------------------------------
  // OBTENER TODOS LOS USUARIOS (solo admin)
  // --------------------------------------------------------
  async findAll(query : any) {
    console.log('service - todos los usuarios:', JSON.stringify(query));
    const usuarios = await this.prisma.usuario.findMany({
      select: {
        id_usuario: true,
        nom_1: true,
        nom_2: true,
        ape_1: true,
        ape_2: true,
        correo: true,
        telefono: true,
        id_rol_usuario: true,
        t_doc: true,
        img_perfil: true,
        codigo_visible: true,
        estado: true,
        // contrasena y codigo omitidos por seguridad
      },
    });
    return usuarios;
  }

  // --------------------------------------------------------
  // OBTENER UN USUARIO POR ID
  // --------------------------------------------------------
  async findOne(id_usuario: string) {
    console.log('service - detalle de usuario:', JSON.stringify({ id_usuario }));
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario },
      select: {
        id_usuario: true,
        nom_1: true,
        nom_2: true,
        ape_1: true,
        ape_2: true,
        correo: true,
        telefono: true,
        id_rol_usuario: true,
        t_doc: true,
        img_perfil: true,
        codigo_visible: true,
      },
    });

    if (!user) throw new NotFoundException(`Usuario ${id_usuario} no encontrado`);

    return user;
  }

  // --------------------------------------------------------
  // ACTUALIZAR USUARIO
  // --------------------------------------------------------
  async update(id_usuario: string, dto: UpdateUsuarioDto) {
    console.log('service - actualizar usuario:', { id_usuario, dto });
    
    // 1. Verificar que el usuario existe
    await this.findOne(id_usuario);

    // 2. Si se envía correo, verificar que no pertenezca a OTRO usuario
    if (dto.correo) {
      const usuarioConMismoCorreo = await this.prisma.usuario.findFirst({
        where: {
          correo: dto.correo,
          NOT: { id_usuario }, // Ignora al propio usuario que se está editando
        },
      });

      if (usuarioConMismoCorreo) {
        throw new ConflictException('El correo electrónico ya está registrado por otro usuario.');
      }
    }

    const data: any = { ...dto };

    if (dto.telefono !== undefined && dto.telefono !== null) {
      data.telefono = Number(dto.telefono);
    }

    // Hashear contraseña si se actualiza
    if (dto.contrasena) {
      data.contrasena = await bcrypt.hash(dto.contrasena, SALT_ROUNDS);
    }

    // Hashear código si se actualiza
    if (dto.codigo) {
      data.codigo = await bcrypt.hash(dto.codigo.toString(), SALT_ROUNDS);
      data.codigo_visible = dto.codigo.toString();
    }

    return this.prisma.usuario.update({
      where: { id_usuario },
      data,
    });
  }

  // --------------------------------------------------------
  // CAMBIAR CONTRASEÑA
  // --------------------------------------------------------
  async cambiarContrasena(id_usuario: string, contrasenaActual: string, nuevaContrasena: string) {
    console.log('service - cambiar contraseña:', JSON.stringify({ id_usuario, contrasenaActual, nuevaContrasena }));    
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario },
    });

    if (!user || !user.contrasena) throw new NotFoundException('Usuario no encontrado');

    const passwordMatch = await bcrypt.compare(contrasenaActual, user.contrasena);
    if (!passwordMatch) throw new BadRequestException('La contraseña actual es incorrecta');

    const hashedPassword = await bcrypt.hash(nuevaContrasena, SALT_ROUNDS);

    await this.prisma.usuario.update({
      where: { id_usuario },
      data: { contrasena: hashedPassword },
    });
    return { message: 'Contraseña actualizada exitosamente', success: true };
  }

// --------------------------------------------------------
// ACTUALIZAR IMAGEN DE PERFIL
// --------------------------------------------------------
  async actualizarImagen(id_usuario: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo');

    await this.findOne(id_usuario); // verifica que existe

    const ruta_imagen = `/uploads/perfiles/${file.filename}`;

    await this.prisma.usuario.update({
      where: { id_usuario },
      data: { img_perfil: ruta_imagen },
    });

    return {
      statusCode: 200,
      message: 'Imagen actualizada exitosamente',
      img_perfil: ruta_imagen,
    };
  }

  // --------------------------------------------------------
  // SOLICITAR RESET DE CONTRASEÑA
  // --------------------------------------------------------
  async solicitarReset(correo: string) {
      const user = await this.prisma.usuario.findFirst({
          where: { correo },
      });

      if (!user) throw new NotFoundException('No existe un usuario con ese correo');

      const codigo = Math.floor(100000 + Math.random() * 900000).toString();

      // Guardar código visible temporalmente en codigo_visible
      await this.prisma.usuario.update({
          where: { id_usuario: user.id_usuario },
          data: { codigo_visible: codigo },
      });

      await this.taskService.enviarCodigoReset(correo, codigo);

      return { message: 'Código enviado a tu correo' };
  }

  // --------------------------------------------------------
  // RESET DE CONTRASEÑA
  // --------------------------------------------------------
  async resetContrasena(correo: string, codigo: string, nuevaContrasena: string) {
      const user = await this.prisma.usuario.findFirst({
          where: { correo },
      });

      if (!user) throw new NotFoundException('Usuario no encontrado');
      if (!user.codigo_visible) throw new BadRequestException('No hay solicitud de reset activa');
      if (user.codigo_visible !== codigo) throw new BadRequestException('Código incorrecto');

      const hashedPassword = await bcrypt.hash(nuevaContrasena, SALT_ROUNDS);

      await this.prisma.usuario.update({
          where: { id_usuario: user.id_usuario },
          data: {
              contrasena: hashedPassword,
              codigo_visible: null,
          },
      });

      return { message: 'Contraseña actualizada exitosamente', success: true };
  }

// --------------------------------------------------------
  // TOGGLE ESTADO (ACTIVO/INACTIVO)
  // --------------------------------------------------------
    async remove(id: string) {
    // Verificar si el usuario existe antes de actualizar/eliminar
    const usuario = await this.findOne(id);
    if (!usuario) {
      return null;
    }
  
    // Ejemplo para realizar un borrado lógico (desactivar usuario):
    return await this.prisma.usuario.update({
      where: { id_usuario: id },
      data: { estado: 0 },
    });
  
    // O si deseas realizar un borrado físico directamente:
    // return await this.prisma.usuario.delete({ where: { id_usuario: id } });
  }
  
  async toggleEstado(id: string) {
  const usuario = await this.prisma.usuario.findUnique({
    where: { id_usuario: id },
    select: { 
      id_usuario: true,
      correo: true,
      estado: true 
    } 
  });

  if (!usuario) {
    throw new NotFoundException('Usuario no encontrado');
  }

  if (usuario.correo === 'valruiz@gmail.com') {
    throw new BadRequestException('El administrador principal (valruiz@gmail.com) no puede ser desactivado.');
  }

  //Determina el nuevo estado: si es 1 (activo), lo cambia a 0 (inactivo) y viceversa
  const nuevoEstado = usuario.estado === 1 ? 0 : 1;

  return this.prisma.usuario.update({
    where: { id_usuario: id },
    data: { estado: nuevoEstado },
  });
}

// --------------------------------------------------------
// GUARDAR TOKEN FCM
// --------------------------------------------------------
  async guardarFcmToken(id_usuario: string, token: string) {
      await this.findOne(id_usuario); // verifica que existe

      return this.prisma.usuario.update({
          where: { id_usuario },
          data: { fcm_token: token },
      });
  }
}