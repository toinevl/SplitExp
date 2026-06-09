/**
 * API utilities for responses and error handling
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

export function errorResponse(error: string): ApiResponse<null> {
  return {
    success: false,
    error,
  };
}

/**
 * Validate required string field
 */
export function validateRequired(
  value: unknown,
  fieldName: string
): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return `${fieldName} is required`;
  }
  return null;
}

/**
 * Validate positive integer (in cents)
 */
export function validatePositiveInteger(
  value: unknown,
  fieldName: string
): string | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return `${fieldName} must be a positive integer`;
  }
  return null;
}

/**
 * Validate UUID format
 */
export function validateUUID(value: unknown, fieldName: string): string | null {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (typeof value !== "string" || !uuidRegex.test(value)) {
    return `${fieldName} must be a valid UUID`;
  }
  return null;
}

/**
 * Collect validation errors
 */
export function collectErrors(errors: (string | null)[]): string[] {
  return errors.filter((e): e is string => e !== null);
}
