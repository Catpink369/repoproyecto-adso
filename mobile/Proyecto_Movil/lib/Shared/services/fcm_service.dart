import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:proyecto_movil/Shared/services/api_service.dart';
import 'package:proyecto_movil/Shared/constants/app_constants.dart';

@pragma('vm:entry-point')
Future<void> _firebaseBackgroundHandler(RemoteMessage message) async {
    await Firebase.initializeApp();
    }

    class FcmService {
    static final _messaging = FirebaseMessaging.instance;
    static final _localNotif = FlutterLocalNotificationsPlugin();

    static const _channel = AndroidNotificationChannel(
        'gurama_channel',
        'Gurama Online',
        description: 'Notificaciones de pedidos y ofertas',
        importance: Importance.high,
    );

    /// Llama esto en main() después de Firebase.initializeApp()
    static Future<void> init() async {
        // Handler de fondo
        FirebaseMessaging.onBackgroundMessage(_firebaseBackgroundHandler);

        //  Crear canal Android
        await _localNotif
            .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
            ?.createNotificationChannel(_channel);

        //  Inicializar flutter_local_notifications
        const initSettings = InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
        );
        await _localNotif.initialize(initSettings);

        //  Pedir permisos (iOS y Android 13+)
        await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        );

        //  Escuchar mensajes en primer plano
        FirebaseMessaging.onMessage.listen(_mostrarNotificacionLocal);
    }

    /// Obtiene el token FCM y lo envía al backend para que pueda enviar notificaciones a este dispositivo. 
    static Future<void> registrarToken(String idUsuario) async {
        final token = await _messaging.getToken();
        if (token == null) return;

        await ApiService.post(
        '${AppConstants.baseUrl}/usuarios/$idUsuario/fcm-token',
        {'token': token},
        );

        _messaging.onTokenRefresh.listen((newToken) {
        ApiService.post(
            '${AppConstants.baseUrl}/usuarios/$idUsuario/fcm-token',
            {'token': newToken},
        );
        });
    }
    /// Suscribir a tópicos según el rol
    static Future<void> suscribirPorRol(String rol) async {
        if (rol == '2') {
        await _messaging.subscribeToTopic('ofertas');
        } else if (rol == '1' || rol == '3') {
        await _messaging.subscribeToTopic('pedidos_admin');
        }
    }

    /// Desuscribir al hacer logout
    static Future<void> desuscribirTodos() async {
        await _messaging.unsubscribeFromTopic('ofertas');
        await _messaging.unsubscribeFromTopic('pedidos_admin');
    }

    /// Muestra la notificación cuando la app está en primer plano
    static Future<void> _mostrarNotificacionLocal(RemoteMessage message) async {
        final notif = message.notification;
        if (notif == null) return;

        await _localNotif.show(
        notif.hashCode,
        notif.title,
        notif.body,
        NotificationDetails(
            android: AndroidNotificationDetails(
            _channel.id,
            _channel.name,
            channelDescription: _channel.description,
            importance: Importance.high,
            priority: Priority.high,
            icon: '@mipmap/ic_launcher',
            ),
        ),
        );
    }
}