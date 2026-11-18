import { randomUUID } from 'node:crypto';
import { expect, type Page } from '@playwright/test';

const testPassword = 'TestSecurePass!2026';

export async function registerTestUser(
  page: Page,
  role: 'cliente' | 'estilista' | 'negocio' = 'cliente',
): Promise<{ email: string; password: string }> {
  const email = `playwright-${randomUUID()}@example.com`;

  await page.goto('/register');
  await page.getByLabel('Nombre completo').fill('Usuario E2E LookVibe');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña').fill(testPassword);
  await page.getByLabel('Tipo de cuenta').selectOption(role);
  await page.getByRole('button', { name: 'Registrarse' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);

  return { email, password: testPassword };
}
