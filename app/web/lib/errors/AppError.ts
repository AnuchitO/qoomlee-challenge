export class AppError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, "VALIDATION_ERROR", field ? { field } : undefined);
  }
}

export class NetworkError extends AppError {
  constructor(message: string, status?: number) {
    super(message, "NETWORK_ERROR", status ? { status } : undefined);
  }
}

export class ApiError extends AppError {
  constructor(message: string, status: number, details?: Record<string, unknown>) {
    super(message, "API_ERROR", { status, ...details });
  }
}
