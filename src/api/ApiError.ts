class ApiError extends Error {
  readonly status: number | null;
  readonly code: string | null;
  readonly fields?: Record<string, string>;

  constructor(
    message: string,
    status: number | null = null,
    code: string | null = null,
    fields?: Record<string, string>,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export default ApiError;
