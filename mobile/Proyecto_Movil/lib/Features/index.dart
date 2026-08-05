//exportar las rutas para que sean usadas en main
// publicas
export 'acceso_cliente/LandingPage_Screen.dart'; // OK 
export 'acceso_cliente/Login_Screen.dart'; // OK
export 'acceso_cliente/LoginAdminCode_Screen.dart'; // OK
export 'acceso_cliente/Registro_Screen.dart'; // OK
export 'acceso_cliente/Olvide_c_Screen.dart'; // OK
export 'acceso_cliente/D_producto_Screen.dart'; // OK
export 'acceso_cliente/Cambiar_contrasena_Screen.dart'; //OK
export 'acceso_cliente/Cambiar_datos_Screen.dart'; //OK
export 'acceso_cliente/Perfil_Screen.dart'; //OK
export 'acceso_cliente/Cliente_Screen.dart'; //OK //La campana de notificaciones deberia las notificaciones que se mandan con el FMC y que se borren luego de ser leidos
// Admin
export 'admin_inventario/EditarProducto_Screen.dart'; //OK
export 'admin_inventario/Entradas_Screen.dart'; //OK
export 'admin_inventario/GestionUsuarios_Screen.dart';//OK
export 'admin_inventario/Materiales_Screen.dart'; //OK 
export 'admin_inventario/Movimientos_Screen.dart'; //OK // talvez agregar que al precionarlo se vea la informacion del movimiento para ver mas informacion una mas detallada
export 'admin_inventario/PanelControl_Screen.dart'; // REPORTES OK - HISTORIAL VENTAS OK - NOFICACIONES, FALTA HACER EL FCM PARA NOTIFICACIONES DE STOCK BAJO, LAS DE PEDIDOS NUEVOS YA FUNCIONAN (AUNQUE NO CON LO PERSONALIZADOS, TOCA MIRAR ESO)
export 'admin_inventario/PedidosRealizados_Screen.dart'; //los personalizados no se ven los detalles, toca ponerle el tipo de tela y lo que selecciono el usuario, ademas en ambos es bueno poner el id de quiern realiza el pedido
export 'admin_inventario/PerfilAdmin_Screen.dart'; //OK
export 'admin_inventario/CambiarDatos_Screen.dart'; //OK
export 'admin_inventario/CambiarContrasena_Screen.dart'; //OK
export 'admin_inventario/Productos_Screen.dart'; //OK //falta filtrar por stock bajo. agotados y por categoria(amigurumis, sabanas, etc), eliminar/desactivar y que al editar se vea los detalles de clasificacion y categoria ademas del boton de eliminar/desactivar
export 'admin_inventario/RegistroProducto_Screen.dart'; //OK
export 'admin_inventario/Salidas_Screen.dart'; //OK

// cliente
export 'compras_personalizacion/Carrito_Screen.dart'; //OK 
export 'compras_personalizacion/Catalogo_Screen.dart'; //OK
export 'compras_personalizacion/Comprobante_Screen.dart'; //OK
export 'compras_personalizacion/DetalleProducto_Screen.dart'; //OK
export 'compras_personalizacion/PedidosPersonalizados_Screen.dart'; //OK
export 'compras_personalizacion/Personalizacion_Sabanas_Screen.dart'; // OK
export 'compras_personalizacion/Personalizacion_Cubrelechos_Screen.dart'; // OK
export 'compras_personalizacion/TicketPedido_Screen.dart'; //OK 