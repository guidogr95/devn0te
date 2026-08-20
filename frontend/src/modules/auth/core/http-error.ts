export class HttpError extends Error {
  public statusCode?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public data: any;

  public code?: number;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(statusCode?: number, message?: string, data?: any, code?: number) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.code = code;
    this.name = "HttpError";
  }
}

export function isHttpError(error: unknown): error is HttpError {
	return error instanceof HttpError;
}

export type DomainErrorData = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  code?: number
}
