# Pruebas E2E

Los escenarios de `e2e/` prueban LookVibe desde el navegador: registro/login/logout,
restricción de acceso por rol, búsqueda del catálogo e inicio del flujo de reserva de citas.
No importan casos de uso, repositorios ni componentes internos de los features.

## Requisitos

- Tener disponible el backend NestJS.
- Configurar `NEXT_PUBLIC_API_URL` en `.env.local` con la URL del backend, por ejemplo:

  ```env
  NEXT_PUBLIC_API_URL=http://localhost:3001
  ```

- Instalar las dependencias y el navegador de Playwright una vez:

  ```bash
  npm install
  npx playwright install chromium
  ```

## Ejecutar

```bash
npm run e2e
```

Playwright inicia el frontend en `localhost:3000`. También se puede apuntar a un frontend
ya desplegado configurando `PLAYWRIGHT_BASE_URL`; en ese caso, Playwright no inicia un
servidor local.

Para comprobar que la suite se puede repetir:

```bash
npm run e2e && npm run e2e
```

Cada flujo crea su propio contexto de navegador y las cuentas usan correos aleatorios para
evitar colisiones entre ejecuciones. El backend conservará esas cuentas de prueba.
