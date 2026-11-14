# 5.5.2 Definición de las entidades de datos

Enuncie y describa cada una de las entidades que pertenecen al diseño de la base de datos, mediante el uso de la siguiente tabla.

| Entidad | Descripción |
|---------|-------------|
| **usuarios** | Almacena las cuentas de acceso al sistema EquiWork. Registra correo electrónico, contraseña cifrada (`password_hash`), nombre visible, rol (`ADMINISTRADOR`, `SUPERVISOR` o `COLABORADOR`), estado activo/inactivo y, opcionalmente, la referencia al colaborador (`colaborador_id`) cuando el usuario corresponde a la encuesta de autoreporte. Soporta la autenticación JWT y el control de permisos por rol. |
| **colaboradores** | Representa el directorio de personas de la organización sobre las que se mide la carga laboral. Guarda nombres, apellidos, correo corporativo, cargo, área y si el registro está activo. Es la entidad maestra vinculada a registros quincenales, eventos (de forma indirecta) y, cuando aplica, a la cuenta de usuario tipo colaborador. |
| **quincenas** | Define los periodos de corte quincenal del sistema (año, mes, número de quincena 1 o 2, fecha de inicio y fecha de fin). Permite acotar en el tiempo el registro de eventos, el dashboard analítico y los reportes. Garantiza un solo registro por combinación año–mes–quincena. |
| **registros_quincenales** | Agrupa, para cada colaborador y cada quincena, el conjunto de actividades reportadas. Actúa como cabecera del periodo: estado del registro (`BORRADOR` o `ENVIADO`), observaciones opcionales y la unicidad colaborador–quincena. Los eventos detallados cuelgan de esta entidad. |
| **eventos** | Detalla cada actividad o imputación de tiempo dentro de un registro quincenal: tipo (`ASIGNACION`, `REUNION`, `SOPORTE`, `CAPACITACION`, `OTRO`), descripción, horas dedicadas y fecha del evento. Es la unidad mínima de medición de carga laboral que alimenta historiales, balance del dashboard y exportación de reportes. |

**Nota técnica:** el modelo se implementa con Sequelize sobre SQLite (desarrollo) o MySQL (producción). Las relaciones principales son: un colaborador puede tener muchos registros quincenales; una quincena muchos registros; un registro quincenal muchos eventos; un colaborador puede tener como máximo una cuenta de usuario asociada (`usuarios.colaborador_id`).
