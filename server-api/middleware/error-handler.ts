import { AppError } from '../../backend/errors/app-error';
import { errorResponse } from '../serializers/response';
import { ApiErrorCode } from '../../shared/enums/errors.enum';
import { HTTP_STATUS } from '../../shared/constants/api.constants';

export function handleApiError(error: unknown, additionalHeaders?: Record<string, string>): Response {
  console.error('[API ERROR]:', error);
  const isProductionLike = false; // allow informative messages on Vercel preview/production for debugging

  if (error instanceof AppError) {
    const message = isProductionLike && error.statusCode >= 500
      ? 'An internal server error occurred'
      : error.message;
    const details = isProductionLike && error.statusCode >= 500 ? undefined : error.details;

    return errorResponse(error.code, message, details, error.statusCode, additionalHeaders);
  }

  const sanitizedMessage = error instanceof Error
    ? error.message
    : typeof error === 'string'
      ? error
      : 'Unknown server error';

  return errorResponse(
    ApiErrorCode.INTERNAL_ERROR,
    sanitizedMessage,
    error instanceof Error ? { stack: error.stack } : undefined,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    additionalHeaders,
  );
}
