# qa/

Carpeta con todos los archivos del equipo de Quality Assurance.

| Subcarpeta | Contenido | Archivos del Drive que van aquí |
|---|---|---|
| `Plan Maestro/` | Plan Maestro de Pruebas del proyecto (P-QA-09), con su historial de versiones | `Plan Maestro de Pruebas.docx` |
| `Casos Prueba/` | Casos de prueba (CP) diseñados a partir de las HU/RF, y Checklist de RF | `Casos_Prueba.xlsx`, `Checklist.xlsx` |
| `Bugs/` | Plantillas con registro y reporte de defectos encontrados | `Reporte_Bugs.xlsx` |
| `Evidencias/` | Capturas y vídeos que soportan la ejecución de pruebas manuales | Carpeta `Ejecucion de pruebas Manuales/RF-00X/...` (Aprobado / Bugs) |
| `Métricas/` | Indicadores de calidad y avance de pruebas | `Informe Checklist.docx`, `Matriz_Calidad_ISO...xlsx`, `Dashboard QA.xlsx` |

También van en la raíz de `qa/` (no encajan en una sola subcarpeta):
- `Matriz_Trazabilidad.xlsx`
- `Ejecucion_Pruebas.xlsx` (ejecución consolidada, distinta de las evidencias en bruto)

## Versionado
Cada documento de esta carpeta debe llevar su tabla de **Historial de Cambios** al inicio (versión, fecha, autor, descripción del cambio). Los archivos base se editan en su ubicación normal; al cerrar una versión estable, se copia a `Plan Maestro/Versiones/v1.0/`, `v1.1/`, etc. — nunca se sobrescribe una versión ya cerrada.
