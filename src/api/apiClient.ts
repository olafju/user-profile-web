import ApiError from './ApiError';
import API_URL from './config';

type ApiRequestOptions = RequestInit & {
  token?: string;
};

const getRequestUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${API_URL}${normalizedPath}`;
};

const getErrorMessage = async (response: Response) => {
  const fallbackMessage = `Request failed with status ${response.status}.`;
  const contentType = response.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    const message = await response.text();

    return message || fallbackMessage;
  }

  try {
    const body: unknown = await response.json();

    if (
      typeof body === 'object' &&
      body !== null
    ) {
      if ('details' in body && Array.isArray(body.details)) {
        const firstDetail: unknown = body.details[0];

        if (
          typeof firstDetail === 'object' &&
          firstDetail !== null &&
          'message' in firstDetail &&
          typeof firstDetail.message === 'string'
        ) {
          return firstDetail.message;
        }
      }

      if ('error' in body && typeof body.error === 'string') {
        return body.error;
      }

      if ('message' in body && typeof body.message === 'string') {
        return body.message;
      }
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
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
    throw new ApiError(await getErrorMessage(response), response.status);
  }

  return getResponseData<ResponseData>(response);
};

export default apiRequest;
