/**
 * Extracts a clean error message from a backend response or Error object.
 * Removes any "Error: " prefix and ensures a user-friendly string.
 */
export const getCleanErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';

  const status = error.response?.status || error.status;

  // 1. User-requested specialized error message for short or duplicated inputs (PRIORITY)
  if (status === 400 || status === 409) {
    return 'the response is too short or duplicated cannot analyse.';
  }

  // 2. Try to get message from backend response
  const backendMessage = error.response?.data?.message;
  if (backendMessage) return backendMessage;

  if (error.code === 'ERR_NETWORK') return 'Unable to connect to the server. Please check your internet.';
  if (status === 404) return 'The requested resource was not found.';
  if (status === 500) return 'Internal server error. Please try again later.';

  // 4. Strip "Error: " prefix, generic axios status messages and system tags like {api error}
  const rawMessage = error.message || String(error);
  return String(rawMessage)
    .replace(/^Error:\s*/i, '')
    .replace(/Request failed with status code \d+/i, '')
    .replace(/\{api error\}/gi, '')
    .replace(/\[api error\]/gi, '')
    .replace(/\s+/g, ' ')
    .trim() || 'Operation failed';
};

