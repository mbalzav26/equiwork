# 5.7.1 Integración del sistema de software

EquiWork integra tres capas en un solo despliegue: presentación (vistas EJS, assets y scripts del cliente), aplicación (Express con rutas web y API, controladores, servicios y middlewares) y persistencia (Sequelize con SQLite o MySQL). El desarrollo fue incremental: en cada iteración se incorporó un módulo funcional completo (login, dashboard, colaboradores, eventos, reportes y encuesta).

En todos los módulos se siguió el mismo patrón: rutas en `webRoutes`/`apiRoutes`, validación de entrada, flujo controlador → servicio → repositorio → modelo, prueba de endpoints (Postman) y enlace con EJS o `fetch` a `/api` con JWT. `config/database.js` centraliza el acceso a datos; `authMiddleware` y `errorHandler` cubren autenticación y errores de forma transversal. Tras cada integración se aplicaron pruebas de regresión manuales para no afectar lo ya estable.
