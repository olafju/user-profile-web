import ApiError from './ApiError';
import API_URL from './config';

type ApiRequestOptions = RequestInit & {
  token?: string;
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};


const getRequestUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${API_URL}${normalizedPath}`;
};


const getApiError = async (response: Response): Promise<ApiError> => {
  const fallbackMessage = `Request failed with status ${response.status}.`;
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    const message = await response.text();

    return new ApiError(message || fallbackMessage, response.status);
  }

  try {
    const body: unknown = await response.json();

    if (isObject(body)) {
      const error = body.error;

      // Nowy format błędów z etapu 2
      if (isObject(error) && typeof error.message === 'string') {

        const code = typeof error.code === 'string' ? error.code : null;

        const fields =
          isObject(error.fields) &&
          Object.values(error.fields).every(
            (value) => typeof value === 'string',
          )
            ? (error.fields as Record<string, string>)
            : undefined;

        return new ApiError(error.message, response.status, code, fields);
      }

      // Obsługa starszego formatu błędów
      if (Array.isArray(body.details)) {
        const firstDetail: unknown = body.details[0];

        if (isObject(firstDetail) && typeof firstDetail.message === "string") {
          return new ApiError(firstDetail.message, response.status);
        }
      }

      if (typeof body.error === "string") {
        return new ApiError(body.error, response.status);
      }

      if (typeof body.message === "string") {
        return new ApiError(body.message, response.status);
      }
    }
  } catch {
    return new ApiError(fallbackMessage, response.status);
  }

  return new ApiError(fallbackMessage, response.status);
};


const getResponseData = async <ResponseData>(response: Response) => {
  if (response.status === 204) {
    return undefined as ResponseData;
  }

  const responseText = await response.text();

  if (!responseText) {
    return undefined as ResponseData;
  }

  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    return JSON.parse(responseText) as ResponseData;
  }

  return responseText as ResponseData;
};

const apiRequest = async <ResponseData = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ResponseData> => {
  const { token, headers: customHeaders, ...requestOptions } = options;
  const headers = new Headers(customHeaders);

  headers.set('Accept', 'application/json');

  if (requestOptions.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(getRequestUrl(path), {
      ...requestOptions,
      headers,
    });
  } catch {
    throw new ApiError('Backend is unavailable.');
  }

  if (!response.ok) {
    throw await getApiError(response);
  }

  return getResponseData<ResponseData>(response);
};

export default apiRequest;
