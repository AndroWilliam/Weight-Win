export type ApiError = { 
  success: false; 
  error: { 
    code: string; 
    message: string; 
    details?: unknown; 
    requestId?: string 
  } 
};

export type ApiOk<T> = { 
  success: true; 
  data: T; 
  requestId?: string 
};

export const ok = <T>(data: T, requestId?: string): ApiOk<T> => ({ 
  success: true, 
  data, 
  requestId 
});

export const fail = (
  code: string, 
  message: string, 
  details?: unknown, 
  requestId?: string
): ApiError => ({
  success: false, 
  error: { 
    code, 
    message, 
    details, 
    requestId 
  } 
});
