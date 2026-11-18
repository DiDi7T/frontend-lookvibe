# icesi-2026b-2026b-nextjs-taller-group-7
# LookVibe

LookVibe es una aplicación web que permite a los usuarios descubrir barberías y peluquerías, consultar sus servicios y estilistas, y gestionar sus reservas de citas.

## Tecnologías

- Next.js y React
- TypeScript
- NestJS (backend)
- PostgreSQL
- Vitest (pruebas unitarias)
- Playwright (pruebas E2E)

## Funcionalidades principales

- Registro, inicio y cierre de sesión.
- Autenticación y control de acceso según el rol del usuario.
- Búsqueda y consulta de barberías y peluquerías.
- Visualización de información, ubicación y horarios de los negocios.
- Administración de establecimientos.
- Gestión de servicios y estilistas.
- Consulta, creación y gestión de citas.

## Arquitectura

El frontend está organizado por funcionalidades dentro de `src/feature/`, siguiendo una arquitectura por capas:

- **Domain:** entidades, objetos de valor y reglas de negocio.
- **Application:** casos de uso y contratos de repositorios.
- **Infrastructure:** comunicación HTTP con el backend, DTO y mappers.
- **Presentation:** componentes de React y hooks.
- **DI:** contenedores para conectar las dependencias de cada funcionalidad.

También cuenta con:

- **`src/app/`:** rutas, páginas y layouts mediante App Router de Next.js.
- **`src/shared/`:** componentes, utilidades y cliente HTTP compartidos.

## Instalación y ejecución

Instalar las dependencias:

```bash
npm install
```

Iniciar el entorno de desarrollo:

```bash
npm run dev
```

Ejecutar la compilación de producción:

```bash
npm run build
```

Iniciar la aplicación compilada:

```bash
npm run start
```


## Pruebas

El proyecto cuenta con pruebas unitarias y pruebas end-to-end.

**Pruebas unitarias con Vitest:**

```bash
npm test
```

**Pruebas E2E con Playwright:**

```bash
npm run e2e
```

Para ejecutar las pruebas E2E, el backend NestJS debe estar ejecutándose por separado. Playwright inicia automáticamente el frontend.

**Resultados obtenidos:**

| Tipo de prueba | Aprobadas |
|---|---:|
| Unitarias | 52 |
| E2E | 4 |
| **Total** | **56** |

## Integración con el backend

La aplicación se comunica con una API desarrollada en NestJS mediante peticiones HTTP. La comunicación se centraliza a través de repositorios y del cliente HTTP compartido, manteniendo separada la lógica de negocio de los detalles de conexión.

## Herramientas de inteligencia artificial

Se utilizaron Claude y Google Gemini como herramientas de apoyo para consultas técnicas, análisis de errores y orientación durante el desarrollo. Las decisiones e implementación final estuvieron a cargo del equipo.

## Integrantes

- Nathalie Sanchez
- Samuel Gallego
- Diana M. G. Toro
