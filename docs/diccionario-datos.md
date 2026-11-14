# 5.5.4 Diccionario de datos

Características de los datos utilizados por el sistema EquiWork (SQLite / MySQL vía Sequelize).

---

**Tabla: colaboradores**

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| id | INT UNSIGNED (PK, AI) | No | Identificador único del colaborador. |
| nombres | VARCHAR(80) | No | Nombres del colaborador. |
| apellidos | VARCHAR(80) | No | Apellidos del colaborador. |
| email | VARCHAR(120) | No | Correo corporativo; único en la tabla. |
| cargo | VARCHAR(80) | No | Puesto o rol laboral desempeñado. |
| area | VARCHAR(80) | No | Área o dependencia organizacional. |
| activo | BOOLEAN | No | true = activo, false = inactivo (baja lógica). |
| created_at | DATETIME | No | Fecha y hora de creación del registro. |
| updated_at | DATETIME | No | Fecha y hora de la última modificación. |

---

**Tabla: quincenas**

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| id | INT UNSIGNED (PK, AI) | No | Identificador único de la quincena. |
| anio | SMALLINT UNSIGNED | No | Año calendario del periodo. |
| mes | TINYINT UNSIGNED | No | Mes del periodo (1 a 12). |
| numero_quincena | TINYINT UNSIGNED | No | 1 = primera quincena, 2 = segunda quincena. |
| fecha_inicio | DATE | No | Primer día del periodo quincenal. |
| fecha_fin | DATE | No | Último día del periodo quincenal. |
| created_at | DATETIME | No | Fecha y hora de creación del registro. |
| updated_at | DATETIME | No | Fecha y hora de la última modificación. |

*Restricción única:* (anio, mes, numero_quincena).

---

**Tabla: registros_quincenales**

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| id | INT UNSIGNED (PK, AI) | No | Identificador único del registro quincenal. |
| colaborador_id | INT UNSIGNED (FK) | No | Colaborador al que pertenece el registro; referencia a colaboradores.id. |
| quincena_id | INT UNSIGNED (FK) | No | Quincena asociada; referencia a quincenas.id. |
| estado | ENUM | No | BORRADOR = en edición, ENVIADO = cerrado o enviado. |
| observaciones | VARCHAR(500) | Sí | Comentarios opcionales sobre el registro. |
| created_at | DATETIME | No | Fecha y hora de creación del registro. |
| updated_at | DATETIME | No | Fecha y hora de la última modificación. |

*Restricción única:* (colaborador_id, quincena_id).

---

**Tabla: eventos**

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| id | INT UNSIGNED (PK, AI) | No | Identificador único del evento. |
| registro_quincenal_id | INT UNSIGNED (FK) | No | Registro quincenal padre; referencia a registros_quincenales.id. |
| tipo_evento | ENUM | No | ASIGNACION, REUNION, SOPORTE, CAPACITACION u OTRO. |
| descripcion | VARCHAR(255) | No | Descripción breve de la actividad realizada. |
| horas | DECIMAL(5,2) | No | Horas dedicadas (entre 0,25 y 24). |
| fecha_evento | DATE | No | Fecha en que ocurrió la actividad (dentro de la quincena). |
| nombre_empresa | VARCHAR(120) | Sí | Empresa o cliente (encuesta del colaborador). |
| direccion | VARCHAR(255) | Sí | Dirección del lugar de la actividad. |
| auxilio_transporte | BOOLEAN | No | Indica si solicita auxilio de transporte (default false). |
| comentarios_transporte | VARCHAR(500) | Sí | Detalle cuando auxilio_transporte es true. |
| created_at | DATETIME | No | Fecha y hora de creación del registro. |
| updated_at | DATETIME | No | Fecha y hora de la última modificación. |

---

**Tabla: usuarios**

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| id | INT UNSIGNED (PK, AI) | No | Identificador único del usuario del sistema. |
| email | VARCHAR(120) | No | Correo de acceso; único en la tabla. |
| password_hash | VARCHAR(255) | No | Contraseña almacenada como hash (bcrypt). |
| nombre | VARCHAR(100) | No | Nombre mostrado en la interfaz. |
| rol | ENUM | No | ADMINISTRADOR, SUPERVISOR o COLABORADOR. |
| colaborador_id | INT UNSIGNED (FK) | Sí | Colaborador vinculado (encuesta); referencia a colaboradores.id. |
| activo | BOOLEAN | No | true = acceso habilitado, false = cuenta deshabilitada. |
| created_at | DATETIME | No | Fecha y hora de creación del registro. |
| updated_at | DATETIME | No | Fecha y hora de la última modificación. |
