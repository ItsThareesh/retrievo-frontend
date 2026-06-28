export class APIError extends Error {
  constructor(
    public status: number,
    message?: string,
    public code?: string,
  ) {
    super(message || `API error: ${status}`);
    this.name = "APIError";
  }
}
