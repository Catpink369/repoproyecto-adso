export class Usuario {
    id_usuario: string;
    nom_1: string;
    nom_2?: string;
    ape_1: string;
    ape_2?: string;
    correo: string;
    telefono: bigint;
    id_rol_usuario: string;
    t_doc: string;
    img_perfil?: string;
    codigo_visible?: string;
  // campos sensibles omitidos: contrasena, codigo
}