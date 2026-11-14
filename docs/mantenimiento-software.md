# 5.7.5 Mantenimiento del software

Tras el lanzamiento, EquiWork se mantiene con correcciones y mejoras incrementales sobre la arquitectura en capas: cada defecto se reproduce en local, se corrige en el módulo afectado (vista, controlador, servicio o repositorio) y se valida con Postman, prueba en navegador y regresión de los flujos principales antes de desplegar según 5.7.4.

Las mejoras se planifican por caso de uso; si cambian datos o pantallas, se actualiza `docs/` y se respalda la base antes de alterar el esquema. El mantenimiento preventivo incluye actualizar dependencias npm y revisar secretos en `.env`. Las solicitudes y soluciones quedan registradas en el historial del informe o en GitHub para trazabilidad.
