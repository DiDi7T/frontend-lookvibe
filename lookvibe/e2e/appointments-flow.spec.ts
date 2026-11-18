import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { registerTestUser } from './support/register-test-user';

test('un cliente abre sus citas e inicia una reserva', async ({ page }) => {
  await registerTestUser(page, 'cliente');

  await page.goto('/appointments');
  await expect(page.getByRole('heading', { name: 'Mis citas & turnos' })).toBeVisible();
  await page.getByRole('link', { name: 'Reservar', exact: true }).click();

  await expect(page).toHaveURL(/\/appointments\/new$/);
  await expect(page.getByRole('heading', { name: 'Selecciona tu servicio' })).toBeVisible();

  const query = `sin-negocio-${randomUUID()}`;
  await page.getByLabel('Busca un negocio por nombre o dirección').fill(query);
  await expect(page.getByText('No encontramos negocios con esa búsqueda.')).toBeVisible();
});
