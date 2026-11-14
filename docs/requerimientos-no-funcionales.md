# 5.2.4 Requerimientos no funcionales

| Referencia | Tipo | Descripción |
|------------|------|-------------|
| RNF-01 | Usabilidad | El sistema debe presentar una interfaz web intuitiva que permita a un usuario con conocimientos básicos de informática completar cualquier operación de registro o consulta en un máximo de 3 pasos de navegación desde el menú lateral principal. |
| RNF-02 | Usabilidad | El sistema debe mostrar mensajes de confirmación y error claros ante cada acción (registro exitoso, validación de formulario, credenciales incorrectas), mediante alertas visuales diferenciadas en pantalla. |
| RNF-03 | Eficiencia | El sistema debe responder a las consultas habituales del dashboard, listados y reportes en un tiempo no mayor a 3 segundos bajo condiciones normales de uso con conexión estable. |
| RNF-04 | Eficiencia | El backend debe gestionar la conexión a la base de datos mediante un pool de conexiones Sequelize (MySQL en producción) para atender varias peticiones concurrentes sin abrir una conexión nueva por cada solicitud. |
| RNF-05 | Seguridad | El sistema debe autenticar usuarios mediante tokens JWT con expiración configurable (por defecto 8 horas), denegando el acceso a rutas web y API protegidas ante ausencia o invalidez del token. |
| RNF-06 | Seguridad | Las contraseñas deben almacenarse cifradas en base de datos con bcrypt (`password_hash`), sin posibilidad de recuperarlas en texto plano en ningún punto del sistema. |
| RNF-07 | Aspectos éticos | El sistema debe limitar la recolección y visualización de datos personales y laborales a lo necesario para el balance de carga quincenal, restringiendo consultas y exportaciones según el rol del usuario. |
| RNF-08 | Aspectos éticos | Los reportes y el panel de balance deben utilizarse para apoyar la gestión equitativa de la carga laboral, sin habilitar usos de vigilancia o sanción ajenos al propósito informado a los colaboradores. |
| RNF-09 | Aspectos regulatorios y legislativos | El tratamiento de datos personales de colaboradores debe alinearse con los principios de la Ley 1581 de 2012 (autorización, finalidad, circulación restringida y confidencialidad) en el marco del proyecto académico y del contexto organizacional. |
| RNF-10 | Aspectos regulatorios y legislativos | Solo personal autorizado (Administrador/Supervisor según función) debe acceder a datos identificables de terceros; el Colaborador solo consulta y modifica la información vinculada a su propia cuenta de encuesta. |
| RNF-11 | Aspectos regulatorios y legislativos | Los secretos de aplicación (JWT, sesión y credenciales de base de datos) deben configurarse en variables de entorno (`.env`) excluidas del repositorio, evitando exposición en código fuente o despliegues públicos. |
