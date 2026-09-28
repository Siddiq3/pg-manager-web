import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

/** Plain client for the auth endpoints: no token, but sends the refresh cookie. */
export const authPost = (path, body) => axios.post(`${API_URL}${path}`, body, { withCredentials: true });

/**
 * Turns an axios error into one line for the user. The API returns field-level
 * messages for validation failures, which are far more useful than the summary.
 */
export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.code === 'ERR_NETWORK') return 'Cannot reach the server. Check your connection and try again.';
  const data = error?.response?.data;
  const fieldErrors = data?.details?.fieldErrors;
  if (fieldErrors) {
    const messages = Object.values(fieldErrors).flat().filter(Boolean);
    if (messages.length) return messages.join(' ');
  }
  return data?.message || fallback;
}

/**
 * Authenticated client. On a 401 it retries once behind a single shared
 * refresh call, so ten parallel requests can't fire ten refreshes (which the
 * API would treat as token reuse and revoke every session).
 */
export function createApiClient({ getAccessToken, onRefreshed, onSessionLost }) {
  const client = axios.create({ baseURL: API_URL, withCredentials: true });
  let refreshing = null;

  client.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config;
      if (error.response?.status !== 401 || !original || original.__retried) throw error;
      original.__retried = true;

      refreshing = refreshing || authPost('/auth/refresh', {}).finally(() => { refreshing = null; });

      try {
        const { data } = await refreshing;
        onRefreshed(data);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return client.request(original);
      } catch (refreshError) {
        // The refresh token is gone or revoked: end the session instead of
        // leaving the app on a dashboard that can no longer load anything.
        onSessionLost();
        throw refreshError;
      }
    }
  );

  return client;
}
