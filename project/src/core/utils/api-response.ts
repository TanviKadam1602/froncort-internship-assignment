export class ApiResponse<T = any> {
  public readonly success: boolean;

  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly data: T | null = null,
    public readonly meta?: Record<string, any>
  ) {
    this.success = statusCode >= 200 && statusCode < 300;
  }

  static success<T>(data: T, message = 'Success', statusCode = 200, meta?: Record<string, any>): ApiResponse<T> {
    return new ApiResponse<T>(statusCode, message, data, meta);
  }

  static created<T>(data: T, message = 'Resource created successfully'): ApiResponse<T> {
    return new ApiResponse<T>(201, message, data);
  }
}
