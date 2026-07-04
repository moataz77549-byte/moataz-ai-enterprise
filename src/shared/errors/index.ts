export class ApplicationError extends Error {
  public readonly code: string;
  public readonly timestamp: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.timestamp = new Date().toISOString();
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApplicationError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} was not found.`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor() {
    super('UNAUTHORIZED', 'Authentication is required to access this resource.');
    this.name = 'UnauthorizedError';
  }
}
