export const getApiErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const res = (error as any).response;
    if (res?.data?.message) {
      return Array.isArray(res.data.message) ? res.data.message[0] : res.data.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong';
};

export const isPublishChecksError = (error: unknown): boolean => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const res = (error as any).response;
    return res?.data?.code === 'PUBLISH_CHECKS_FAILED';
  }
  return false;
};

export const isDraftConflict = (error: unknown): boolean => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const res = (error as any).response;
    return res?.data?.code === 'DRAFT_REVISION_CONFLICT';
  }
  return false;
};
