import { describe, expect, it, vi } from 'vitest';
import { createHttpClient } from './http-client';

describe('HttpClient binary downloads', () => {
  it('sends the session token and returns the PDF as a blob', async () => {
    const fetchFn = vi.fn(async () => new Response('%PDF-1.4', {
      headers: { 'Content-Type': 'application/pdf' },
    }));
    const http = createHttpClient({
      baseUrl: 'https://api.lookvibe.test',
      getToken: () => 'session-token',
      fetchFn,
    });

    const pdf = await http.getBlob('/reportes/negocio/business-id/pdf');

    expect(fetchFn).toHaveBeenCalledWith(
      'https://api.lookvibe.test/reportes/negocio/business-id/pdf',
      { method: 'GET', headers: { Authorization: 'Bearer session-token' } },
    );
    expect(pdf.type).toBe('application/pdf');
    expect(await pdf.text()).toBe('%PDF-1.4');
  });
});