/*
Aca lo que hice es basicamente centraliza
las solicitudes http como lo hace el repo del profe

*/
export class HttpError extends Error {
  constructor(
    //guarda el código de estado HTTP (ej: 400) y el
    //cuerpo del error que mandó el backend, y le asigna el nombre
    readonly status: number,
    readonly body: unknown,
  ) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
  }
}

export interface HttpClient {
    //Es una función fábrica (factory)
    //que crea y configura el cliente HTTP. 
    //Recibe la URL base del backend, 
    //una función para obtener el token actual, 
    //y una función de fetch opcional.
  get<T>(path: string): Promise<T>;
  getBlob(path: string): Promise<Blob>;
  post<T>(path: string, body: unknown): Promise<T>;
  put<T>(path: string, body: unknown): Promise<T>;
  patch<T>(path: string, body: unknown): Promise<T>;
  delete(path: string): Promise<void>;
}

interface Options {
  baseUrl: string;
  getToken: () => string | null;
  fetchFn?: typeof fetch;
}

export function createHttpClient({ baseUrl, getToken, fetchFn = (...args) => fetch(...args) }: Options): HttpClient {
  const request = async (method: string, path: string, body?: unknown): Promise<unknown> => {
    const token = getToken();
    let response: Response;
    try {
      response = await fetchFn(`${baseUrl}${path}`, {
        method,
        headers: {
          ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (cause) {
      throw new Error('Servicio no disponible');
    }

    const text = await response.text();
    const data = text ? safeJson(text) : undefined;

    if (response.status === 401) throw new Error('No autorizado');
    if (!response.ok) throw new HttpError(response.status, data);
    return data;
  };

  const requestBlob = async (path: string): Promise<Blob> => {
    const token = getToken();
    let response: Response;
    try {
      response = await fetchFn(`${baseUrl}${path}`, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      throw new Error('Servicio no disponible');
    }

    if (response.status === 401) throw new Error('No autorizado');
    if (!response.ok) {
      const text = await response.text();
      throw new HttpError(response.status, text ? safeJson(text) : undefined);
    }
    return response.blob();
  };

  return {
    get: <T>(path: string) => request('GET', path) as Promise<T>,
    getBlob: requestBlob,
    post: <T>(path: string, body: unknown) => request('POST', path, body) as Promise<T>,
    put: <T>(path: string, body: unknown) => request('PUT', path, body) as Promise<T>,
    patch: <T>(path: string, body: unknown) => request('PATCH', path, body) as Promise<T>,
    delete: async (path: string) => {
      await request('DELETE', path);
    },
  };
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
