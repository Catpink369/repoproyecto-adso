# qa/Evidencias/

Capturas de pantalla y vídeos que soportan cada caso de prueba ejecutado manualmente.

## Estructura
```
Evidencias/
├── RF-001/
│   └── RF-001.1/
│       ├── APROBADO/   (capturas de CP que pasaron)
│       └── BUGS/       (vídeos de CP que fallaron, referenciados por BUG-XXX)
├── RF-002/
...
```
Cada archivo de evidencia debe nombrarse referenciando el CP correspondiente (ej. `CP-003_login_exitoso.png`) para poder trazarlo desde `Ejecucion_Pruebas.xlsx`.
