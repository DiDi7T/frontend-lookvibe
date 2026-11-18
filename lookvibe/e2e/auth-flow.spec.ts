import { expect, test } from '@playwright/test';
import { registerTestUser } from './support/register-test-user';

test('registra, cierra sesión e inicia sesión con una cuenta cliente', async ({ page }) => {
  const user = await registerTestUser(page);

  await expect(page.getByRole('heading', { name: 'Panel Principal' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();

  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole('banner').getByRole('link', { name: 'Iniciar sesión' }),
  ).toBeVisible();

  await page.goto('/login');
  await page.getByLabel('Correo electrónico').fill(user.email);
  await page.getByLabel('Contraseña').fill(user.password);
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Panel Principal' })).toBeVisible();
});
