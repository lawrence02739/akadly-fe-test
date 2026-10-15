interface AxiosErrorLike {
  response?: {
    status?: number;
    data?: {
      message?: string | string[];
      error?: string;
      code?: string;
    };
  };
  message?: string;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'An unexpected error occurred',
): string {
  if (!error) return fallback;

  const err = error as AxiosErrorLike;
  const data = err.response?.data;

  if (data?.message) {
    if (Array.isArray(data.message)) {
      return data.message.join(', ');
    }
    return data.message;
  }

  if (data?.error) {
    return data.error;
  }

  if (err.message && typeof err.message === 'string') {
    return err.message;
  }

  return fallback;
}
