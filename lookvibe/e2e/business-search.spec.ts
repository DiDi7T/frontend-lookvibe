import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';

test('busca negocios usando el filtro de nombre', async ({ page }) => {
  const query = `sin-resultados-${randomUUID()}`;

  await page.goto('/businesses');
  await expect(page.getByRole('heading', { name: 'Negocios de belleza' })).toBeVisible();

  await page.getByLabel('Nombre o dirección').fill(query);
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  await expect(page).toHaveURL(new RegExp(`[?&]q=${encodeURIComponent(query)}`));
  await expect(page.getByRole('heading', { name: 'No encontramos negocios' })).toBeVisible();

  await page.getByRole('button', { name: 'Limpiar' }).click();
  await expect(page).toHaveURL(/\/businesses$/);
  await expect(page.getByLabel('Nombre o dirección')).toHaveValue('');
});
