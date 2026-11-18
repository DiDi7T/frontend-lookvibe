import { expect, test } from '@playwright/test';
import { registerTestUser } from './support/register-test-user';

test('una cuenta cliente no puede administrar negocios', async ({ page }) => {
  await registerTestUser(page, 'cliente');

  await page.goto('/businesses/manage');

  await expect(
    page.getByRole('heading', { name: 'No tienes acceso a esta sección' }),
  ).toBeVisible();
  await expect(
    page.getByText('Solo las cuentas con rol de negocio o administración pueden gestionar negocios.'),
  ).toBeVisible();
});
