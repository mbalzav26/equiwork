# Plataforma tecnológica — desarrollo y mantenimiento

## PLATAFORMA TECNOLÓGICA DE DESARROLLO DE SISTEMAS

**SISTEMA DE INFORMACIÓN**

EquiWork: sistema web para gestión de colaboradores, registro de eventos quincenales, balance de carga laboral y reportes con visualización analítica.

**BASES DE DATOS**

Motores relacionales MySQL (producción) y SQLite (desarrollo), mediante ORM Sequelize, para usuarios, colaboradores, quincenas, registros quincenales y eventos. Herramientas de apoyo: scripts `db:sync` / `db:seed`, modelo relacional (DER) y diccionario de datos en el diseño; administración con cliente SQL o DBeaver según entorno.

**LENGUAJE**

Backend: JavaScript (Node.js ≥ 18 con Express). Presentación: EJS, HTML, CSS (Tailwind), JavaScript en cliente. Librerías: Chart.js (gráficos en dashboard y reportes), bcryptjs, jsonwebtoken, express-validator.

**SISTEMAS OPERATIVOS**

Microsoft Windows 10/11 (estación de desarrollo). Servidor de aplicación: Node.js sobre Windows o Linux en despliegue (VPS/nube).

---

## PLATAFORMA TECNOLÓGICA DE MANTENIMIENTO DE SISTEMAS

**SISTEMA DE INFORMACIÓN**

EquiWork: mismo aplicativo en operación, con módulos de administración (colaboradores, eventos, reportes) y encuesta del colaborador.

**DETALLE DE SOPORTE TECNOLÓGICO**

Monitoreo y respaldo: revisión de logs del proceso Node en consola o servicio del hosting; respaldo del esquema y datos (dump MySQL o copia del archivo SQLite) antes de cambios estructurales. Control de versiones con Git. Variables sensibles en `.env` (JWT, sesión, credenciales de BD).

Entorno de pruebas: Postman para validar peticiones HTTP a la API REST (`/api`); herramientas de desarrollo del navegador (DevTools) para verificar interfaz, peticiones fetch y errores de cliente. Pruebas de regresión manual por rol tras cada corrección o despliegue.
