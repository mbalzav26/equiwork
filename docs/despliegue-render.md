# Despliegue en Render (EquiWork)

## Requisitos

- Repositorio en GitHub, GitLab o Bitbucket con este proyecto.
- Cuenta en [Render](https://render.com).

## Pasos

1. Repositorio: [github.com/mbalzav26/equiwork](https://github.com/mbalzav26/equiwork) (rama `main`, sin `.env` ni `database/*.sqlite`).
2. En Render: **New → Blueprint** y selecciona el repo (usa el archivo `render.yaml` de la raíz).
3. En **Environment** del servicio, define obligatoriamente:
   - `ADMIN_INITIAL_PASSWORD` — contraseña del administrador (no la subas al repo).
   - Opcional: `ADMIN_INITIAL_EMAIL` (por defecto `admin@equiwork.local`).
4. Despliega. Al arrancar, la app:
   - sincroniza el esquema SQLite;
   - crea el catálogo base de actividades;
   - crea el usuario **Administrador** si no existe.

## Primer acceso

1. Abre la URL de Render (`https://tu-servicio.onrender.com/login`).
2. Inicia sesión con el correo y contraseña configurados.
3. Si `debe_cambiar_password` está activo, define una nueva contraseña.
4. Crea colaboradores y sus cuentas desde **Colaboradores** (no hay registro público).

## Notas

- Plan gratis: el servicio puede **dormir** tras inactividad; el disco es **efímero** (SQLite se reinicia en algunos redeploys). El arranque vuelve a crear el admin si la BD está vacía.
- Para datos persistentes a largo plazo, valorar MySQL externo y `DB_DIALECT=mysql` en Render.

## Comandos locales (referencia)

```bash
npm run db:sync
npm run db:seed:production   # solo admin + catálogo
npm run db:seed                # datos de demostración (desarrollo)
```