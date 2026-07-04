import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { ApplicationError } from '@shared/errors';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

function createSuccessResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

function createErrorResponse(code: string, message: string, status = 500): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

async function parseRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body: unknown = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const message = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      return { success: false, response: createErrorResponse('VALIDATION_ERROR', message, 400) };
    }

    return { success: true, data: result.data };
  } catch {
    return { success: false, response: createErrorResponse('INVALID_BODY', 'Request body must be valid JSON.', 400) };
  }
}

function handleError(error: unknown): NextResponse {
  if (error instanceof ApplicationError) {
    return createErrorResponse(error.code, error.message, 400);
  }

  if (error instanceof ZodError) {
    const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    return createErrorResponse('VALIDATION_ERROR', message, 400);
  }

  console.error('Unhandled error:', error);
  return createErrorResponse('INTERNAL_ERROR', 'An unexpected error occurred.', 500);
}

export const BaseController = {
  success: createSuccessResponse,
  error: createErrorResponse,
  parseBody: parseRequestBody,
  handleError,
};
