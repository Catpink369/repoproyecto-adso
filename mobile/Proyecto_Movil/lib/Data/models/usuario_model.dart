class UsuarioModel {
  final String idUsuario;
  final String nom1;
  final String? nom2;
  final String ape1;
  final String? ape2;
  final String correo;
  final String? telefono;
  final String? contrasena;
  final String? codigo;
  final String idRolUsuario;
  final String? tDoc;
  final String? imgPerfil;
  final String? codigoVisible;
  final String? resetCodigo;
  final String? resetExpira;
  final bool estado;

  UsuarioModel({
    required this.idUsuario,
    required this.nom1,
    this.nom2,
    required this.ape1,
    this.ape2,
    required this.correo,
    this.telefono,
    this.contrasena,
    this.codigo,
    required this.idRolUsuario,
    this.tDoc,
    this.imgPerfil,
    this.codigoVisible,
    this.resetCodigo,
    this.resetExpira,
    required this.estado,
  });

  // Nombre completo para mostrar en UI
  String get nombreCompleto => '$nom1${nom2 != null ? ' $nom2' : ''} $ape1${ape2 != null ? ' $ape2' : ''}';

  // Guards de rol
  bool get isAdmin    => idRolUsuario == '1';
  bool get isCliente  => idRolUsuario == '2';
  bool get isWorker   => idRolUsuario == '3';

  String get nombreRol {
    if (isAdmin) return 'Administrador';
    if (isWorker) return 'Trabajador';
    if (isCliente) return 'Cliente';
    return 'Usuario';
  }

  factory UsuarioModel.fromJson(Map<String, dynamic> json) {
    return UsuarioModel(
      idUsuario: json['id_usuario']?.toString() ?? '',
      nom1:           json['nom_1'] ?? '',
      nom2:           json['nom_2'],
      ape1:           json['ape_1'] ?? '',
      ape2:           json['ape_2'],
      correo:         json['correo'] ?? '',
      telefono:       json['telefono']?.toString(),
      contrasena:     json['contrasena'],
      codigo:         json['codigo'],
      idRolUsuario:   json['id_rol_usuario']?.toString() ?? '',
      tDoc:           json['t_doc'],
      imgPerfil:      json['img_perfil'],
      codigoVisible:  json['codigo_visible'],
      resetCodigo:    json['reset_codigo'],
      resetExpira:    json['reset_expira'],
      estado:         json['estado'] == true || json['estado'] == 'true' || json['estado'] == 1,
    );
  }

  Map<String, dynamic> toJson() => {
    'id_usuario':     idUsuario,
    'nom_1':          nom1,
    'nom_2':          nom2,
    'ape_1':          ape1,
    'ape_2':          ape2,
    'correo':         correo,
    'telefono':       telefono,
    'id_rol_usuario': idRolUsuario,
    't_doc':          tDoc,
    'img_perfil':     imgPerfil,
    'estado':         estado,
  };
}